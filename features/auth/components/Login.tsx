"use client"

import { useState } from "react"
import Link from "next/link"
import { Controller, useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { AnimatePresence, motion, type Variants } from "motion/react"
import { ArrowRight, Eye, EyeOff, Loader2, Store } from "lucide-react"
import { LogoBarion } from "@shared/components/brand/LogoBarion"
import { Button, buttonVariants } from "@shared/components/ui/button"
import { cn } from "@shared/utils/cn"
import { Checkbox } from "@shared/components/ui/checkbox"
import { Field, FieldError, FieldLabel } from "@shared/components/ui/field"
import { Input } from "@shared/components/ui/input"
import { env } from "@config/env"
import { rutasPublicas } from "@routes/rutasPublicas"
import { LogoGoogle } from "@shared/components/brand/LogoGoogle"
import { esquemaLogin, type DatosLogin } from "@features/auth/schemas/auth.schema"

interface LoginProps {
  onSubmit: (datos: DatosLogin) => Promise<void>
  cargando?: boolean
  error?: string | null
  /**
   * Barbería por cuya puerta se entra. Viene de la RUTA, nunca de un campo del
   * formulario: aquí solo se reenvía al acceso con Google para que la vuelta
   * sepa a dónde entrar. Ausente en la puerta global.
   */
  slug?: string
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
export function Login({ onSubmit, cargando, error, slug }: LoginProps) {
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
            {/*
              La puerta dice de QUIÉN es. Entrar por `/b/{slug}/entrar` y por la
              puerta global se veía exactamente igual, así que quien llega desde
              el enlace de su barbería no tenía forma de saber a dónde está
              entrando — y eso importa justo cuando alguien trabaja en dos.
              Sin slug se conserva el indicador de siempre.
            */}
            {slug ? (
              <span className="flex max-w-[55%] items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                <Store className="size-3.5 shrink-0" aria-hidden />
                <span className="truncate">{slug}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-xs font-medium tracking-widest text-muted-foreground uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-(--exito)" aria-hidden />
                En línea
              </span>
            )}
          </div>
          <h2 className="mt-6 text-2xl font-bold text-balance text-foreground sm:text-3xl">
            {slug ? "Entra a tu barbería" : "Panel administrativo"}
          </h2>
          <p className="mt-1.5 text-base text-pretty text-muted-foreground">
            {slug
              ? "Con tu correo y tu contraseña. El mismo correo puede trabajar en más de una barbería: la puerta decide a cuál entras."
              : "Bienvenido de vuelta. Tu barbería te espera."}
          </p>
        </motion.div>

        {/*
          ── `suppressHydrationWarning` en el formulario y en sus dos campos ──
          El gestor de contraseñas de Google/Chrome les mete un atributo propio
          (`__gcruniqueid`) ANTES de que React hidrate, así que el HTML del
          servidor y el del navegador dejan de coincidir y React lo denuncia con
          un error de hidratación enorme. No es un fallo de este código y no hay
          nada que arreglar en él: el atributo lo pone un tercero sobre el que no
          mandamos, y pasa sobre todo en móvil al volver del acceso con Google.

          Se silencia SOLO aquí —el atributo solo aparece en campos de
          credenciales— y elemento por elemento, porque la supresión no se hereda
          a los hijos. Lo que se pierde a cambio es la denuncia de un desajuste
          real en estos tres nodos, que es un precio pequeño frente a un error de
          consola que aparece en cada inicio de sesión y tapa a los de verdad.
        */}
        <form className="mt-8 space-y-5" onSubmit={enviar} noValidate suppressHydrationWarning>
          <motion.div variants={bloque}>
            <Field data-invalid={!!errors.correo}>
              <FieldLabel htmlFor="correo">Correo electrónico</FieldLabel>
              <Input
                id="correo"
                type="email"
                autoComplete="email"
                suppressHydrationWarning
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
                  suppressHydrationWarning
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
            {/* El enlace real de recuperación va debajo, con el slug de la
                puerta. Aquí había un botón con el mismo texto y sin destino */}
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

          {/* Quien perdió su clave necesita salir de aquí, no volver a probar. */}
          <motion.div variants={bloque} className="-mt-1 flex justify-end">
            <Link
              href={slug ? `/recuperar?slug=${encodeURIComponent(slug)}` : "/recuperar"}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </motion.div>

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
            href={`${env.apiUrl}/auth/oauth/google${slug ? `?slug=${encodeURIComponent(slug)}` : ""}`}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "mt-4 h-11 w-full text-sm font-medium"
            )}
          >
            <LogoGoogle aria-hidden />
            Continuar con Google
          </a>
        </motion.div>

        {/* El alta abierta es de ESTA aplicación (`/registro`), así que va con
            next/link. Estuvo como botón sin destino: el sitio parecía tener
            registro y la única forma de llegar era teclear la dirección */}
        <motion.p className="mt-7 text-center text-sm text-muted-foreground" variants={bloque}>
          ¿No tienes cuenta?{" "}
          <Link
            href={rutasPublicas.registro}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Registra tu barbería gratis
          </Link>
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
