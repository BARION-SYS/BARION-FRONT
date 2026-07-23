import { CalendarDays, Clock } from "lucide-react"
import { cn } from "@shared/utils/cn"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import { configEstadoCita } from "@features/citas/utils/estadoCita"
import type { CitaCalendario, SemanaCalendario } from "@features/citas/types/citas.types"

interface CitasListProps {
  semana: SemanaCalendario
  citas: CitaCalendario[]
  alSeleccionarCita: (cita: CitaCalendario) => void
}

// Vista "lista": todas las citas de la semana agrupadas por día, orden cronológico.
export function CitasList({ semana, citas, alSeleccionarCita }: CitasListProps) {
  const grupos = semana.dias
    .map((dia, indice) => ({
      dia,
      indice,
      citas: citas.filter((c) => c.dia === indice).sort((a, b) => a.horaInicio - b.horaInicio),
    }))
    .filter((grupo) => grupo.citas.length > 0)

  if (grupos.length === 0) {
    return (
      <div className="flex min-w-0 flex-1 flex-col items-center justify-center rounded-xl border border-border bg-card p-8 text-muted-foreground shadow-sm">
        <CalendarDays className="size-10 opacity-30" aria-hidden />
        <p className="mt-3 text-sm font-medium">Sin citas esta semana</p>
        <p className="mt-1 text-xs">Crea una con «Nueva cita»</p>
      </div>
    )
  }

  return (
    <div className="scroll-fino min-w-0 flex-1 space-y-5 rounded-xl border border-border bg-card p-4 shadow-sm md:min-h-0 md:overflow-y-auto">
      {grupos.map(({ dia, indice, citas: citasDelDia }) => (
        <section key={indice} aria-label={`${dia.etiqueta} ${dia.fecha}`}>
          <header className="mb-2 flex items-center gap-2.5">
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold tabular-nums",
                dia.esHoy
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-secondary/50 text-foreground"
              )}
            >
              {dia.fecha}
            </span>
            <div>
              <p className="text-sm leading-none font-semibold text-foreground capitalize">
                {dia.etiqueta} de {semana.mes}
                {dia.esHoy && <span className="ml-1.5 text-[10px] text-primary">· Hoy</span>}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground tabular-nums">
                {citasDelDia.length} {citasDelDia.length === 1 ? "cita" : "citas"}
              </p>
            </div>
          </header>

          <ul className="space-y-1.5">
            {citasDelDia.map((cita) => {
              const estado = configEstadoCita[cita.estado]
              return (
                <li key={cita.id}>
                  <button
                    type="button"
                    onClick={() => alSeleccionarCita(cita)}
                    aria-label={`Cita de ${cita.cliente}, ${cita.servicio}, ${semana.horas[cita.horaInicio]}`}
                    style={{ "--tono": cita.color } as React.CSSProperties}
                    className="flex w-full cursor-pointer flex-wrap items-center gap-x-3 gap-y-1.5 rounded-lg border border-l-2 border-border border-l-(--tono) bg-secondary/40 px-3 py-2.5 text-left transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-reduce:transition-none"
                  >
                    <span className="flex items-center gap-1 rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-foreground tabular-nums">
                      <Clock className="size-2.5 text-muted-foreground" aria-hidden />
                      {semana.horas[cita.horaInicio]}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-foreground">
                        {cita.cliente}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span className="truncate">{cita.servicio}</span>
                        <span className="h-1 w-1 shrink-0 rounded-full bg-(--tono)" aria-hidden />
                        <span className="shrink-0">{cita.barbero}</span>
                      </span>
                    </span>
                    <StatusBadge
                      etiqueta={estado.etiqueta}
                      tono={estado.tono}
                      icono={estado.icono}
                    />
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
