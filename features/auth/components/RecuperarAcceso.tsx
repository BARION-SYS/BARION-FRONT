"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { motion, type Variants } from "motion/react"
import { ArrowLeft, Loader2, MailCheck } from "lucide-react"
import { LogoBarion } from "@shared/components/brand/LogoBarion"
import { Button } from "@shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@shared/components/ui/field"
import { Input } from "@shared/components/ui/input"
import { useTextos } from "@shared/textos/useTextos"
import {
  esquemaSolicitudRecuperacion,
  type DatosSolicitudRecuperacion,
} from "@features/auth/schemas/auth.schema"
import { erroresDe } from "@features/auth/schemas/errores"

interface RecuperarAccesoProps {
  cargando?: boolean
  /** Ya se pidió el enlace: la pantalla pasa a confirmar, no a repetir. */
  enviado: boolean
  /** A dónde vuelve el enlace de «atrás»: la puerta desde la que se llegó. */
  volverA: string
  onSubmit: (datos: DatosSolicitudRecuperacion) => Promise<void>
}

const tarjeta: Variants = {
  oculto: { opacity: 0, y: 40, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 150, damping: 20, staggerChildren: 0.08 },
  },
}

const bloque: Variants = {
  oculto: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 24 } },
}

/**
 * Pedir el enlace para volver a entrar.
 *
 * La respuesta es siempre la misma, exista o no ese correo, así que la pantalla
 * no promete que el mensaje va en camino: dice qué pasará SI esa cuenta existe.
 * Prometer de más aquí convertiría el formulario en un directorio de quién tiene
 * cuenta en Barion.
 */
export function RecuperarAcceso({ cargando, enviado, volverA, onSubmit }: RecuperarAccesoProps) {
  const t = useTextos()
  const esquema = useMemo(() => esquemaSolicitudRecuperacion(erroresDe(t)), [t])
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DatosSolicitudRecuperacion>({
    resolver: standardSchemaResolver(esquema),
    defaultValues: { email: "" },
  })

  const enviando = cargando || isSubmitting

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-4">
      <motion.div
        variants={tarjeta}
        initial="oculto"
        animate="visible"
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg sm:p-8"
      >
        <motion.div variants={bloque} className="flex flex-col items-center gap-4 text-center">
          <LogoBarion variante="icono" priority />
          {enviado ? (
            <>
              <span className="flex size-11 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--exito)_14%,transparent)]">
                <MailCheck className="size-5 text-(--exito)" aria-hidden />
              </span>
              <div className="flex flex-col gap-1.5">
                <h1 className="text-lg font-semibold">{t("auth.recuperar.enviadoTitulo")}</h1>
                <p className="text-sm text-muted-foreground">
                  {t("auth.recuperar.enviadoDescripcion")}
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-1.5">
              <h1 className="text-lg font-semibold">{t("auth.recuperar.titulo")}</h1>
              <p className="text-sm text-muted-foreground">{t("auth.recuperar.descripcion")}</p>
            </div>
          )}
        </motion.div>

        {!enviado && (
          <motion.form
            variants={bloque}
            onSubmit={(e) => void handleSubmit(onSubmit)(e)}
            className="mt-6 flex flex-col gap-4"
          >
            <Field>
              <FieldLabel htmlFor="email">{t("auth.recuperar.correo")}</FieldLabel>
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder={t("auth.login.correoPlaceholder")}
                aria-invalid={Boolean(errors.email)}
                {...register("email")}
              />
              {errors.email && <FieldError>{errors.email.message}</FieldError>}
            </Field>

            <Button type="submit" disabled={enviando} className="h-10 w-full">
              {enviando && <Loader2 className="size-4 animate-spin" aria-hidden />}
              {t("auth.recuperar.enviar")}
            </Button>
          </motion.form>
        )}

        <motion.div variants={bloque} className="mt-6 flex justify-center">
          <Link
            href={volverA}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden />
            {t("auth.recuperar.volver")}
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
