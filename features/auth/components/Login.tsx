"use client"

import { useState } from "react"
import Link from "next/link"
import { Controller, useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { AnimatePresence, motion, type Variants } from "motion/react"
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react"
import { LogoBarion } from "@shared/components/brand/LogoBarion"
import { Button, buttonVariants } from "@shared/components/ui/button"
import { cn } from "@shared/utils/cn"
import { Checkbox } from "@shared/components/ui/checkbox"
import { Field, FieldError, FieldLabel } from "@shared/components/ui/field"
import { Input } from "@shared/components/ui/input"
import { env } from "@config/env"
import { LogoGoogle } from "@shared/components/brand/LogoGoogle"
import { esquemaLogin, type DatosLogin } from "@features/auth/schemas/auth.schema"

interface LoginProps {
  onSubmit: (datos: DatosLogin) => Promise<void>
  cargando?: boolean
  error?: string | null
}

// La tarjeta entra con resorte desde abajo y sale hacia arriba al autenticar.
const tarjeta: Variants = {
  oculto: { opacity: 0, y: 56, scale: 0.94 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 150,
      damping: 19,
      staggerChildren: 0.09,
      delayChildren: 0.12,
    },
  },
  salida: {
    opacity: 0,
    y: -48,
    scale: 0.96,
    transition: { duration: 0.35, ease: "easeIn" },
  },
}

const bloque: Variants = {
  oculto: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 24 } },
}

// Presentacional: el padre (app/page.tsx) entrega el submit y el estado por props.
export function Login({ onSubmit, cargando, error }: LoginProps) {
  const [verContrasena, setVerContrasena] = useState(false)
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<DatosLogin>({
    resolver: standardSchemaResolver(esquemaLogin),
    defaultValues: { correo: "", contrasena: "", recordarme: true },
  })

  const enviar = handleSubmit(async (datos) => {
    await onSubmit(datos)
  })

  const deshabilitado = isSubmitting || !!cargando

  return (
    <motion.div
      className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card/85 shadow-xl backdrop-blur-xl"
      variants={tarjeta}
      initial="oculto"
      animate="visible"
      exit="salida"
    >
      {/* Cinta de barbero — sello de la marca en la cabecera del ticket */}
      <motion.div
        className="cinta-barberia h-1.5 w-full origin-left"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1, transition: { duration: 0.6, ease: "easeOut", delay: 0.25 } }}
        aria-hidden
      />

      <div className="p-8 sm:p-10">
        <motion.div variants={bloque}>
          <div className="flex items-start justify-between">
            <LogoBarion variante="icono" priority className="h-14" />
            <span className="flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-(--exito)" aria-hidden />
              En línea
            </span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-foreground">Panel administrativo</h2>
          <p className="mt-1.5 text-base text-muted-foreground">
            Bienvenido de vuelta. Tu barbería te espera.
          </p>
        </motion.div>

        <form className="mt-8 space-y-5" onSubmit={enviar} noValidate>
          <motion.div variants={bloque}>
            <Field data-invalid={!!errors.correo}>
              <FieldLabel htmlFor="correo">Correo electrónico</FieldLabel>
              <Input
                id="correo"
                type="email"
                autoComplete="email"
                placeholder="tu@barberia.mx"
                aria-invalid={!!errors.correo}
                className="h-11"
                {...register("correo")}
              />
              <FieldError errors={[errors.correo]} />
            </Field>
          </motion.div>

          <motion.div variants={bloque}>
            <Field data-invalid={!!errors.contrasena}>
              <FieldLabel htmlFor="contrasena">Contraseña</FieldLabel>
              <div className="relative">
                <Input
                  id="contrasena"
                  type={verContrasena ? "text" : "password"}
                  autoComplete="current-password"
                  aria-invalid={!!errors.contrasena}
                  className="h-11 pr-11"
                  {...register("contrasena")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setVerContrasena(!verContrasena)}
                  aria-label={verContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute top-1/2 right-1 -translate-y-1/2"
                >
                  {verContrasena ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
                </Button>
              </div>
              <FieldError errors={[errors.contrasena]} />
            </Field>
          </motion.div>

          <motion.div className="flex items-center justify-between text-sm" variants={bloque}>
            <label
              htmlFor="recordarme"
              className="flex cursor-pointer items-center gap-2 text-muted-foreground"
            >
              <Controller
                control={control}
                name="recordarme"
                render={({ field }) => (
                  <Checkbox
                    id="recordarme"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              Recordarme
            </label>
            <Button type="button" variant="link" size="sm" className="px-0 text-sm">
              ¿Olvidaste tu contraseña?
            </Button>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.p
                role="alert"
                className="text-xs text-destructive"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.div variants={bloque}>
            <motion.div whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.01 }}>
              <Button
                type="submit"
                disabled={deshabilitado}
                className="mt-2 h-11 w-full text-sm font-semibold"
              >
                {deshabilitado ? (
                  <Loader2 className="animate-spin" aria-hidden />
                ) : (
                  <>
                    Abrir el panel <ArrowRight aria-hidden />
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>
        </form>

        <motion.div className="mt-6" variants={bloque}>
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-border" aria-hidden />
            <span className="text-xs text-muted-foreground">o</span>
            <span className="h-px flex-1 bg-border" aria-hidden />
          </div>

          {/* Enlace y no botón con fetch: el acceso con Google es una NAVEGACIÓN
              del navegador hasta Google y de vuelta a la API, que es quien deja
              la cookie. Una petición desde el código no puede seguir ese viaje. */}
          <a
            href={`${env.apiUrl}/auth/oauth/google`}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "mt-4 h-11 w-full text-sm font-medium"
            )}
          >
            <LogoGoogle aria-hidden />
            Continuar con Google
          </a>
        </motion.div>

        <motion.p className="mt-7 text-center text-sm text-muted-foreground" variants={bloque}>
          ¿No tienes cuenta?{" "}
          <Button variant="link" size="sm" className="px-0 text-sm">
            Registra tu barbería gratis
          </Button>
        </motion.p>
      </div>

      {/* Borde perforado tipo ticket de turno */}
      <motion.div className="relative" variants={bloque}>
        <div className="absolute -top-2 -left-2 h-4 w-4 rounded-full border border-border bg-background" />
        <div className="absolute -top-2 -right-2 h-4 w-4 rounded-full border border-border bg-background" />
        <div className="border-t border-dashed border-border" />
        <div className="px-8 pt-5 pb-6 text-center sm:px-10">
          <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
            Acceso demo
          </p>
          <Link
            href="/dashboard"
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            Entrar sin credenciales <ArrowRight className="h-3 w-3" aria-hidden />
          </Link>
        </div>
      </motion.div>
    </motion.div>
  )
}
