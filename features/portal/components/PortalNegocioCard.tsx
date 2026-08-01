"use client"

import { MapPin } from "lucide-react"
import { agruparHorarios, direccionLegible } from "@features/portal/utils/horarios"
import type { SedePortal } from "@features/portal/types/portal.types"

interface PortalNegocioCardProps {
  /** La SEDE, no la barbería: el horario y la dirección son de cada local. */
  sede: SedePortal | null
}

/**
 * Dónde queda y cuándo abre. **El teléfono ya no se publica aquí**: la api no lo
 * expone en el escaparate, y sacarlo del panel obligaría a decidir cuál de las
 * sedes es "la" que contesta.
 */
export function PortalNegocioCard({ sede }: PortalNegocioCardProps) {
  if (!sede) return null

  const rangos = agruparHorarios(sede.horario)
  const { calle, ciudad } = direccionLegible(sede.direccion)

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-sm font-semibold text-foreground">{sede.nombre}</p>

      {(calle ?? ciudad) && (
        <p className="mt-3 flex items-start gap-2.5 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            {calle}
            {ciudad && <span className="block text-xs">{ciudad}</span>}
          </span>
        </p>
      )}

      <ul className="mt-4 space-y-1.5 border-t border-border pt-4">
        {rangos.map((rango) => (
          <li key={rango.dias} className="flex items-center justify-between gap-3 text-xs">
            <span className="text-muted-foreground">{rango.dias}</span>
            <span className="text-right font-medium text-foreground tabular-nums">
              {rango.horario}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
