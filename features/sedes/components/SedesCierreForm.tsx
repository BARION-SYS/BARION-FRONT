"use client"

import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Loader2 } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@shared/components/ui/field"
import { Input } from "@shared/components/ui/input"
import { esquemaCierre, type DatosCierre } from "@features/sedes/schemas/sedes.schema"
import type { Cierre } from "@features/sedes/types/sedes.types"
import { useTextos } from "@shared/textos/useTextos"

interface SedesCierreFormProps {
  /** Sin cierre = alta. Con cierre = edición. */
  cierre?: Cierre | null
  cargando?: boolean
  onSubmit: (datos: DatosCierre) => Promise<void>
}

/**
 * Un cierre tapa la sede COMPLETA, y con ella la agenda de todos sus barberos.
 * Las dos fechas quedan incluidas: del 24 al 26 son tres días cerrados.
 */
export function SedesCierreForm({ cierre, cargando, onSubmit }: SedesCierreFormProps) {
  const t = useTextos("sedes.cierre")
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosCierre>({
    resolver: standardSchemaResolver(esquemaCierre),
    defaultValues: {
      fechaDesde: cierre?.fechaDesde ?? "",
      fechaHasta: cierre?.fechaHasta ?? "",
      motivo: cierre?.motivo ?? "",
    },
  })

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="fechaDesde">{t("desde")}</FieldLabel>
          <Input id="fechaDesde" type="date" {...register("fechaDesde")} />
          {errors.fechaDesde && <FieldError>{errors.fechaDesde.message}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="fechaHasta">{t("hasta")}</FieldLabel>
          <Input id="fechaHasta" type="date" {...register("fechaHasta")} />
          <p className="text-xs text-muted-foreground">{t("hastaAyuda")}</p>
          {errors.fechaHasta && <FieldError>{errors.fechaHasta.message}</FieldError>}
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="motivo">{t("motivo")}</FieldLabel>
        <Input id="motivo" placeholder={t("motivoEjemplo")} {...register("motivo")} />
        <p className="text-xs text-muted-foreground">
          Es lo que verá quien intente reservar esos días.
        </p>
        {errors.motivo && <FieldError>{errors.motivo.message}</FieldError>}
      </Field>

      <Button type="submit" disabled={cargando} className="h-10">
        {cargando && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {cierre ? t("guardar") : t("programar")}
      </Button>
    </form>
  )
}
