"use client"

import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Loader2 } from "lucide-react"
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
  /** Sin `barberias.gestionar` los datos se consultan, no se editan. */
  soloLectura?: boolean
  cargando?: boolean
  onSubmit: (datos: DatosGeneral) => Promise<void>
}

/**
 * Identidad y facturación de la barbería.
 *
 * No pide teléfono, correo ni dirección: no son de la barbería sino de la SEDE
 * —una cadena tiene varias— y se editan en Sedes. Tampoco el identificador
 * público: va impreso en los códigos QR ya repartidos, así que cambiarlo rompe
 * cosas fuera del sistema y no es un campo de formulario.
 */
export function General({ barberia, soloLectura, cargando, onSubmit }: GeneralProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosGeneral>({
    resolver: standardSchemaResolver(esquemaGeneral),
    defaultValues: {
      nombreComercial: barberia.nombreComercial,
      razonSocial: barberia.razonSocial ?? undefined,
      modoImpuesto: barberia.modoImpuesto,
      tasaImpuestoBps: barberia.tasaImpuestoBps ?? undefined,
    },
  })

  return (
    <SectionCard
      titulo="Información de la barbería"
      subtitulo={`Su dirección pública es /b/${barberia.slug}`}
    >
      <form className="space-y-4" onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
        <Field data-invalid={!!errors.nombreComercial}>
          <FieldLabel htmlFor="nombreComercial">Nombre del negocio</FieldLabel>
          <Input
            id="nombreComercial"
            type="text"
            autoComplete="organization"
            disabled={soloLectura}
            aria-invalid={!!errors.nombreComercial}
            {...register("nombreComercial")}
          />
          <FieldError errors={[errors.nombreComercial]} />
        </Field>

        <Field data-invalid={!!errors.razonSocial}>
          <FieldLabel htmlFor="razonSocial">Razón social</FieldLabel>
          <Input
            id="razonSocial"
            type="text"
            disabled={soloLectura}
            aria-invalid={!!errors.razonSocial}
            {...register("razonSocial")}
          />
          <p className="text-xs text-muted-foreground">
            El nombre legal, si difiere del comercial. Es el que va en la facturación.
          </p>
          <FieldError errors={[errors.razonSocial]} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={!!errors.modoImpuesto}>
            <FieldLabel htmlFor="modoImpuesto">Impuesto</FieldLabel>
            <select
              id="modoImpuesto"
              disabled={soloLectura}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              {...register("modoImpuesto")}
            >
              <option value="incluido">Incluido en el precio</option>
              <option value="agregado">Se agrega al cobrar</option>
            </select>
            <p className="text-xs text-muted-foreground">
              En Colombia y España va incluido; en EE. UU. se agrega.
            </p>
            <FieldError errors={[errors.modoImpuesto]} />
          </Field>

          <Field data-invalid={!!errors.tasaImpuestoBps}>
            <FieldLabel htmlFor="tasaImpuestoBps">Tasa</FieldLabel>
            <Input
              id="tasaImpuestoBps"
              type="number"
              min={0}
              max={10000}
              step={1}
              disabled={soloLectura}
              aria-invalid={!!errors.tasaImpuestoBps}
              {...register("tasaImpuestoBps", { valueAsNumber: true })}
            />
            <p className="text-xs text-muted-foreground">
              En puntos base: 1900 = 19 %. Se guarda así para no arrastrar decimales.
            </p>
            <FieldError errors={[errors.tasaImpuestoBps]} />
          </Field>
        </div>

        <p className="rounded-lg border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
          El teléfono, la dirección y el horario son de cada sede, no de la barbería. Se editan en
          Sedes.
        </p>

        {!soloLectura && (
          <Button type="submit" disabled={cargando} className="mt-2">
            {cargando && <Loader2 className="size-4 animate-spin" aria-hidden />}
            Guardar cambios
          </Button>
        )}
      </form>
    </SectionCard>
  )
}
