"use client"

import { Star, Users } from "lucide-react"
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
  /** Lo elegido en el paso anterior: quien no lo ofrezca todo no se puede elegir. */
  servicioIds: string[]
  loading: boolean
  onSeleccionar: (barberoId: string | null) => void
}

/**
 * Paso 2: quién atiende. La primera opción es **«cualquiera disponible»**, que en
 * el contrato es `barberoId: null` —no un id 0 inventado— y la resuelve la api
 * contra el motor de disponibilidad.
 *
 * Quien no ofrezca TODO lo elegido queda deshabilitado en vez de oculto: que un
 * barbero no haga barba es información útil, y esconderlo parecería que no trabaja
 * ahí.
 */
export function PortalBarberosList({
  barberos,
  barberoId,
  cualquiera,
  servicioIds,
  loading,
  onSeleccionar,
}: PortalBarberosListProps) {
  const ofreceTodo = (barbero: BarberoPortal) =>
    servicioIds.every((servicioId) =>
      barbero.oferta.some((linea) => linea.servicioId === servicioId)
    )

  return (
    <Loadable loading={loading} variant="list" count={4} isEmpty={barberos.length === 0}>
      <ul className="space-y-3">
        <li>
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
                Te asignamos al primero libre a la hora que elijas
              </span>
            </span>
          </button>
        </li>

        {barberos.map((barbero) => {
          const activo = !cualquiera && barbero.id === barberoId
          const disponible = ofreceTodo(barbero)
          return (
            <li key={barbero.id}>
              <button
                type="button"
                disabled={!disponible}
                onClick={() => onSeleccionar(barbero.id)}
                aria-pressed={activo}
                className={cn(
                  "flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl border p-4 text-left transition-colors motion-reduce:transition-none",
                  "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                  "disabled:cursor-not-allowed disabled:opacity-45",
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
                    <span className="block truncate text-xs text-muted-foreground">
                      {barbero.titulo}
                    </span>
                  )}
                  <span className="mt-1 block text-[11px] text-muted-foreground">
                    {!disponible
                      ? "No hace todo lo que elegiste"
                      : barbero.enVacaciones
                        ? "De vacaciones estos días"
                        : `${barbero.oferta.length} servicios`}
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
