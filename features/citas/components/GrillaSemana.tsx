import { cn } from "@shared/utils/cn"
import { resumenServicios } from "@features/citas/utils/servicios"
import type { CitaCalendario, SemanaCalendario } from "@features/citas/types/citas.types"

// Grilla custom de calendario: markup nativo — no existe pieza shadcn para esto.
// Responsive: <md muestra selector de días + lista de horas del día seleccionado;
// md+ muestra la grilla semanal completa. Cero scroll horizontal en móvil.
const columnasGrilla = { gridTemplateColumns: "64px repeat(7, 1fr)" }

interface Props {
  semana: SemanaCalendario
  citas: CitaCalendario[]
  diaSeleccionado: number
  alSeleccionarDia: (dia: number) => void
  alSeleccionarCita: (cita: CitaCalendario) => void
  /** "semana": grilla en md+ y agenda en móvil. "dia": agenda del día en todos los tamaños. */
  vista?: "semana" | "dia"
}

// Chip de cita — mismo lenguaje en la grilla semanal y en la lista móvil.
function CitaChip({
  cita,
  hora,
  alSeleccionar,
}: {
  cita: CitaCalendario
  hora: string
  alSeleccionar: (cita: CitaCalendario) => void
}) {
  return (
    <button
      type="button"
      onClick={() => alSeleccionar(cita)}
      aria-label={`Cita de ${cita.cliente}, ${resumenServicios(cita.servicios)}, ${hora}`}
      className="mb-1 w-full cursor-pointer rounded-md px-2 py-1.5 text-left text-[11px] transition-[box-shadow,filter] hover:shadow-md hover:brightness-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-reduce:transition-none"
      style={{
        color: cita.color,
        background: `color-mix(in srgb, ${cita.color} 14%, transparent)`,
        borderLeft: `3px solid ${cita.color}`,
      }}
    >
      <p className="truncate leading-tight font-semibold">{cita.cliente}</p>
      <p className="mt-0.5 truncate text-[10px] leading-tight opacity-75">
        {resumenServicios(cita.servicios)}
      </p>
    </button>
  )
}

