"use client"

import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Loader2, Mail } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@shared/components/ui/field"
import { Input } from "@shared/components/ui/input"
import {
  esquemaSolicitarCodigo,
  type DatosSolicitarCodigo,
} from "@features/portal/schemas/portal.schema"

interface PortalAccesoFormProps {
  onSubmit: (datos: DatosSolicitarCodigo) => Promise<void>
  cargando?: boolean
}

/**
 * Entrada del cliente a «Mis citas»: **sin cuenta y sin contraseña**, solo el
 * correo con el que reservó. El código que le llega ahí es toda la autenticación.
 */
export function PortalAccesoForm({ onSubmit, cargando }: PortalAccesoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DatosSolicitarCodigo>({
    resolver: standardSchemaResolver(esquemaSolicitarCodigo),
    defaultValues: { email: "" },
  })

  const deshabilitado = isSubmitting || !!cargando

  return (
    <form className="space-y-4" onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
      <div className="flex items-start gap-2 rounded-xl bg-secondary/60 p-3">
        <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
        <p className="text-xs text-muted-foreground">
          Consulta, reagenda o cancela tus citas con el mismo correo con el que reservaste.
        </p>
      </div>

      <Field data-invalid={!!errors.email}>
        <FieldLabel htmlFor="correo-acceso">Correo</FieldLabel>
        <Input
          id="correo-acceso"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="tucorreo@ejemplo.com"
          aria-invalid={!!errors.email}
          className="h-11 text-base"
          {...register("email")}
        />
        <FieldError errors={[errors.email]} />
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
