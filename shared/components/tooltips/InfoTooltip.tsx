"use client"

import { Tooltip, TooltipContent, TooltipTrigger } from "@shared/components/ui/tooltip"

interface InfoTooltipProps {
  /** Texto o nodo que se muestra al hacer hover/focus */
  contenido: React.ReactNode
  side?: "top" | "bottom" | "left" | "right"
  sideOffset?: number
  /** Si false, no envuelve: renderiza el hijo tal cual (tooltips condicionales) */
  activo?: boolean
  children: React.ReactElement
}

// Tooltip genérico para cualquier componente (íconos sin texto, sidebar colapsado, hints).
export function InfoTooltip({
  contenido,
  side = "top",
  sideOffset = 6,
  activo = true,
  children,
}: InfoTooltipProps) {
  if (!activo) return children
  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent side={side} sideOffset={sideOffset}>
        {contenido}
      </TooltipContent>
    </Tooltip>
  )
}
