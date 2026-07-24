"use client"

import { MapPin, Phone } from "lucide-react"
import { agruparHorarios } from "@features/portal/utils/horarios"
import type { BarberiaPortal } from "@features/portal/types/portal.types"

interface PortalNegocioCardProps {
  barberia: BarberiaPortal
}

// Ficha mínima del negocio: dónde queda, cómo llamar y cuándo abre. Nada más.
export function PortalNegocioCard({ barberia }: PortalNegocioCardProps) {
  const rangos = agruparHorarios(barberia.horarios)

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <a
        href={`tel:${barberia.telefono.replace(/\s/g, "")}`}
        className="flex items-center gap-2.5 text-sm font-medium text-foreground underline-offset-4 hover:underline"
      >
        <Phone className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        {barberia.telefono}
      </a>

      <p className="mt-3 flex items-start gap-2.5 text-sm text-muted-foreground">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <span>
          {barberia.direccion}
          <span className="block text-xs">{barberia.ciudad}</span>
        </span>
      </p>

      <ul className="mt-4 space-y-1.5 border-t border-border pt-4">
        {rangos.map((rango) => (
          <li key={rango.dias} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{rango.dias}</span>
            <span className="font-medium text-foreground tabular-nums">{rango.horario}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
