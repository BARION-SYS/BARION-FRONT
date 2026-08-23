"use client"

import type { CSSProperties } from "react"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import { Progress } from "@shared/components/ui/progress"
import { cn } from "@shared/utils/cn"
import { tokenDeColor } from "@shared/utils/color"
import { inicialesDe } from "@shared/utils/iniciales"
import type { ResumenNomina } from "@features/nomina/types/nomina.types"
import { comisionEfectiva } from "@features/nomina/utils/periodo"
import { useFormato } from "@shared/hooks/useFormato"
import { useTextos } from "@shared/textos/useTextos"

interface NominaBarberoCardProps {
  fila: ResumenNomina
  /** Porcentaje de la producción total del equipo, 0–100. */
  participacion: number
  seleccionado: boolean
  onSeleccionar: () => void
}

export function NominaBarberoCard({
  fila,
  participacion,
  seleccionado,
  onSeleccionar,
}: NominaBarberoCardProps) {
  const t = useTextos("nomina")
  const { dinero, numero, porcentaje } = useFormato()

  const nombre = fila.barbero?.nombrePublico ?? t("retirado")
  const color = tokenDeColor(fila.barbero?.indiceColor ?? 0)
  const comision = comisionEfectiva(fila.produccionCentavos, fila.comisionCentavos)

  return (
    <button
      type="button"
      onClick={onSeleccionar}
      aria-pressed={seleccionado}
      aria-label={`Ver detalle de nómina de ${nombre}`}
      className={cn(
        "min-h-9 w-full cursor-pointer rounded-xl border bg-card p-4 text-left transition-colors motion-reduce:transition-none",
        "outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        seleccionado ? "border-primary/40 bg-primary/5" : "border-border hover:border-border/80"
      )}
    >
      <div className="mb-3 flex items-center gap-3">
        <InitialsAvatar iniciales={inicialesDe(nombre)} color={color} tamano="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-foreground">{nombre}</p>
          <p className="text-[11px] text-muted-foreground">
            {numero(fila.citas)} citas
            {/* Un 0 % se leería como "no le pagan": sin producción no hay
                porcentaje que enseñar. */}
            {comision !== null && ` · ${porcentaje(comision)} para él`}
          </p>
        </div>
        <p
          className="text-sm font-bold text-(--tono) tabular-nums"
          style={{ "--tono": color } as CSSProperties}
        >
          {dinero(Number(fila.totalCentavos))}
        </p>
      </div>

      {/* El indicador de Progress usa bg-primary: se re-apunta al token del barbero */}
      <Progress
        value={participacion}
        aria-label={`Participación de ${nombre} en la producción: ${Math.round(participacion)}%`}
        className="motion-reduce:[&_[data-slot=progress-indicator]]:transition-none"
        style={{ "--primary": color } as CSSProperties}
      />

      <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
        <span className="tabular-nums">Prod: {dinero(Number(fila.produccionCentavos))}</span>
        <span className="tabular-nums">{Math.round(participacion)}% del total</span>
      </div>
    </button>
  )
}
