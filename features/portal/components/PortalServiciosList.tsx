"use client"

import { Clock, Sparkles, Users } from "lucide-react"
import { Loadable } from "@shared/components/feedback/Loadable"
import { cn } from "@shared/utils/cn"
import { formatDuration } from "@shared/utils/datetime"
import { dineroDe, type ContextoFormato } from "@features/portal/utils/formato"
import type { ServicioOfrecido } from "@features/portal/types/portal.types"

interface PortalServiciosListProps {
  servicios: ServicioOfrecido[]
  servicioIds: string[]
  /** Con un barbero elegido el precio es el suyo; sin él, un «desde» del equipo. */
  precioExacto: boolean
  loading: boolean
  formato: ContextoFormato
  /** N servicios por cita: cada click alterna, no reemplaza la elección. */
  onAlternar: (servicio: ServicioOfrecido) => void
}

/**
 * Paso 2: la carta de quien va a atender.
 *
 * El precio deja de ser un «desde» del catálogo cuando hay barbero elegido: lo que
 * se pinta es su oferta, que es exactamente lo que se reserva y lo que se cobra.
 * Con «cualquiera disponible» no hay una sola cifra que prometer, así que vuelve
 * el «desde» y se dice cuántos lo hacen — enseñar un precio cerrado ahí sería
 * prometer el de alguien que quizá no corte.
 */
export function PortalServiciosList({
  servicios,
  servicioIds,
  precioExacto,
  loading,
  formato,
  onAlternar,
}: PortalServiciosListProps) {
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
                    {servicio.descripcion && (
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {servicio.descripcion}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-right">
                    {!precioExacto && servicio.precioCentavos && (
                      <span className="block text-[10px] tracking-wide text-muted-foreground uppercase">
                        Desde
                      </span>
                    )}
                    <span className="block text-base font-bold text-primary tabular-nums">
                      {dineroDe(servicio.precioCentavos, formato)}
                    </span>
                  </span>
                </span>

                <span className="flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                    <Clock className="h-3 w-3" aria-hidden />
                    {formatDuration(servicio.duracionRealMin)}
                  </span>
                  {!precioExacto && servicio.barberos > 1 && (
                    <span className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                      <Users className="h-3 w-3" aria-hidden />
                      {servicio.barberos} lo hacen
                    </span>
                  )}
                  {servicio.destacado && (
                    <span className="flex items-center gap-1 rounded-full bg-[color-mix(in_srgb,var(--primary)_14%,transparent)] px-2 py-0.5 text-[11px] font-medium text-primary">
                      <Sparkles className="h-3 w-3" aria-hidden />
                      Recomendado
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
