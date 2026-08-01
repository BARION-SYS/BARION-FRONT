"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { motion, type Variants } from "motion/react"
import { Eye, EyeOff, Loader2, ShieldAlert } from "lucide-react"
import { LogoBarion } from "@shared/components/brand/LogoBarion"
import { Button } from "@shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@shared/components/ui/field"
import { Input } from "@shared/components/ui/input"
import {
  esquemaNuevaContrasena,
  type DatosNuevaContrasena,
} from "@features/auth/schemas/auth.schema"

interface NuevaContrasenaProps {
  /** Sin token no hay nada que hacer: el enlace llegó incompleto. */
  tokenPresente: boolean
  cargando?: boolean
  /** El enlace no sirve —caducó, ya se usó, no existe— o falló el envío. */
  error?: string | null
  onSubmit: (datos: DatosNuevaContrasena) => Promise<void>
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
 * Elegir la contraseña nueva con el enlace del correo.
 *
 * El token no es un campo: viaja en la dirección y lo entrega la página. Un
 * enlace inservible se explica una vez y se ofrece pedir otro — un error sin
 * salida deja a la persona igual de fuera que antes.
 */
export function NuevaContrasena({
  tokenPresente,
  cargando,
  error,
  onSubmit,
}: NuevaContrasenaProps) {
  const [verContrasena, setVerContrasena] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DatosNuevaContrasena>({
    resolver: standardSchemaResolver(esquemaNuevaContrasena),
    defaultValues: { contrasenaNueva: "", confirmacion: "" },
  })

  const enviando = cargando || isSubmitting
  const tipo = verContrasena ? "text" : "password"

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-4">
      <motion.div
        variants={tarjeta}
        initial="oculto"
        animate="visible"
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg sm:p-8"
      >
        <motion.div variants={bloque} className="flex flex-col items-center gap-4 text-center">
          <LogoBarion variante="icono" />
          <div className="flex flex-col gap-1.5">
            <h1 className="text-lg font-semibold">Elige tu contraseña</h1>
            <p className="text-sm text-muted-foreground">
              La anterior deja de servir en cuanto guardes esta.
            </p>
          </div>
        </motion.div>

        {tokenPresente ? (
          <motion.form
            variants={bloque}
            onSubmit={(e) => void handleSubmit(onSubmit)(e)}
            className="mt-6 flex flex-col gap-4"
          >
            <Field>
              <FieldLabel htmlFor="contrasenaNueva">Contraseña nueva</FieldLabel>
              <div className="relative">
                <Input
                  id="contrasenaNueva"
                  type={tipo}
                  autoComplete="new-password"
                  className="pr-10"
                  aria-invalid={Boolean(errors.contrasenaNueva)}
                  {...register("contrasenaNueva")}
                />
                <button
                  type="button"
                  onClick={() => setVerContrasena((v) => !v)}
                  aria-label={verContrasena ? "Ocultar la contraseña" : "Mostrar la contraseña"}
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                >
                  {verContrasena ? (
                    <EyeOff className="size-4" aria-hidden />
                  ) : (
                    <Eye className="size-4" aria-hidden />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Mínimo 12 caracteres.</p>
              {errors.contrasenaNueva && <FieldError>{errors.contrasenaNueva.message}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="confirmacion">Repítela</FieldLabel>
              <Input
                id="confirmacion"
                type={tipo}
                autoComplete="new-password"
                aria-invalid={Boolean(errors.confirmacion)}
                {...register("confirmacion")}
              />
              {errors.confirmacion && <FieldError>{errors.confirmacion.message}</FieldError>}
            </Field>

            {error && (
              <p
                role="alert"
                className="flex items-start gap-2 rounded-lg bg-[color-mix(in_srgb,var(--destructive)_10%,transparent)] px-3 py-2 text-sm text-destructive"
              >
                <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                {error}
              </p>
            )}

            <Button type="submit" disabled={enviando} className="h-10 w-full">
              {enviando && <Loader2 className="size-4 animate-spin" aria-hidden />}
              Guardar la contraseña
            </Button>
          </motion.form>
        ) : (
          <motion.p
            variants={bloque}
            role="alert"
            className="mt-6 rounded-lg bg-[color-mix(in_srgb,var(--destructive)_10%,transparent)] px-3 py-3 text-center text-sm text-destructive"
          >
            Este enlace está incompleto. Pide uno nuevo y ábrelo desde el correo.
          </motion.p>
        )}

        <motion.div variants={bloque} className="mt-6 flex justify-center">
          <Link
            href="/recuperar"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Pedir un enlace nuevo
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
