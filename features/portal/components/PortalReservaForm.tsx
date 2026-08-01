"use client"

import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Loader2, ShieldCheck } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Checkbox } from "@shared/components/ui/checkbox"
import { Field, FieldError, FieldLabel } from "@shared/components/ui/field"
import { Input } from "@shared/components/ui/input"
import { Controller } from "react-hook-form"
import { esquemaContacto, type DatosContacto } from "@features/portal/schemas/portal.schema"

interface PortalReservaFormProps {
  onSubmit: (datos: DatosContacto) => Promise<void>
  cargando?: boolean
}

/**
 * Paso 4: quién reserva.
 *
 * **Sin cuenta y sin contraseña**: el código que llega al teléfono es toda la
 * autenticación que existe, y también el registro. Por eso este formulario pide lo
 * que hace falta para crear la ficha si es su primera vez —nombre, teléfono y
 * correo— y no vuelve a preguntar nada después.
 *
 * El correo NO es opcional: es un canal del producto, y un cliente sin correo es
 * uno al que no se le puede escribir. Eso se descubre cuando una campaña no llega a
 * media base.
 *
 * «Quiero recibir novedades» es un **consentimiento**, no una casilla de interfaz:
 * la api lo guarda con su origen, su versión de política, la IP y el user agent.
 */
export function PortalReservaForm({ onSubmit, cargando }: PortalReservaFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DatosContacto>({
    resolver: standardSchemaResolver(esquemaContacto),
    defaultValues: { nombre: "", telefonoE164: "", email: "", notas: "", aceptaPromos: false },
  })

  const deshabilitado = isSubmitting || !!cargando

  return (
    <form className="space-y-4" onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
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

      <Field data-invalid={!!errors.telefonoE164}>
        <FieldLabel htmlFor="telefonoE164">Celular</FieldLabel>
        <Input
          id="telefonoE164"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+57 300 123 4567"
          aria-invalid={!!errors.telefonoE164}
          aria-describedby="ayuda-telefono"
          className="h-11 text-base"
          {...register("telefonoE164")}
        />
        <p id="ayuda-telefono" className="text-xs text-muted-foreground">
          Te enviamos un código para confirmar la cita y sus recordatorios.
        </p>
        <FieldError errors={[errors.telefonoE164]} />
      </Field>

      <Field data-invalid={!!errors.email}>
        <FieldLabel htmlFor="email">Correo</FieldLabel>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="tucorreo@ejemplo.com"
          aria-invalid={!!errors.email}
          className="h-11 text-base"
          {...register("email")}
        />
        <FieldError errors={[errors.email]} />
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

      <Controller
        control={control}
        name="aceptaPromos"
        render={({ field }) => (
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3">
            <Checkbox
              id="aceptaPromos"
              checked={field.value}
              onCheckedChange={(valor) => field.onChange(valor === true)}
            />
            <span className="text-xs text-muted-foreground">
              Quiero recibir novedades y promociones de esta barbería. Puedes retirarlo cuando
              quieras desde «Mis citas».
            </span>
          </label>
        )}
      />

      <div className="flex items-start gap-2 rounded-xl bg-secondary/60 p-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-(--exito)" aria-hidden />
        <p className="text-xs text-muted-foreground">
          Tus datos son de esta barbería y de nadie más. La cita se paga en el local.
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
