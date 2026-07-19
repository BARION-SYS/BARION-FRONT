"use client"

import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Button } from "@shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@shared/components/ui/field"
import { Input } from "@shared/components/ui/input"
import { SectionCard } from "@shared/components/cards/SectionCard"
import {
  esquemaGeneral,
  type DatosGeneral,
} from "@features/configuracion/schemas/configuracion.schema"
import type { Barberia } from "@features/configuracion/types/configuracion.types"

interface GeneralProps {
  barberia: Barberia
  onSubmit: (datos: DatosGeneral) => Promise<void>
}

export function General({ barberia, onSubmit }: GeneralProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DatosGeneral>({
    resolver: standardSchemaResolver(esquemaGeneral),
    defaultValues: barberia,
  })

  // La mutación vive en el padre: el form solo delega
  const enviar = handleSubmit(async (datos) => {
    await onSubmit(datos)
  })

  return (
    <SectionCard titulo="Información de la barbería">
      <form className="space-y-4" onSubmit={enviar} noValidate>
        <Field data-invalid={!!errors.nombre}>
          <FieldLabel htmlFor="nombre">Nombre del negocio</FieldLabel>
          <Input
            id="nombre"
            type="text"
            autoComplete="organization"
            aria-invalid={!!errors.nombre}
            {...register("nombre")}
          />
          <FieldError errors={[errors.nombre]} />
        </Field>

        <Field data-invalid={!!errors.telefono}>
          <FieldLabel htmlFor="telefono">Teléfono de contacto</FieldLabel>
          <Input
            id="telefono"
            type="tel"
            autoComplete="tel"
            aria-invalid={!!errors.telefono}
            {...register("telefono")}
          />
          <FieldError errors={[errors.telefono]} />
        </Field>

        <Field data-invalid={!!errors.correo}>
          <FieldLabel htmlFor="correo">Correo electrónico</FieldLabel>
          <Input
            id="correo"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.correo}
            {...register("correo")}
          />
          <FieldError errors={[errors.correo]} />
        </Field>

        <Field data-invalid={!!errors.direccion}>
          <FieldLabel htmlFor="direccion">Dirección</FieldLabel>
          <Input
            id="direccion"
            type="text"
            autoComplete="street-address"
            aria-invalid={!!errors.direccion}
            {...register("direccion")}
          />
          <FieldError errors={[errors.direccion]} />
        </Field>

        <Field data-invalid={!!errors.descripcion}>
          <FieldLabel htmlFor="descripcion">Descripción</FieldLabel>
          {/* shadcn no trae textarea instalado: nativo con el estilo del Input */}
          <textarea
            id="descripcion"
            rows={3}
            aria-invalid={!!errors.descripcion}
            className="w-full resize-none rounded-lg border border-input bg-input/30 px-2.5 py-1.5 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm"
            {...register("descripcion")}
          />
          <FieldError errors={[errors.descripcion]} />
        </Field>

        <Button type="submit" disabled={isSubmitting} className="mt-2">
          Guardar cambios
        </Button>
      </form>
    </SectionCard>
  )
}
