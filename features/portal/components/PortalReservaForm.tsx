"use client"

import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Loader2, ShieldCheck } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@shared/components/ui/field"
import { Input } from "@shared/components/ui/input"
import { esquemaContacto, type DatosContacto } from "@features/portal/schemas/portal.schema"

interface PortalReservaFormProps {
  onSubmit: (datos: DatosContacto) => Promise<void>
  cargando?: boolean
}

// Paso 4: datos del cliente. Sin cuenta ni contraseña — el teléfono se verifica con un código.
export function PortalReservaForm({ onSubmit, cargando }: PortalReservaFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DatosContacto>({
    resolver: standardSchemaResolver(esquemaContacto),
    defaultValues: { nombre: "", telefono: "", notas: "" },
  })

  const deshabilitado = isSubmitting || !!cargando

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Field data-invalid={!!errors.nombre}>
        <FieldLabel htmlFor="nombre">Tu nombre</FieldLabel>
        <Input
          id="nombre"
          autoComplete="name"
          placeholder="Como te llaman en la barbería"
          aria-invalid={!!errors.nombre}
          className="h-11 text-base"
          {...register("nombre")}
        />
        <FieldError errors={[errors.nombre]} />
      </Field>

      <Field data-invalid={!!errors.telefono}>
        <FieldLabel htmlFor="telefono">Celular</FieldLabel>
        <Input
          id="telefono"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+57 300 123 4567"
          aria-invalid={!!errors.telefono}
          aria-describedby="ayuda-telefono"
          className="h-11 text-base"
          {...register("telefono")}
        />
        <p id="ayuda-telefono" className="text-xs text-muted-foreground">
          Te enviamos un código para confirmar la cita y los recordatorios.
        </p>
        <FieldError errors={[errors.telefono]} />
      </Field>

      <Field data-invalid={!!errors.notas}>
        <FieldLabel htmlFor="notas">Notas para el barbero (opcional)</FieldLabel>
        <Input
          id="notas"
          placeholder="Ej. fade bajo, dejar la barba corta"
          aria-invalid={!!errors.notas}
          className="h-11 text-base"
          {...register("notas")}
        />
        <FieldError errors={[errors.notas]} />
      </Field>

      <div className="flex items-start gap-2 rounded-xl bg-secondary/60 p-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-(--exito)" aria-hidden />
        <p className="text-xs text-muted-foreground">
          Usamos tu número solo para esta cita y sus recordatorios. Puedes cancelar cuando quieras.
        </p>
      </div>

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
