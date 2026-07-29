"use client"

import { CalendarOff, Check, Trash2 } from "lucide-react"
import { Loadable } from "@shared/components/feedback/Loadable"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import { useFormato } from "@shared/hooks/useFormato"
import { TIPOS_AUSENCIA } from "@features/barberos/constants/dias"
import type { Ausencia } from "@features/barberos/types/barberos.types"

interface BarberosAusenciasListProps {
  ausencias: Ausencia[]
  loading: boolean
  /** `barberos.gestionar`: solo con eso se aprueba y se cancela. */
  gestiona: boolean
  onAprobar: (ausencia: Ausencia) => void
  onCancelar: (ausencia: Ausencia) => void
}

export function BarberosAusenciasList({
  ausencias,
  loading,
  gestiona,
  onAprobar,
  onCancelar,
}: BarberosAusenciasListProps) {
  // Instantes UTC formateados en la zona de la sede: eso lo resuelve el tenant.
  const { fechaHora } = useFormato()

  return (
    <Loadable
      loading={loading}
      isEmpty={ausencias.length === 0}
      variant="list"
      emptyState={
        <p className="py-8 text-center text-sm text-muted-foreground">Sin ausencias registradas.</p>
      }
    >
      <ul className="flex flex-col gap-2">
        {ausencias.map((ausencia) => (
          <li
            key={ausencia.id}
            className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5"
          >
            <CalendarOff className="size-4 shrink-0 text-muted-foreground" aria-hidden />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm">{etiquetaTipo(ausencia.tipo)}</p>
                <StatusBadge
                  tono={ausencia.aprobadaEn ? "exito" : "advertencia"}
                  etiqueta={ausencia.aprobadaEn ? "Aprobada" : "Pendiente"}
                  compacta
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {fechaHora(ausencia.iniciaEn)} — {fechaHora(ausencia.terminaEn)}
              </p>
              {ausencia.motivo && (
                <p className="truncate text-xs text-muted-foreground">{ausencia.motivo}</p>
              )}
            </div>

            {gestiona && !ausencia.aprobadaEn && (
              <button
                type="button"
                onClick={() => onAprobar(ausencia)}
                className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-(--exito)"
              >
                <Check className="size-4" aria-hidden />
                <span className="sr-only">Aprobar la ausencia</span>
              </button>
            )}

            {gestiona && (
              <button
                type="button"
                onClick={() => onCancelar(ausencia)}
                className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
              >
                <Trash2 className="size-4" aria-hidden />
                <span className="sr-only">Cancelar la ausencia</span>
              </button>
            )}
          </li>
        ))}
      </ul>
    </Loadable>
  )
}

function etiquetaTipo(tipo: string): string {
  return TIPOS_AUSENCIA.find((opcion) => opcion.valor === tipo)?.etiqueta ?? tipo
}
