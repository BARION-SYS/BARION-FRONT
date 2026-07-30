"use client"

import { Controller, useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Loader2 } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@shared/components/ui/field"
import { Input } from "@shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select"
import { esquemaAusencia, type DatosAusencia } from "@features/barberos/schemas/barberos.schema"
import type { OpcionCatalogo } from "@features/catalogos/types/catalogos.types"

interface BarberosAusenciaFormProps {
  /** `GET /catalogos` — `tiposAusencia`. */
  tiposAusencia: OpcionCatalogo[]
  cargando?: boolean
  onSubmit: (datos: DatosAusencia) => Promise<void>
}

/**
 * Programar una ausencia.
 *
 * Las fechas se escriben en hora local y viajan como instantes UTC: la ausencia
 * ocurre una vez, en un momento concreto, y no se repite cada semana como la
 * jornada. Guardarla como día de la semana obligaría a inventarle una vigencia
 * de un solo día.
 *
 * **No cancela las citas** que caigan dentro. La api devuelve cuántas quedaron
 * pisadas y el aviso lo dice: son clientes ya citados y hay que reasignarlos uno
 * por uno.
 */
export function BarberosAusenciaForm({
  tiposAusencia,
  cargando,
  onSubmit,
}: BarberosAusenciaFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosAusencia>({
    resolver: standardSchemaResolver(esquemaAusencia),
    defaultValues: { tipo: "vacaciones" },
  })

  return (
    <form
      className="flex flex-col gap-5"
      noValidate
      onSubmit={(e) =>
        void handleSubmit((datos) =>
          // `datetime-local` entrega hora local sin zona; la API espera un
          // instante, así que se convierte aquí y no en el service.
          onSubmit({
            ...datos,
            iniciaEn: new Date(datos.iniciaEn).toISOString(),
            terminaEn: new Date(datos.terminaEn).toISOString(),
          })
        )(e)
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field data-invalid={!!errors.iniciaEn}>
          <FieldLabel htmlFor="iniciaEn">Desde</FieldLabel>
          <Input id="iniciaEn" type="datetime-local" {...register("iniciaEn")} />
          <FieldError errors={[errors.iniciaEn]} />
        </Field>

        <Field data-invalid={!!errors.terminaEn}>
          <FieldLabel htmlFor="terminaEn">Hasta</FieldLabel>
          <Input id="terminaEn" type="datetime-local" {...register("terminaEn")} />
          <FieldError errors={[errors.terminaEn]} />
        </Field>
      </div>

      <Controller
        control={control}
        name="tipo"
        render={({ field }) => (
          <Field data-invalid={!!errors.tipo}>
            <FieldLabel htmlFor="tipo">Tipo</FieldLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="tipo" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tiposAusencia.map((opcion) => (
                  <SelectItem key={opcion.codigo} value={opcion.codigo}>
                    {opcion.etiqueta}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={[errors.tipo]} />
          </Field>
        )}
      />

      <Field data-invalid={!!errors.motivo}>
        <FieldLabel htmlFor="motivo">Motivo</FieldLabel>
        <Input id="motivo" placeholder="Vacaciones de fin de año" {...register("motivo")} />
        <FieldError errors={[errors.motivo]} />
      </Field>

      <p className="rounded-lg border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
        Las citas que caigan dentro no se cancelan. Si hay alguna, el aviso lo dirá para que se
        reasigne.
      </p>

      <Button type="submit" disabled={cargando} className="h-10">
        {cargando && <Loader2 className="size-4 animate-spin" aria-hidden />}
        Programar ausencia
      </Button>
    </form>
  )
}
