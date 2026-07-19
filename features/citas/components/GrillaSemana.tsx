import { cn } from "@shared/utils/cn"
import type { CitaCalendario, SemanaCalendario } from "@features/citas/types/citas.types"

// Grilla custom de calendario: markup nativo — no existe pieza shadcn para esto.
const columnasGrilla = { gridTemplateColumns: "60px repeat(7, 1fr)" }

interface Props {
  semana: SemanaCalendario
  citas: CitaCalendario[]
  diaSeleccionado: number
  alSeleccionarDia: (dia: number) => void
  alSeleccionarCita: (cita: CitaCalendario) => void
}

export function GrillaSemana({
  semana,
  citas,
  diaSeleccionado,
  alSeleccionarDia,
  alSeleccionarCita,
}: Props) {
  return (
    <div className="flex-1 overflow-auto rounded-xl border border-border bg-card">
      {/* Encabezados de día */}
      <div className="sticky top-0 z-10 grid border-b border-border bg-card" style={columnasGrilla}>
        <div className="p-3" aria-hidden />
        {semana.dias.map((dia, i) => (
          <button
            key={dia.etiqueta}
            type="button"
            onClick={() => alSeleccionarDia(i)}
            aria-label={`Ver citas del ${dia.etiqueta} ${dia.fecha}`}
            aria-pressed={diaSeleccionado === i}
            className={cn(
              "min-h-9 cursor-pointer border-l border-border p-3 text-center transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset motion-reduce:transition-none",
              diaSeleccionado === i && "bg-secondary"
            )}
          >
            <p className="text-[10px] tracking-widest text-muted-foreground uppercase">
              {dia.etiqueta}
            </p>
            <p
              className={cn(
                "mt-0.5 text-lg font-bold tabular-nums",
                dia.esHoy ? "text-primary" : "text-foreground"
              )}
            >
              {dia.fecha}
            </p>
            {dia.esHoy && (
              <span className="mx-auto mt-0.5 block h-1 w-1 rounded-full bg-primary" aria-hidden />
            )}
          </button>
        ))}
      </div>

      {/* Franjas horarias */}
      {semana.horas.map((hora, ih) => (
        <div
          key={hora}
          className="grid border-b border-border"
          style={{ ...columnasGrilla, minHeight: "64px" }}
        >
          <div className="sticky left-0 bg-card p-2 pt-3 pr-3 text-right text-[10px] text-muted-foreground tabular-nums">
            {hora}
          </div>
          {semana.dias.map((_, id) => {
            const citasFranja = citas.filter((c) => c.dia === id && c.horaInicio === ih)
            return (
              <div
                key={id}
                className={cn(
                  "border-l border-border p-1 transition-colors hover:bg-secondary/20 motion-reduce:transition-none",
                  diaSeleccionado === id && "bg-secondary/30"
                )}
              >
                {citasFranja.map((cita) => (
                  <button
                    key={cita.id}
                    type="button"
                    onClick={() => alSeleccionarCita(cita)}
                    aria-label={`Cita de ${cita.cliente}, ${cita.servicio}, ${hora}`}
                    className="mb-0.5 w-full cursor-pointer rounded-md px-2 py-1 text-left text-[10px] font-semibold transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-reduce:transition-none"
                    style={{
                      color: cita.color,
                      background: `color-mix(in srgb, ${cita.color} 12%, transparent)`,
                      borderLeft: `2px solid ${cita.color}`,
                    }}
                  >
                    <p className="truncate">{cita.cliente}</p>
                    <p className="truncate font-normal opacity-80">{cita.servicio}</p>
                  </button>
                ))}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
