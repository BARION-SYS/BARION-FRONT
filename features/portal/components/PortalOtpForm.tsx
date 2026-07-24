"use client"

import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Loader2, MessageCircle } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@shared/components/ui/field"
import { Input } from "@shared/components/ui/input"
import { esquemaCodigo, type DatosCodigo } from "@features/portal/schemas/portal.schema"

interface PortalOtpFormProps {
  telefono: string
  onSubmit: (datos: DatosCodigo) => Promise<void>
  onReenviar: () => void
  cargando?: boolean
}

// Paso 5: verificación del teléfono. Mismo formulario para reservar y para entrar a "Mis citas".
export function PortalOtpForm({ telefono, onSubmit, onReenviar, cargando }: PortalOtpFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DatosCodigo>({
    resolver: standardSchemaResolver(esquemaCodigo),
    defaultValues: { codigo: "" },
  })

  const deshabilitado = isSubmitting || !!cargando

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="flex items-start gap-2 rounded-xl bg-secondary/60 p-3">
        <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
        <p className="text-xs text-muted-foreground">
          Enviamos un código de 6 dígitos a <span className="font-semibold">{telefono}</span>. En la
          demo sirve cualquier combinación de 6 números.
        </p>
      </div>

      <Field data-invalid={!!errors.codigo}>
        <FieldLabel htmlFor="codigo">Código de verificación</FieldLabel>
        <Input
          id="codigo"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="000000"
          aria-invalid={!!errors.codigo}
          className="h-14 text-center text-2xl font-bold tracking-[0.5em] tabular-nums"
          {...register("codigo")}
        />
        <FieldError errors={[errors.codigo]} />
      </Field>

      <Button
        type="submit"
        size="lg"
        disabled={deshabilitado}
        className="h-12 w-full cursor-pointer text-sm font-semibold"
      >
        {deshabilitado ? <Loader2 className="animate-spin" aria-hidden /> : "Confirmar"}
      </Button>

      <Button
        type="button"
        variant="ghost"
        onClick={onReenviar}
        disabled={deshabilitado}
        className="h-11 w-full cursor-pointer text-xs font-medium text-muted-foreground"
      >
        No me llegó — reenviar código
      </Button>
    </form>
  )
}
