"use client"

import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Loader2, Smartphone } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@shared/components/ui/field"
import { Input } from "@shared/components/ui/input"
import { esquemaAcceso, type DatosAcceso } from "@features/portal/schemas/portal.schema"

interface PortalAccesoFormProps {
  onSubmit: (datos: DatosAcceso) => Promise<void>
  cargando?: boolean
}

// Entrada del cliente a "Mis citas": sin cuenta, solo su celular verificado por código.
export function PortalAccesoForm({ onSubmit, cargando }: PortalAccesoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DatosAcceso>({
    resolver: standardSchemaResolver(esquemaAcceso),
    defaultValues: { telefono: "" },
  })

  const deshabilitado = isSubmitting || !!cargando

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="flex items-start gap-2 rounded-xl bg-secondary/60 p-3">
        <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
        <p className="text-xs text-muted-foreground">
          Consulta, confirma o cancela tus citas con el mismo número que usaste al reservar.
        </p>
      </div>

      <Field data-invalid={!!errors.telefono}>
        <FieldLabel htmlFor="telefono-acceso">Celular</FieldLabel>
        <Input
          id="telefono-acceso"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+57 300 123 4567"
          aria-invalid={!!errors.telefono}
          className="h-11 text-base"
          {...register("telefono")}
        />
        <FieldError errors={[errors.telefono]} />
      </Field>

      <Button
        type="submit"
        size="lg"
        disabled={deshabilitado}
        className="h-12 w-full cursor-pointer text-sm font-semibold"
      >
        {deshabilitado ? <Loader2 className="animate-spin" aria-hidden /> : "Enviarme el código"}
      </Button>
    </form>
  )
}
