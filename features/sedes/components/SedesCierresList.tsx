"use client"

import { CalendarX2, Trash2 } from "lucide-react"
import { Loadable } from "@shared/components/feedback/Loadable"
import type { Cierre } from "@features/sedes/types/sedes.types"

interface SedesCierresListProps {
  cierres: Cierre[]
  loading: boolean
  /** Sin `sedes.gestionar` los cierres se consultan, no se tocan. */
  gestiona: boolean
  onEditar: (cierre: Cierre) => void
  onCancelar: (cierre: Cierre) => void
}

export function SedesCierresList({
  cierres,
  loading,
  gestiona,
  onEditar,
  onCancelar,
}: SedesCierresListProps) {
  return (
    <Loadable
      loading={loading}
      isEmpty={cierres.length === 0}
      variant="list"
      emptyState={
        <p className="py-8 text-center text-sm text-muted-foreground">
          Sin cierres programados. La sede abre según su horario todos los días.
        </p>
      }
    >
      <ul className="flex flex-col gap-2">
        {cierres.map((cierre) => (
          <li
            key={cierre.id}
            className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5"
          >
            <CalendarX2 className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            {gestiona ? (
              <button
                type="button"
                onClick={() => onEditar(cierre)}
                className="min-w-0 flex-1 text-left"
              >
                <p className="truncate text-sm">{cierre.motivo}</p>
                <p className="text-xs text-muted-foreground">{rango(cierre)}</p>
              </button>
            ) : (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{cierre.motivo}</p>
                <p className="text-xs text-muted-foreground">{rango(cierre)}</p>
              </div>
            )}
            {gestiona && (
              <button
                type="button"
                onClick={() => onCancelar(cierre)}
                className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
              >
                <Trash2 className="size-4" aria-hidden />
                <span className="sr-only">Cancelar el cierre {cierre.motivo}</span>
              </button>
            )}
          </li>
        ))}
      </ul>
    </Loadable>
  )
}

/** Un cierre de un solo día no se lee como un rango de un día a sí mismo. */
function rango(cierre: Cierre): string {
  return cierre.fechaDesde === cierre.fechaHasta
    ? cierre.fechaDesde
    : `${cierre.fechaDesde} — ${cierre.fechaHasta}`
}
