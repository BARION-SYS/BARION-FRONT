"use client"

import { CalendarX2 } from "lucide-react"
import { Loadable } from "@shared/components/feedback/Loadable"
import { cn } from "@shared/utils/cn"
import {
  diaCortoDeFecha,
  diaSemanaDeFecha,
  horaDe,
  type ContextoFormato,
} from "@features/portal/utils/formato"
import type { DiaAgenda } from "@features/portal/types/portal.types"

interface PortalAgendaListProps {
  agenda: DiaAgenda[]
  /** Día abierto en la tira: `YYYY-MM-DD` local de la sede, no un instante. */
  fechaDia: string | null
  /** Franja elegida: instante UTC. */
  inicio: string | null
  /** Hoy en la sede, para etiquetar el primer día sin comparar husos en el render. */
  hoy: string
  loading: boolean
  formato: ContextoFormato
  onSeleccionarDia: (fecha: string) => void
  onSeleccionarFranja: (inicio: string) => void
}

/**
 * Paso 3: días con cupo y franjas del día abierto.
 *
 * **La fecha del día es local de la sede y la franja es un instante UTC**: son dos
 * cosas distintas y por eso se formatean distinto. Tratar la fecha como instante la
 * correría un día entero en cuanto la sede esté al oeste de UTC.
 *
 * Las franjas **no apartan nada**: si al reservar la api responde 409, se vuelve a
 * consultar en vez de reintentar.
 */
export function PortalAgendaList({
  agenda,
  fechaDia,
  inicio,
  hoy,
  loading,
  formato,
  onSeleccionarDia,
  onSeleccionarFranja,
}: PortalAgendaListProps) {
  const dia = agenda.find((candidato) => candidato.fecha === fechaDia) ?? agenda[0]
  const franjas = dia?.franjas.filter((franja) => franja.disponible) ?? []

  return (
    <Loadable loading={loading} variant="list" count={3} isEmpty={agenda.length === 0}>
      <div className="space-y-4">
        {/* Tira de días: scroll horizontal propio, la página nunca se desborda */}
        <ul className="scroll-fino -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {agenda.map((diaAgenda) => {
            const activo = diaAgenda.fecha === dia?.fecha
            const sinCupos = diaAgenda.cupos === 0
            return (
              <li key={diaAgenda.fecha} className="shrink-0">
                <button
                  type="button"
                  disabled={sinCupos}
                  onClick={() => onSeleccionarDia(diaAgenda.fecha)}
                  aria-pressed={activo}
                  className={cn(
                    "flex min-h-11 w-[74px] cursor-pointer flex-col items-center gap-0.5 rounded-xl border px-2 py-2.5 transition-colors motion-reduce:transition-none",
                    "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                    "disabled:cursor-not-allowed disabled:opacity-45",
                    activo
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/40"
                  )}
                >
                  <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                    {diaAgenda.fecha === hoy ? "Hoy" : diaSemanaDeFecha(diaAgenda.fecha)}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-bold tabular-nums",
                      activo ? "text-primary" : "text-foreground"
                    )}
                  >
                    {diaCortoDeFecha(diaAgenda.fecha)}
                  </span>
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    {sinCupos ? "Sin cupo" : `${diaAgenda.cupos} cupos`}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        {franjas.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <CalendarX2 className="mx-auto h-6 w-6 text-muted-foreground" aria-hidden />
            <p className="mt-2 text-sm font-medium text-foreground">Sin cupos este día</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Elige otro día en la tira de arriba.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {franjas.map((franja) => {
              const activo = franja.inicio === inicio
              return (
                <li key={franja.inicio}>
                  <button
                    type="button"
                    onClick={() => onSeleccionarFranja(franja.inicio)}
                    aria-pressed={activo}
                    className={cn(
                      "min-h-11 w-full cursor-pointer rounded-lg border text-sm font-semibold tabular-nums transition-colors motion-reduce:transition-none",
                      "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                      activo
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:border-primary/40"
                    )}
                  >
                    {horaDe(franja.inicio, formato)}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </Loadable>
  )
}
