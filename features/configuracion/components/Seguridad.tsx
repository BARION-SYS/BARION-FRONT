"use client"

import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Button } from "@shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@shared/components/ui/field"
import { Input } from "@shared/components/ui/input"
import { SectionCard } from "@shared/components/cards/SectionCard"
import {
  esquemaSeguridad,
  type DatosSeguridad,
} from "@features/configuracion/schemas/configuracion.schema"

interface SeguridadProps {
  onSubmit: (datos: DatosSeguridad) => Promise<void>
}

export function Seguridad({ onSubmit }: SeguridadProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DatosSeguridad>({
    resolver: standardSchemaResolver(esquemaSeguridad),
    defaultValues: { contrasenaActual: "", contrasenaNueva: "", confirmarContrasena: "" },
  })

  // La mutación vive en el padre: el form solo delega
  const enviar = handleSubmit(async (datos) => {
    await onSubmit(datos)
    reset()
  })

  return (
    <SectionCard titulo="Seguridad de la cuenta">
      <form className="space-y-4" onSubmit={enviar} noValidate>
        <Field data-invalid={!!errors.contrasenaActual}>
          <FieldLabel htmlFor="contrasena-actual">Contraseña actual</FieldLabel>
          <Input
            id="contrasena-actual"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            aria-invalid={!!errors.contrasenaActual}
            {...register("contrasenaActual")}
          />
          <FieldError errors={[errors.contrasenaActual]} />
        </Field>

        <Field data-invalid={!!errors.contrasenaNueva}>
          <FieldLabel htmlFor="contrasena-nueva">Nueva contraseña</FieldLabel>
          <Input
            id="contrasena-nueva"
            type="password"
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            aria-invalid={!!errors.contrasenaNueva}
            {...register("contrasenaNueva")}
          />
          <FieldError errors={[errors.contrasenaNueva]} />
        </Field>

        <Field data-invalid={!!errors.confirmarContrasena}>
          <FieldLabel htmlFor="confirmar-contrasena">Confirmar nueva contraseña</FieldLabel>
          <Input
            id="confirmar-contrasena"
            type="password"
            placeholder="Repite la contraseña"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmarContrasena}
            {...register("confirmarContrasena")}
          />
          <FieldError errors={[errors.confirmarContrasena]} />
        </Field>

        <Button type="submit" disabled={isSubmitting} className="mt-2">
          Actualizar contraseña
        </Button>
      </form>
    </SectionCard>
  )
}
