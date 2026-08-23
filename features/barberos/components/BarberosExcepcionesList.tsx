"use client"

import { CalendarClock, Trash2 } from "lucide-react"
import { Loadable } from "@shared/components/feedback/Loadable"
import type { ExcepcionJornada } from "@features/barberos/types/barberos.types"
import { useTextos } from "@shared/textos/useTextos"

interface BarberosExcepcionesListProps {
  excepciones: ExcepcionJornada[]
  loading: boolean
  /** Sin `barberos.gestionar` los días especiales se consultan, no se tocan. */
  gestiona: boolean
  onEditar: (excepcion: ExcepcionJornada) => void
  onEliminar: (excepcion: ExcepcionJornada) => void
}

export function BarberosExcepcionesList({
  excepciones,
  loading,
  gestiona,
  onEditar,
  onEliminar,
}: BarberosExcepcionesListProps) {
  const t = useTextos("barberos.excepcion")
  return (
    <Loadable
      loading={loading}
      isEmpty={excepciones.length === 0}
      variant="list"
      emptyState={
        <p className="py-8 text-center text-sm text-muted-foreground">
          Sin días especiales. Este barbero sigue su jornada normal todos los días.
        </p>
      }
    >
      <ul className="flex flex-col gap-2">
        {excepciones.map((excepcion) => (
          <li
            key={excepcion.id}
            className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5"
          >
            <CalendarClock className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            {gestiona ? (
              <button
                type="button"
                onClick={() => onEditar(excepcion)}
                className="min-w-0 flex-1 text-left"
              >
                <p className="text-sm">{excepcion.fecha}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {descripcion(excepcion, t("noAtiende"))}
                </p>
              </button>
            ) : (
              <div className="min-w-0 flex-1">
                <p className="text-sm">{excepcion.fecha}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {descripcion(excepcion, t("noAtiende"))}
                </p>
              </div>
            )}
            {gestiona && (
              <button
                type="button"
                onClick={() => onEliminar(excepcion)}
                className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
              >
                <Trash2 className="size-4" aria-hidden />
                <span className="sr-only">Quitar el día especial del {excepcion.fecha}</span>
              </button>
            )}
          </li>
        ))}
      </ul>
    </Loadable>
  )
}

/**
 * Qué pasa ese día, en una línea.
 *
 * El traductor entra por parámetro porque esta función vive fuera del
 * componente, donde no alcanza ningún hook. El motivo NO se traduce: lo escribió
 * quien programó el día.
 */
function descripcion(excepcion: ExcepcionJornada, noAtiende: string): string {
  const horario = excepcion.cerrado ? noAtiende : `${excepcion.inicio} — ${excepcion.fin}`
  return excepcion.motivo ? `${horario} · ${excepcion.motivo}` : horario
}
