"use client"

import { CalendarDays, Clock, Star, XCircle } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Loadable } from "@shared/components/feedback/Loadable"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import { formatDuration } from "@shared/utils/datetime"
import { configEstadoCita, ESTADOS_NO_CANCELABLES } from "@features/citas/utils/estadoCita"
import { resumenServicios } from "@features/citas/utils/servicios"
import {
  dineroDe,
  fechaCortaDe,
  diaSemanaDe,
  horaDe,
  type ContextoFormato,
} from "@features/portal/utils/formato"
import type { Cita } from "@features/portal/types/portal.types"

interface PortalCitasListProps {
  citas: Cita[]
  loading: boolean
  cargandoAccion?: boolean
  formato: ContextoFormato
  onCancelar: (cita: Cita) => void
  onCalificar: (cita: Cita) => void
}

/**
 * Las citas del cliente. Los estados son los **ocho de la api**, con la misma
 * configuración de tono e ícono que el panel: son el mismo dominio y `citas` es su
 * feat dueño.
 *
 * Cancelar solo se ofrece en lo que todavía puede cancelarse; la api tiene además
 * su propia ventana de tiempo y puede responder 422 — ocultar el botón no es
 * seguridad, evita ofrecer lo que va a fallar.
 */
export function PortalCitasList({
  citas,
  loading,
  cargandoAccion,
  formato,
  onCancelar,
  onCalificar,
}: PortalCitasListProps) {
  return (
    <Loadable loading={loading} variant="list" count={3} isEmpty={citas.length === 0}>
      <ul className="space-y-3">
        {citas.map((cita) => {
          const estado = configEstadoCita[cita.estado]
          const duracion = cita.servicios.reduce((suma, linea) => suma + linea.duracionMin, 0)
          const cancelable = !ESTADOS_NO_CANCELABLES.includes(cita.estado)
          return (
            <li key={cita.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {resumenServicios(cita.servicios.map((linea) => linea.nombre))}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    con {cita.barbero?.nombrePublico ?? "quien esté disponible"}
                  </p>
                </div>
                <StatusBadge tono={estado.tono} icono={estado.icono} etiqueta={estado.etiqueta} />
              </div>

              <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs">
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                  <dt className="sr-only">Cuándo</dt>
                  <dd className="font-medium text-foreground">
                    {diaSemanaDe(cita.iniciaEn, formato)} {fechaCortaDe(cita.iniciaEn, formato)} ·{" "}
                    {horaDe(cita.iniciaEn, formato)}
                  </dd>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                  <dt className="sr-only">Duración</dt>
                  <dd className="text-muted-foreground">{formatDuration(duracion)}</dd>
                </div>
                <div className="flex items-center gap-1.5">
                  <dt className="text-muted-foreground">Total</dt>
                  <dd className="font-semibold text-primary tabular-nums">
                    {dineroDe(cita.precioCentavos, formato)}
                  </dd>
                </div>
                <div className="flex items-center gap-1.5">
                  <dt className="text-muted-foreground">Código</dt>
                  <dd className="font-medium text-foreground tabular-nums">
                    {cita.codigoSeguimiento}
                  </dd>
                </div>
              </dl>

              {(cancelable || cita.estado === "completada") && (
                <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
                  {cancelable && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={cargandoAccion}
                      onClick={() => onCancelar(cita)}
                      className="cursor-pointer text-xs"
                    >
                      <XCircle aria-hidden />
                      Cancelar
                    </Button>
                  )}
                  {cita.estado === "completada" && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={cargandoAccion}
                      onClick={() => onCalificar(cita)}
                      className="cursor-pointer text-xs"
                    >
                      <Star aria-hidden />
                      Calificar
                    </Button>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </Loadable>
  )
}
