"use client"

import type { CSSProperties } from "react"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import { Progress } from "@shared/components/ui/progress"
import { cn } from "@shared/utils/cn"
import type { NominaBarbero } from "@features/nomina/types/nomina.types"
import { formatNumber } from "@shared/utils/numbers"

interface Props {
  barbero: NominaBarbero
  /** Porcentaje de la producción total del equipo, 0–100 */
  participacion: number
  seleccionado: boolean
  onSeleccionar: () => void
}

export function NominaBarberoCard({ barbero, participacion, seleccionado, onSeleccionar }: Props) {
  return (
    <button
      type="button"
      onClick={onSeleccionar}
      aria-pressed={seleccionado}
      aria-label={`Ver detalle de nómina de ${barbero.nombre}`}
      className={cn(
        "min-h-9 w-full cursor-pointer rounded-xl border bg-card p-4 text-left transition-colors motion-reduce:transition-none",
        "outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        seleccionado ? "border-primary/40 bg-primary/5" : "border-border hover:border-border/80"
      )}
    >
      <div className="mb-3 flex items-center gap-3">
        <InitialsAvatar iniciales={barbero.iniciales} color={barbero.color} tamano="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-foreground">{barbero.nombre}</p>
          <p className="text-[11px] text-muted-foreground">
            {barbero.citas} citas · {barbero.porcentajeComision}% comisión
          </p>
        </div>
        <p
          className="text-sm font-bold text-(--tono) tabular-nums"
          style={{ "--tono": barbero.color } as React.CSSProperties}
        >
          ${formatNumber(barbero.total)}
        </p>
      </div>

      {/* El indicador de Progress usa bg-primary: se re-apunta al token del barbero */}
      <Progress
        value={participacion}
        aria-label={`Participación de ${barbero.nombre} en la producción: ${Math.round(participacion)}%`}
        className="motion-reduce:[&_[data-slot=progress-indicator]]:transition-none"
        style={{ "--primary": barbero.color } as CSSProperties}
      />

      <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
        <span className="tabular-nums">Prod: ${formatNumber(barbero.produccion)}</span>
        <span className="tabular-nums">{Math.round(participacion)}% del total</span>
      </div>
    </button>
  )
}
