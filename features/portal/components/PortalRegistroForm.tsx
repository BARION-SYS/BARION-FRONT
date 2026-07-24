"use client"

import { Controller, useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Loader2, ShieldCheck } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Checkbox } from "@shared/components/ui/checkbox"
import { Field, FieldError, FieldLabel } from "@shared/components/ui/field"
import { Input } from "@shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select"
import { esquemaRegistro, type DatosRegistro } from "@features/portal/schemas/portal.schema"
import type { BarberoPortal } from "@features/portal/types/portal.types"

interface PortalRegistroFormProps {
  barberos: BarberoPortal[]
  onSubmit: (datos: DatosRegistro) => Promise<void>
  cargando?: boolean
}

const VALORES_VACIOS: DatosRegistro = {
  nombre: "",
  telefono: "",
  correo: "",
  barberoFavorito: "",
  aceptaPromos: true,
}

// Alta del cliente en la barbería: es la puerta de entrada al módulo de clientes del panel.
export function PortalRegistroForm({ barberos, onSubmit, cargando }: PortalRegistroFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DatosRegistro>({
    resolver: standardSchemaResolver(esquemaRegistro),
    defaultValues: VALORES_VACIOS,
  })

  const deshabilitado = isSubmitting || !!cargando
  // El "cualquier barbero" del flujo de reserva no aplica como favorito.
  const opciones = barberos.filter((barbero) => barbero.id !== 0)

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Field data-invalid={!!errors.nombre}>
        <FieldLabel htmlFor="registro-nombre">Nombre y apellido</FieldLabel>
        <Input
          id="registro-nombre"
          autoComplete="name"
          placeholder="Ej. Andrés Torres"
          aria-invalid={!!errors.nombre}
          className="h-11 text-base"
          {...register("nombre")}
        />
        <FieldError errors={[errors.nombre]} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field data-invalid={!!errors.telefono}>
          <FieldLabel htmlFor="registro-telefono">Celular</FieldLabel>
          <Input
            id="registro-telefono"
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

        <Field data-invalid={!!errors.correo}>
          <FieldLabel htmlFor="registro-correo">Correo (opcional)</FieldLabel>
          <Input
            id="registro-correo"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            aria-invalid={!!errors.correo}
            className="h-11 text-base"
            {...register("correo")}
          />
          <FieldError errors={[errors.correo]} />
        </Field>
      </div>

      <Controller
        control={control}
        name="barberoFavorito"
        render={({ field }) => (
          <Field>
            <FieldLabel htmlFor="registro-barbero">Barbero favorito (opcional)</FieldLabel>
            <Select value={field.value || ""} onValueChange={field.onChange}>
              <SelectTrigger id="registro-barbero" className="h-11 w-full">
                <SelectValue placeholder="Aún no tengo uno" />
              </SelectTrigger>
              <SelectContent>
                {opciones.map((barbero) => (
                  <SelectItem key={barbero.id} value={barbero.nombre}>
                    {barbero.nombre} · {barbero.rol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}
      />

      <Controller
        control={control}
        name="aceptaPromos"
        render={({ field }) => (
          <label
            htmlFor="registro-promos"
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-secondary/40 p-3"
          >
            <Checkbox
              id="registro-promos"
              checked={field.value}
              onCheckedChange={field.onChange}
              className="mt-0.5"
            />
            <span className="text-xs text-muted-foreground">
              Quiero recibir promociones y recordatorios de la barbería por WhatsApp.
            </span>
          </label>
        )}
      />

      <div className="flex items-start gap-2 rounded-xl bg-secondary/60 p-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-(--exito)" aria-hidden />
        <p className="text-xs text-muted-foreground">
          Verificamos tu celular con un código. Tus datos quedan solo en esta barbería.
        </p>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={deshabilitado}
        className="h-12 w-full cursor-pointer text-sm font-semibold"
      >
        {deshabilitado ? <Loader2 className="animate-spin" aria-hidden /> : "Crear mi perfil"}
      </Button>
    </form>
  )
}
