"use client"

import { Controller, type Control, type FieldErrors } from "react-hook-form"
import { Field, FieldDescription, FieldError, FieldLabel } from "@shared/components/ui/field"
import { Input } from "@shared/components/ui/input"
import { Switch } from "@shared/components/ui/switch"
import { NOMBRE_PERIODO, PERIODOS_TARIFA } from "@features/plataforma/constants/planes.copy"
import { nombreDePais } from "@features/plataforma/utils/inventario"
import { claveTarifa, type PaisTarifa } from "@features/plataforma/utils/planes"
import type { DatosFormularioPlan } from "@features/plataforma/schemas/plataforma.schema"

interface RejillaTarifasProps {
  paises: PaisTarifa[]
  control: Control<DatosFormularioPlan>
  errors: FieldErrors<DatosFormularioPlan>
}

/**
 * El precio del plan: un mercado por bloque y sus tres períodos dentro.
 *
 * **Los tres períodos se ofrecen a la vez y ninguno se deduce de otro.** El
 * semestral y el anual existen para que quien pueda adelantar pague menos, y
 * ese descuento es una decisión comercial: calcular el anual multiplicando el
 * mensual por doce sería inventarse un precio y publicarlo. Un período sin
 * importe simplemente no se vende, y eso es legítimo.
 *
 * **Dejar una celda vacía no retira nada.** El guardado hace upsert por (país,
 * período): lo que no se manda se queda como estaba. Para dejar de vender en un
 * mercado se apaga el interruptor, que manda la tarifa con `activo: false` —
 * retirar es reversible, borrar no existe.
 *
 * La moneda no se elige: sale del país porque la API exige la oficial de ese
 * mercado, y ofrecerla como campo solo serviría para provocar un rechazo.
 */
export function RejillaTarifas({ paises, control, errors }: RejillaTarifasProps) {
  return (
    <div className="flex flex-col gap-4">
      {paises.map((pais) => (
        <section
          key={pais.codigoPais}
          className="flex flex-col gap-4 rounded-xl border border-border bg-secondary/30 px-4 py-4"
        >
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm font-medium">{nombreDePais(pais.codigoPais)}</p>
            <span className="text-xs text-muted-foreground">
              Importes en {pais.moneda}, sin separador de miles
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {PERIODOS_TARIFA.map((periodo) => (
              <CeldaTarifa
                key={periodo}
                clave={claveTarifa(pais.codigoPais, periodo)}
                titulo={NOMBRE_PERIODO[periodo]}
                control={control}
                errors={errors}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

interface CeldaTarifaProps {
  clave: string
  titulo: string
  control: Control<DatosFormularioPlan>
  errors: FieldErrors<DatosFormularioPlan>
}

/** Una tarifa: cuánto cuesta y si se publica. Vacía = ni se crea ni se toca. */
function CeldaTarifa({ clave, titulo, control, errors }: CeldaTarifaProps) {
  const error = errors.tarifas?.[clave]?.monto
  const idCampo = `tarifa-${clave}`

  return (
    <Controller
      control={control}
      name={`tarifas.${clave}`}
      render={({ field }) => {
        const celda = field.value ?? { monto: "", activo: true }
        const escrita = celda.monto.trim() !== ""

        return (
          <Field data-invalid={!!error}>
            <FieldLabel htmlFor={idCampo}>{titulo}</FieldLabel>
            <Input
              id={idCampo}
              inputMode="decimal"
              placeholder="Sin tarifa"
              value={celda.monto}
              aria-invalid={!!error}
              onChange={(e) => field.onChange({ ...celda, monto: e.target.value })}
            />
            <div className="flex items-center justify-between gap-2">
              <FieldDescription>
                {!escrita ? "No se envía" : celda.activo ? "Se publica" : "Se retira"}
              </FieldDescription>
              <Switch
                size="sm"
                checked={celda.activo}
                disabled={!escrita}
                onCheckedChange={(marcado) => field.onChange({ ...celda, activo: marcado })}
                aria-label={`Publicar la tarifa ${titulo.toLowerCase()}`}
              />
            </div>
            <FieldError errors={[error]} />
          </Field>
        )
      }}
    />
  )
}
