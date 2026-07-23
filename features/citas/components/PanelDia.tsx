import { CalendarDays, Clock } from "lucide-react"
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
      subtitulo={`${citas.length} ${citas.length === 1 ? "cita programada" : "citas programadas"}`}
      className="h-full min-h-0 w-full"
    >
      {citas.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-8 text-muted-foreground">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/60">
            <CalendarDays className="size-5 opacity-50" aria-hidden />
          </span>
          <p className="mt-3 text-xs font-medium">Sin citas este día</p>
          <p className="mt-0.5 text-[11px] opacity-80">El día está libre para agendar</p>
        </div>
      ) : (
        <ul className="scroll-fino min-h-0 flex-1 space-y-2 overflow-y-auto pr-0.5">
          {citas.map((cita) => {
            const estado = configEstadoCita[cita.estado]
            const seleccionada = citaSeleccionada?.id === cita.id
            return (
              <li key={cita.id}>
                <Button
                  variant="ghost"
                  onClick={() => alSeleccionarCita(cita)}
                  style={{ "--tono": cita.color } as React.CSSProperties}
                  className={cn(
                    "relative h-auto w-full cursor-pointer flex-col items-stretch gap-1.5 overflow-hidden rounded-lg border p-3 pl-4 text-left whitespace-normal transition-all motion-reduce:transition-none",
                    seleccionada
                      ? "border-(--tono)/60 bg-[color-mix(in_srgb,var(--tono)_10%,transparent)] shadow-sm hover:bg-[color-mix(in_srgb,var(--tono)_14%,transparent)]"
                      : "border-border bg-secondary/40 hover:bg-secondary"
                  )}
                >
                  {/* Barra del color del barbero */}
                  <span className="absolute inset-y-0 left-0 w-1 bg-(--tono)" aria-hidden />

                  <span className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1 rounded-md bg-[color-mix(in_srgb,var(--tono)_12%,transparent)] px-1.5 py-0.5 text-[10px] font-semibold text-(--tono) tabular-nums">
                      <Clock className="size-2.5" aria-hidden />
                      {horas[cita.horaInicio]}
                    </span>
                    <StatusBadge
                      etiqueta={estado.etiqueta}
                      tono={estado.tono}
                      icono={estado.icono}
                    />
                  </span>

                  <span className="truncate text-sm font-semibold text-foreground">
                    {cita.cliente}
                  </span>
                  <span className="truncate text-[11px] leading-tight font-normal text-muted-foreground">
                    {cita.servicio}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-(--tono)" aria-hidden />
                    <span className="truncate text-[10px] font-normal text-muted-foreground">
                      {cita.barbero}
                    </span>
                  </span>
                </Button>
              </li>
            )
          })}
        </ul>
      )}
    </SectionCard>
  )
}
