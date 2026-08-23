"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Loader2 } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@shared/components/ui/field"
import { Input } from "@shared/components/ui/input"
import { Switch } from "@shared/components/ui/switch"
import { esquemaExcepcion, type DatosExcepcion } from "@features/barberos/schemas/barberos.schema"
import type { ExcepcionJornada } from "@features/barberos/types/barberos.types"
import { useTextos } from "@shared/textos/useTextos"

interface BarberosExcepcionFormProps {
  /** Sin excepción = alta. Con excepción = edición del mismo día. */
  excepcion?: ExcepcionJornada | null
  cargando?: boolean
  onSubmit: (datos: DatosExcepcion) => Promise<void>
}

/**
 * Un día especial reemplaza la jornada normal de esa fecha: cerrado, u otro
 * horario. Se escribe por fecha —un día tiene como mucho una excepción— así que
 * declarar el mismo día otra vez la sustituye en vez de acumularla.
 */
export function BarberosExcepcionForm({
  excepcion,
  cargando,
  onSubmit,
}: BarberosExcepcionFormProps) {
  const t = useTextos("barberos.excepcion")
  const [cerrado, setCerrado] = useState(excepcion?.cerrado ?? true)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosExcepcion>({
    resolver: standardSchemaResolver(esquemaExcepcion),
    defaultValues: {
      fecha: excepcion?.fecha ?? "",
      cerrado: excepcion?.cerrado ?? true,
      inicio: excepcion?.inicio ?? "09:00",
      fin: excepcion?.fin ?? "18:00",
      motivo: excepcion?.motivo ?? "",
    },
  })

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => void handleSubmit((datos) => onSubmit({ ...datos, cerrado }))(e)}
    >
      <Field data-invalid={!!errors.fecha}>
        <FieldLabel htmlFor="fecha">{t("fecha")}</FieldLabel>
        <Input id="fecha" type="date" disabled={!!excepcion} {...register("fecha")} />
        <FieldError errors={[errors.fecha]} />
      </Field>

      <div className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5">
        <Switch id="cerrado" checked={cerrado} onCheckedChange={setCerrado} />
        <FieldLabel htmlFor="cerrado" className="cursor-pointer">
          Ese día no atiende
        </FieldLabel>
      </div>

      {!cerrado && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={!!errors.inicio}>
            <FieldLabel htmlFor="inicio">{t("entrada")}</FieldLabel>
            <Input id="inicio" type="time" {...register("inicio")} />
            <FieldError errors={[errors.inicio]} />
          </Field>

          <Field data-invalid={!!errors.fin}>
            <FieldLabel htmlFor="fin">{t("salida")}</FieldLabel>
            <Input id="fin" type="time" {...register("fin")} />
            <FieldError errors={[errors.fin]} />
          </Field>
        </div>
      )}

      <Field data-invalid={!!errors.motivo}>
        <FieldLabel htmlFor="motivo">{t("motivo")}</FieldLabel>
        <Input id="motivo" placeholder={t("motivoEjemplo")} {...register("motivo")} />
        <FieldError errors={[errors.motivo]} />
      </Field>

      <Button type="submit" disabled={cargando} className="h-10">
        {cargando && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {excepcion ? t("guardar") : t("programar")}
      </Button>
    </form>
  )
}
