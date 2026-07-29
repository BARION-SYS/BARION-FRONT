"use client"

import { Star } from "lucide-react"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import { cn } from "@shared/utils/cn"
import { tokenDeColor } from "@shared/utils/color"
import { inicialesDe } from "@shared/utils/iniciales"
import type { Barbero } from "@features/barberos/types/barberos.types"

interface BarberosCardProps {
  barbero: Barbero
  seleccionado: boolean
  onSeleccionar: () => void
}

/**
 * Tarjeta de la lista.
 *
 * Sin cifras de citas ni de ingresos: esas lecturas son de la fase de reportes y
 * todavía no existen en la api. Enseñar un cero fijo sería peor que no
 * enseñarlas — se lee como "este barbero no trabajó" en vez de "aún no lo
 * sabemos".
 */
export function BarberosCard({ barbero, seleccionado, onSeleccionar }: BarberosCardProps) {
  const color = tokenDeColor(barbero.indiceColor)

  return (
    <button
      type="button"
      onClick={onSeleccionar}
      aria-pressed={seleccionado}
      aria-label={`Ver detalle de ${barbero.nombrePublico}`}
      className={cn(
        "w-full cursor-pointer rounded-xl border p-4 text-left transition-all motion-reduce:transition-none",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        seleccionado
          ? "border-primary/40 bg-primary/5"
          : "border-border bg-card hover:border-border/80 hover:bg-card/80"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <InitialsAvatar
            iniciales={inicialesDe(barbero.nombrePublico)}
            color={color}
            tamano="md"
          />
          <span
            className={cn(
              "absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-card",
              indicadorDe(barbero)
            )}
            aria-hidden
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{barbero.nombrePublico}</p>
          <p className="truncate text-xs text-muted-foreground">{barbero.titulo ?? "Barbero"}</p>
        </div>

        {barbero.calificacion !== null && (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-primary tabular-nums">
            <Star className="h-3 w-3 fill-primary" aria-hidden />
            {barbero.calificacion.toFixed(1)}
          </span>
        )}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        {etiquetaEstado(barbero)} · {barbero.oferta.length}{" "}
        {barbero.oferta.length === 1 ? "servicio" : "servicios"}
      </p>
    </button>
  )
}

/** Tres estados distintos, y el color por sí solo no los distingue: va con texto. */
function indicadorDe(barbero: Barbero): string {
  if (!barbero.activo) return "bg-muted-foreground"
  return barbero.enVacaciones ? "bg-(--advertencia)" : "bg-(--exito)"
}

function etiquetaEstado(barbero: Barbero): string {
  if (!barbero.activo) return "Inactivo"
  return barbero.enVacaciones ? "Ausente hoy" : "Activo"
}
