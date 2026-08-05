"use client"

import { Palmtree, Star, Users } from "lucide-react"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import { Loadable } from "@shared/components/feedback/Loadable"
import { cn } from "@shared/utils/cn"
import { tokenDeColor } from "@shared/utils/color"
import { inicialesDe } from "@features/portal/utils/formato"
import type { BarberoPortal } from "@features/portal/types/portal.types"

interface PortalBarberosListProps {
  barberos: BarberoPortal[]
  /** `null` con `cualquiera` activo = "el primero disponible". */
  barberoId: string | null
  cualquiera: boolean
  loading: boolean
  onSeleccionar: (barberoId: string | null) => void
}

/**
 * Paso 1: quién atiende. La primera opción es **«cualquiera disponible»**, que en
 * el contrato es `barberoId: null` —no un id 0 inventado— y la resuelve la api
 * contra el motor de disponibilidad.
 *
 * Aquí ya no se deshabilita a nadie, y esa es la consecuencia de haber puesto este
 * paso primero: no hay nada elegido todavía contra lo que medir. Lo que antes se
 * pintaba como «no hace todo lo que elegiste» dejó de existir porque el conflicto
 * ya no puede darse — la carta del paso siguiente ES la oferta de quien se elija.
 */
export function PortalBarberosList({
  barberos,
  barberoId,
  cualquiera,
  loading,
  onSeleccionar,
}: PortalBarberosListProps) {
  return (
    <Loadable loading={loading} variant="list" count={4} isEmpty={barberos.length === 0}>
      <ul className="grid gap-3 xl:grid-cols-2">
        <li className="xl:col-span-2">
          <button
            type="button"
            onClick={() => onSeleccionar(null)}
            aria-pressed={cualquiera}
            className={cn(
              "flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl border p-4 text-left transition-colors motion-reduce:transition-none",
              "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
              cualquiera
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-primary/40"
            )}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary">
              <Users className="h-5 w-5 text-secondary-foreground" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-foreground">
                Cualquiera disponible
              </span>
              <span className="block text-xs text-muted-foreground">
                Verás todo lo que hace el equipo y te asignamos al primero libre
              </span>
            </span>
          </button>
        </li>

        {barberos.map((barbero) => {
          const activo = !cualquiera && barbero.id === barberoId
          return (
            <li key={barbero.id}>
              <button
                type="button"
                onClick={() => onSeleccionar(barbero.id)}
                aria-pressed={activo}
                className={cn(
                  "flex min-h-11 w-full cursor-pointer items-start gap-3 rounded-xl border p-4 text-left transition-colors motion-reduce:transition-none",
                  "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                  activo
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/40"
                )}
              >
                <InitialsAvatar
                  iniciales={inicialesDe(barbero.nombrePublico)}
                  color={tokenDeColor(barbero.indiceColor)}
                  tamano="md"
                />

                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-foreground">
                      {barbero.nombrePublico}
                    </span>
                    {barbero.calificacion !== null && (
                      <span className="flex shrink-0 items-center gap-0.5 text-[11px] font-semibold text-primary tabular-nums">
                        <Star className="h-3 w-3 fill-primary" aria-hidden />
                        {barbero.calificacion}
                        <span className="font-normal text-muted-foreground">
                          ({barbero.resenas})
                        </span>
                      </span>
                    )}
                  </span>

                  {barbero.titulo && (
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      {barbero.titulo}
                    </span>
                  )}

                  <span className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                      {barbero.oferta.length === 1
                        ? "1 servicio"
                        : `${barbero.oferta.length} servicios`}
                    </span>
                    {/* Estado nunca solo por color: la ausencia lleva ícono y texto. */}
                    {barbero.enVacaciones && (
                      <span className="flex items-center gap-1 rounded-full bg-[color-mix(in_srgb,var(--advertencia)_16%,transparent)] px-2 py-0.5 text-[11px] font-medium text-(--advertencia)">
                        <Palmtree className="h-3 w-3" aria-hidden />
                        De vacaciones
                      </span>
                    )}
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
