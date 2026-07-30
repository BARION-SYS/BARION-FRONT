"use client"

import { Clock, Sparkles } from "lucide-react"
import { Loadable } from "@shared/components/feedback/Loadable"
import { useFormato } from "@shared/hooks/useFormato"
import { cn } from "@shared/utils/cn"
import { formatDuration } from "@shared/utils/datetime"
import type { ServicioPortal } from "@features/portal/types/portal.types"

interface PortalServiciosListProps {
  servicios: ServicioPortal[]
  servicioIds: number[]
  loading: boolean
  /** N servicios por cita: cada click alterna, no reemplaza la elección. */
  onAlternar: (servicio: ServicioPortal) => void
}

// Paso 1: catálogo del negocio. Presentacional puro — la selección la maneja la página.
export function PortalServiciosList({
  servicios,
  servicioIds,
  loading,
  onAlternar,
}: PortalServiciosListProps) {
  const { dinero } = useFormato()

  return (
    <Loadable loading={loading} variant="list" count={4} isEmpty={servicios.length === 0}>
      <ul className="grid gap-3 xl:grid-cols-2">
        {servicios.map((servicio) => {
          const activo = servicioIds.includes(servicio.id)
          return (
            <li key={servicio.id}>
              <button
                type="button"
                onClick={() => onAlternar(servicio)}
                aria-pressed={activo}
                className={cn(
                  "flex min-h-11 w-full cursor-pointer flex-col gap-2 rounded-xl border p-4 text-left transition-colors motion-reduce:transition-none",
                  "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                  activo
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/40"
                )}
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block truncate text-base font-semibold text-foreground">
                      {servicio.nombre}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {servicio.descripcion}
                    </span>
                  </span>
                  <span className="shrink-0 text-base font-bold text-primary tabular-nums">
                    {dinero(servicio.precio)}
                  </span>
                </span>

                <span className="flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                    <Clock className="h-3 w-3" aria-hidden />
                    {formatDuration(servicio.duracionMin)}
                  </span>
                  {servicio.popular && (
                    <span className="flex items-center gap-1 rounded-full bg-[color-mix(in_srgb,var(--primary)_14%,transparent)] px-2 py-0.5 text-[11px] font-medium text-primary">
                      <Sparkles className="h-3 w-3" aria-hidden />
                      El más pedido
                    </span>
                  )}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </Loadable>
  )
}
