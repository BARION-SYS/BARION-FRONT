"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { motion, type Variants } from "motion/react"
import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react"
import { LogoBarion } from "@shared/components/brand/LogoBarion"
import { Button } from "@shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@shared/components/ui/field"
import { Input } from "@shared/components/ui/input"
import {
  esquemaCambioContrasena,
  type DatosCambioContrasena,
} from "@features/auth/schemas/auth.schema"

interface CambioObligatorioProps {
  /** Con qué nombre se dirige a la persona. Null en el staff de plataforma. */
  nombre?: string | null
  cargando?: boolean
  onSubmit: (datos: DatosCambioContrasena) => Promise<void>
  onSalir: () => void
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
 * La pantalla que se pinta EN LUGAR del panel mientras la persona arrastre una
 * contraseña que le puso otro.
 *
 * No es un aviso que se pueda cerrar, y esa es toda su razón de ser: la API
 * responde 403 a cualquier otra ruta, así que dejar el panel debajo solo serviría
 * para llenar la pantalla de errores sin explicar por qué. Aquí se explica una
 * vez y se ofrece la única salida.
 *
 * Presentacional: el submit y el estado los entrega el padre por props.
 */
export function CambioObligatorio({ nombre, cargando, onSubmit, onSalir }: CambioObligatorioProps) {
  const [verContrasena, setVerContrasena] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DatosCambioContrasena>({
    resolver: standardSchemaResolver(esquemaCambioContrasena),
    defaultValues: { contrasenaActual: "", contrasenaNueva: "", confirmacion: "" },
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
          <span className="flex size-11 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--advertencia)_14%,transparent)]">
            <KeyRound className="size-5 text-(--advertencia)" aria-hidden />
          </span>
          <div className="flex flex-col gap-1.5">
            <h1 className="text-lg font-semibold">
              {nombre ? `Hola, ${nombre}` : "Elige tu contraseña"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Entraste con una clave que puso otra persona. Elige la tuya para continuar: hasta
              entonces el panel no se abre.
            </p>
          </div>
        </motion.div>

        <motion.form
          variants={bloque}
          onSubmit={(e) => void handleSubmit(onSubmit)(e)}
          className="mt-6 flex flex-col gap-4"
        >
          <Field>
            <FieldLabel htmlFor="contrasenaActual">Contraseña actual</FieldLabel>
            <Input
              id="contrasenaActual"
              type="password"
              autoComplete="current-password"
              placeholder="La que te dieron"
              aria-invalid={Boolean(errors.contrasenaActual)}
              {...register("contrasenaActual")}
            />
            {errors.contrasenaActual && <FieldError>{errors.contrasenaActual.message}</FieldError>}
          </Field>

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
            <FieldLabel htmlFor="confirmacion">Repite la nueva</FieldLabel>
            <Input
              id="confirmacion"
              type={tipo}
              autoComplete="new-password"
              aria-invalid={Boolean(errors.confirmacion)}
              {...register("confirmacion")}
            />
            {errors.confirmacion && <FieldError>{errors.confirmacion.message}</FieldError>}
          </Field>

          <Button type="submit" disabled={enviando} className="h-10 w-full">
            {enviando && <Loader2 className="size-4 animate-spin" aria-hidden />}
            Guardar y entrar
          </Button>
        </motion.form>

        {/* La única otra salida: nadie debe quedar encerrado en una pantalla. */}
        <motion.div variants={bloque} className="mt-4 text-center">
          <Button variant="ghost" onClick={onSalir} className="h-9 text-sm">
            Cerrar sesión
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
