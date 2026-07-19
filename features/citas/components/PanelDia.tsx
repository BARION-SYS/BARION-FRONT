import { CalendarDays, Clock, Plus } from "lucide-react"
import { cn } from "@shared/utils/cn"
import { Button } from "@shared/components/ui/button"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import { configEstadoCita } from "@features/citas/utils/estadoCita"
import type { CitaCalendario, DiaCalendario } from "@features/citas/types/citas.types"

interface Props {
  dia: DiaCalendario
  mes: string
  horas: string[]
  citas: CitaCalendario[]
  citaSeleccionada: CitaCalendario | null
  alSeleccionarCita: (cita: CitaCalendario) => void
}

export function PanelDia({ dia, mes, horas, citas, citaSeleccionada, alSeleccionarCita }: Props) {
  return (
    <SectionCard
      titulo={`${dia.etiqueta} ${dia.fecha} de ${mes}`}
      subtitulo={`${citas.length} citas programadas`}
      className="shrink-0 xl:w-72"
    >
      {citas.length === 0 ? (
        <div className="flex h-32 flex-col items-center justify-center text-muted-foreground">
          <CalendarDays className="size-8 opacity-30" aria-hidden />
          <p className="mt-2 text-xs">Sin citas este día</p>
        </div>
      ) : (
        <ul className="flex-1 space-y-2 overflow-y-auto">
          {citas.map((cita) => {
            const estado = configEstadoCita[cita.estado]
            return (
              <li key={cita.id}>
                <Button
                  variant="ghost"
                  onClick={() => alSeleccionarCita(cita)}
                  className={cn(
                    "h-auto w-full cursor-pointer flex-col items-stretch gap-1 rounded-lg border p-3 text-left whitespace-normal motion-reduce:transition-none",
                    citaSeleccionada?.id === cita.id
                      ? "border-primary/50 bg-primary/5 hover:bg-primary/10"
                      : "border-border bg-secondary/50 hover:bg-secondary"
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-semibold text-foreground">
                      {cita.cliente}
                    </span>
                    <StatusBadge
                      etiqueta={estado.etiqueta}
                      tono={estado.tono}
                      icono={estado.icono}
                    />
                  </span>
                  <span className="text-[11px] font-normal text-muted-foreground">
                    {cita.servicio}
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[10px] font-normal text-muted-foreground tabular-nums">
                      <Clock className="size-2.5" aria-hidden /> {horas[cita.horaInicio]}
                    </span>
                    <span
                      className="text-[10px] font-normal text-(--tono)"
                      style={{ "--tono": cita.color } as React.CSSProperties}
                    >
                      {cita.barbero}
                    </span>
                  </span>
                </Button>
              </li>
            )
          })}
        </ul>
      )}

      <div className="mt-4 border-t border-border pt-4">
        <Button
          variant="outline"
          size="lg"
          className="w-full cursor-pointer border-primary/30 bg-primary/10 text-xs font-semibold text-primary hover:bg-primary/20 hover:text-primary"
        >
          <Plus aria-hidden /> Agendar en este día
        </Button>
      </div>
    </SectionCard>
  )
}
