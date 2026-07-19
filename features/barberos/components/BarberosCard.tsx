"use client"

import { Star } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer } from "recharts"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import { cn } from "@shared/utils/cn"
import { formatCompact } from "@shared/utils/numbers"
import type { Barbero } from "@features/barberos/types/barberos.types"

interface Props {
  barbero: Barbero
  seleccionado: boolean
  onSeleccionar: () => void
}

// Tarjeta de la lista del equipo: resumen + sparkline de citas de la semana.
export function BarberosCard({ barbero, seleccionado, onSeleccionar }: Props) {
  return (
    <button
      type="button"
      onClick={onSeleccionar}
      aria-pressed={seleccionado}
      aria-label={`Ver detalle de ${barbero.nombre}`}
      className={cn(
        "w-full cursor-pointer rounded-xl border p-4 text-left transition-all motion-reduce:transition-none",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        seleccionado
          ? "border-primary/40 bg-primary/5"
          : "border-border bg-card hover:border-border/80 hover:bg-card/80"
      )}
    >
      <div className="mb-3 flex items-center gap-3">
        <div className="relative">
          <InitialsAvatar iniciales={barbero.iniciales} color={barbero.color} tamano="md" />
          <span
            className={cn(
              "absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-card",
              barbero.estado === "activo" ? "bg-(--exito)" : "bg-(--advertencia)"
            )}
            aria-hidden
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{barbero.nombre}</p>
          <p className="text-xs text-muted-foreground">{barbero.rol}</p>
        </div>
        <span className="flex items-center gap-1 text-[11px] font-semibold text-primary tabular-nums">
          <Star className="h-3 w-3 fill-primary" aria-hidden /> {barbero.calificacion}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-secondary p-2">
          <p className="text-base font-bold text-foreground tabular-nums">
            {barbero.estadisticas.citas}
          </p>
          <p className="text-[9px] tracking-wide text-muted-foreground uppercase">Citas</p>
        </div>
        <div className="rounded-lg bg-secondary p-2">
          <p className="text-base font-bold text-foreground tabular-nums">
            ${formatCompact(barbero.estadisticas.ingresos)}
          </p>
          <p className="text-[9px] tracking-wide text-muted-foreground uppercase">Ingresos</p>
        </div>
        <div className="rounded-lg bg-secondary p-2">
          <p
            className="text-base font-bold text-(--tono) tabular-nums"
            style={{ "--tono": barbero.color } as React.CSSProperties}
          >
            ${barbero.estadisticas.comision}
          </p>
          <p className="text-[9px] tracking-wide text-muted-foreground uppercase">Comisión</p>
        </div>
      </div>

      <div className="mt-3 h-10" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={barbero.citasSemana.map((citas, dia) => ({ citas, dia }))}>
            <defs>
              <linearGradient id={`gradiente-barbero-${barbero.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={barbero.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={barbero.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="citas"
              stroke={barbero.color}
              strokeWidth={1.5}
              fill={`url(#gradiente-barbero-${barbero.id})`}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </button>
  )
}
