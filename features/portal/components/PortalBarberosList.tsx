"use client"

import { Star } from "lucide-react"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import { Loadable } from "@shared/components/feedback/Loadable"
import { cn } from "@shared/utils/cn"
import type { BarberoPortal } from "@features/portal/types/portal.types"

interface PortalBarberosListProps {
  barberos: BarberoPortal[]
  barberoId: number | null
  loading: boolean
  onSeleccionar: (barbero: BarberoPortal) => void
}

// Paso 2: equipo del negocio. `id: 0` es la opción "cualquiera disponible".
export function PortalBarberosList({
  barberos,
  barberoId,
  loading,
  onSeleccionar,
}: PortalBarberosListProps) {
  return (
    <Loadable loading={loading} variant="list" count={4} isEmpty={barberos.length === 0}>
      <ul className="space-y-3">
        {barberos.map((barbero) => {
          const activo = barbero.id === barberoId
          return (
            <li key={barbero.id}>
              <button
                type="button"
                onClick={() => onSeleccionar(barbero)}
                aria-pressed={activo}
                className={cn(
                  "flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl border p-4 text-left transition-colors motion-reduce:transition-none",
                  "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                  activo
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/40"
                )}
              >
                <InitialsAvatar iniciales={barbero.iniciales} color={barbero.color} tamano="md" />

                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-foreground">
                      {barbero.nombre}
                    </span>
                    <span className="flex shrink-0 items-center gap-0.5 text-[11px] font-semibold text-primary tabular-nums">
                      <Star className="h-3 w-3 fill-primary" aria-hidden />
                      {barbero.calificacion}
                    </span>
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {barbero.rol}
                  </span>
                  <span className="mt-1.5 flex flex-wrap gap-1">
                    {barbero.especialidades.slice(0, 2).map((especialidad) => (
                      <span
                        key={especialidad}
                        className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground"
                      >
                        {especialidad}
                      </span>
                    ))}
                  </span>
                </span>

                <span className="shrink-0 text-right">
                  <span className="block text-[10px] tracking-wide text-muted-foreground uppercase">
                    Próximo
                  </span>
                  <span className="block text-xs font-semibold text-foreground">
                    {barbero.proximoCupo}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </Loadable>
  )
}
