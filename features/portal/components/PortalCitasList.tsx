"use client"

import { CalendarDays } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Loadable } from "@shared/components/feedback/Loadable"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import { useFormato } from "@shared/hooks/useFormato"
import { ESTADOS_NO_CANCELABLES, configEstadoCita } from "@features/citas/utils/estadoCita"
import { resumenServicios } from "@features/citas/utils/servicios"
import type { CitaCliente } from "@features/portal/types/portal.types"

interface PortalCitasListProps {
  citas: CitaCliente[]
  loading: boolean
  onCancelar: (cita: CitaCliente) => void
}

// Citas del cliente en el portal: solo lectura + cancelar la que aún no ocurre.
export function PortalCitasList({ citas, loading, onCancelar }: PortalCitasListProps) {
  const { dinero, diaSemana, hora } = useFormato()

  const vacio = (
    <div className="rounded-xl border border-dashed border-border p-8 text-center">
      <CalendarDays className="mx-auto h-6 w-6 text-muted-foreground" aria-hidden />
      <p className="mt-2 text-sm font-medium text-foreground">Todavía no tienes citas</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Reserva una y aparecerá aquí con su código.
      </p>
    </div>
  )

  return (
    <Loadable
      loading={loading}
      variant="list"
      count={3}
      isEmpty={citas.length === 0}
      emptyState={vacio}
    >
      <ul className="space-y-2.5">
        {citas.map((cita) => {
          const estado = configEstadoCita[cita.estado]
          const cancelable =
            !ESTADOS_NO_CANCELABLES.includes(cita.estado) &&
            new Date(cita.inicio).getTime() > Date.now()
          const precioTotal = cita.lineasServicio.reduce((total, l) => total + l.precio, 0)

          return (
            <li key={cita.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {resumenServicios(cita.lineasServicio.map((l) => l.nombre))}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Con {cita.barbero} · {cita.codigo}
                  </p>
                </div>
                <StatusBadge etiqueta={estado.etiqueta} tono={estado.tono} icono={estado.icono} />
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-medium text-foreground">
                  {diaSemana(cita.inicio)} ·{" "}
                  <span className="tabular-nums">{hora(cita.inicio)}</span>
                </p>
                <p className="text-sm font-bold text-primary tabular-nums">{dinero(precioTotal)}</p>
              </div>

              {cancelable && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onCancelar(cita)}
                  className="mt-3 h-11 w-full cursor-pointer text-xs font-semibold text-destructive hover:text-destructive"
                >
                  Cancelar cita
                </Button>
              )}
            </li>
          )
        })}
      </ul>
    </Loadable>
  )
}