export function GrillaSemana({
  semana,
  citas,
  diaSeleccionado,
  alSeleccionarDia,
  alSeleccionarCita,
  vista = "semana",
}: Props) {
  // Conteo por día para los badges de encabezado
  const citasPorDia = semana.dias.map((_, i) => citas.filter((c) => c.dia === i).length)

  return (
    <div className="flex w-full min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm md:min-h-0">
      {/* ── Agenda del día: siempre en móvil; en vista "dia" también en desktop ── */}
      <div className={cn("flex min-h-0 flex-col p-3 md:flex-1", vista === "semana" && "md:hidden")}>
        <div
          className="grid shrink-0 grid-cols-7 gap-1.5"
          role="tablist"
          aria-label="Días de la semana"
        >
          {semana.dias.map((dia, i) => (
            <button
              key={dia.etiqueta}
              type="button"
              onClick={() => alSeleccionarDia(i)}
              aria-pressed={diaSeleccionado === i}
              aria-label={`Ver citas del ${dia.etiqueta} ${dia.fecha}`}
              className={cn(
                "flex min-h-14 cursor-pointer flex-col items-center justify-center rounded-lg py-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-reduce:transition-none",
                diaSeleccionado === i
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary/50 text-foreground hover:bg-secondary",
                dia.esHoy && diaSeleccionado !== i && "ring-1 ring-primary/50"
              )}
            >
              <span
                className={cn(
                  "text-[9px] tracking-wider uppercase",
                  diaSeleccionado === i ? "text-primary-foreground/80" : "text-muted-foreground"
                )}
              >
                {dia.etiqueta.slice(0, 3)}
              </span>
              <span className="text-sm font-bold tabular-nums">{dia.fecha}</span>
              <span
                className={cn(
                  "mt-0.5 h-1 w-1 rounded-full",
                  citasPorDia[i] > 0
                    ? diaSeleccionado === i
                      ? "bg-primary-foreground"
                      : "bg-primary"
                    : "bg-transparent"
                )}
                aria-hidden
              />
            </button>
          ))}
        </div>

        <div className="scroll-fino mt-3 md:min-h-0 md:flex-1 md:overflow-y-auto">
          {semana.horas.map((hora, ih) => {
            const citasFranja = citas.filter(
              (c) => c.dia === diaSeleccionado && c.horaInicio === ih
            )
            return (
              <div
                key={hora}
                className={cn(
                  "flex min-h-12 gap-3 border-b border-border/60 py-1.5 last:border-b-0",
                  citasFranja.length === 0 && "opacity-70"
                )}
              >
                <span className="w-11 shrink-0 pt-1.5 text-right text-[10px] font-medium text-muted-foreground tabular-nums">
                  {hora}
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  {citasFranja.map((cita) => (
                    <CitaChip
                      key={cita.id}
                      cita={cita}
                      hora={hora}
                      alSeleccionar={alSeleccionarCita}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── md+: grilla semanal completa (solo vista "semana") — scroll interno propio ── */}
      <div
        className={cn(
          "scroll-fino hidden min-h-0 flex-1 overflow-y-auto",
          vista === "semana" && "md:block"
        )}
      >
        {/* Encabezados de día — sticky dentro de la tarjeta, no contra la página */}
        <div
          className="sticky top-0 z-10 grid border-b border-border bg-card"
          style={columnasGrilla}
        >
          <div className="p-3" aria-hidden />
          {semana.dias.map((dia, i) => (
            <button
              key={dia.etiqueta}
              type="button"
              onClick={() => alSeleccionarDia(i)}
              aria-label={`Ver citas del ${dia.etiqueta} ${dia.fecha}`}
              aria-pressed={diaSeleccionado === i}
              className={cn(
                "relative min-h-16 cursor-pointer border-l border-border px-2 py-2.5 text-center transition-colors hover:bg-secondary/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset motion-reduce:transition-none",
                diaSeleccionado === i && "bg-secondary/50"
              )}
            >
              <p
                className={cn(
                  "text-[10px] tracking-widest uppercase",
                  dia.esHoy ? "font-semibold text-primary" : "text-muted-foreground"
                )}
              >
                {dia.etiqueta}
              </p>
              {/* Hoy: número en círculo lleno — jerarquía inmediata */}
              {dia.esHoy ? (
                <span className="mx-auto mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground tabular-nums">
                  {dia.fecha}
                </span>
              ) : (
                <p className="mt-1 text-lg leading-7 font-bold text-foreground tabular-nums">
                  {dia.fecha}
                </p>
              )}
              {citasPorDia[i] > 0 && (
                <p className="mt-0.5 text-[9px] text-muted-foreground tabular-nums">
                  {citasPorDia[i]} {citasPorDia[i] === 1 ? "cita" : "citas"}
                </p>
              )}
              {/* Día seleccionado: subrayado dorado */}
              <span
                className={cn(
                  "absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-primary transition-opacity",
                  diaSeleccionado === i ? "opacity-100" : "opacity-0"
                )}
                aria-hidden
              />
            </button>
          ))}
        </div>

        {/* Franjas horarias */}
        {semana.horas.map((hora, ih) => (
          <div
            key={hora}
            className="grid border-b border-border/60"
            style={{ ...columnasGrilla, minHeight: "68px" }}
          >
            <div className="sticky left-0 -mt-2 bg-card p-2 pr-3 text-right text-[10px] font-medium text-muted-foreground tabular-nums">
              {hora}
            </div>
            {semana.dias.map((_, id) => {
              const citasFranja = citas.filter((c) => c.dia === id && c.horaInicio === ih)
              return (
                <div
                  key={id}
                  className={cn(
                    "border-l border-border/60 p-1 transition-colors hover:bg-secondary/20 motion-reduce:transition-none",
                    semana.dias[id].esHoy && "bg-primary/[0.04]",
                    diaSeleccionado === id && "bg-secondary/30"
                  )}
                >
                  {citasFranja.map((cita) => (
                    <CitaChip
                      key={cita.id}
                      cita={cita}
                      hora={hora}
                      alSeleccionar={alSeleccionarCita}
                    />
                  ))}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
