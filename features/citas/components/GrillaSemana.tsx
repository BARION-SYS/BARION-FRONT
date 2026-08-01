"use client"

import { useFormato } from "@shared/hooks/useFormato"
import { cn } from "@shared/utils/cn"
import { tokenDeColor } from "@shared/utils/color"
import { resumenServicios } from "@features/citas/utils/servicios"
import { configEstadoCita } from "@features/citas/utils/estadoCita"
import type { Cita } from "@features/citas/types/citas.types"

interface GrillaSemanaProps {
  /** Fechas LOCALES de la sede, en orden. Una sola = vista de día. */
  fechas: string[]
  citas: Cita[]
  /** Fecha local de hoy en la sede, para marcar la columna. */
  hoy: string
  onSeleccionar: (cita: Cita) => void
}

const MINUTOS_POR_FILA = 60
const ALTO_FILA_REM = 3.5
/** Si el día está vacío se pinta de 8 a 20: una grilla sin filas no dice nada. */
const HORA_MIN_POR_DEFECTO = 8
const HORA_MAX_POR_DEFECTO = 20

/**
 * La semana, sobre instantes reales.
 *
 * Cada cita se coloca por su hora LOCAL de la sede —no la del navegador— y su
 * alto sale de su duración real, no de un número de franjas: una cita de 40
 * minutos ocupa 40 minutos, y redondearla a una hora escondía el hueco que
 * quedaba detrás.
 *
 * Markup nativo a propósito: no hay pieza de shadcn para una grilla de
 * calendario, y las que hay resuelven otra cosa.
 */
export function GrillaSemana({ fechas, citas, hoy, onSeleccionar }: GrillaSemanaProps) {
  const { hora, fechaClave, minutosLocales, diaSemanaCorto } = useFormato()

  const porFecha = new Map<string, Cita[]>(fechas.map((fecha) => [fecha, []]))
  for (const cita of citas) {
    porFecha.get(fechaClave(cita.iniciaEn))?.push(cita)
  }

  const inicios = citas.map((cita) => minutosLocales(cita.iniciaEn))
  const fines = citas.map((cita) => minutosLocales(cita.terminaEn))
  const horaMin = Math.min(
    HORA_MIN_POR_DEFECTO,
    ...inicios.map((minuto) => Math.floor(minuto / 60))
  )
  const horaMax = Math.max(HORA_MAX_POR_DEFECTO, ...fines.map((minuto) => Math.ceil(minuto / 60)))
  const filas = Array.from({ length: horaMax - horaMin }, (_, i) => horaMin + i)

  const columnas = { gridTemplateColumns: `64px repeat(${fechas.length}, 1fr)` }

  return (
    <div className="scroll-fino overflow-x-auto rounded-xl border border-border bg-card">
      <div className="min-w-[640px]">
        <div className="grid border-b border-border" style={columnas}>
          <div />
          {fechas.map((fecha) => (
            <div
              key={fecha}
              className={cn(
                "px-2 py-2 text-center text-xs font-medium",
                fecha === hoy ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <span className="block capitalize">{diaSemanaCorto(`${fecha}T12:00:00Z`)}</span>
              <span className={cn("text-sm", fecha === hoy && "font-semibold text-primary")}>
                {Number(fecha.slice(8, 10))}
              </span>
            </div>
          ))}
        </div>

        <div className="grid" style={columnas}>
          <div>
            {filas.map((h) => (
              <div
                key={h}
                className="pr-2 text-right text-[10px] text-muted-foreground"
                style={{ height: `${ALTO_FILA_REM}rem` }}
              >
                {String(h).padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {fechas.map((fecha) => (
            <div
              key={fecha}
              className="relative border-l border-border"
              style={{ height: `${filas.length * ALTO_FILA_REM}rem` }}
            >
              {filas.map((h) => (
                <div
                  key={h}
                  className="border-b border-border/60"
                  style={{ height: `${ALTO_FILA_REM}rem` }}
                />
              ))}

              {(porFecha.get(fecha) ?? []).map((cita) => {
                const inicio = minutosLocales(cita.iniciaEn)
                const fin = minutosLocales(cita.terminaEn)
                const desde = ((inicio - horaMin * 60) / MINUTOS_POR_FILA) * ALTO_FILA_REM
                const alto = ((fin - inicio) / MINUTOS_POR_FILA) * ALTO_FILA_REM
                const color = tokenDeColor(cita.barbero?.indiceColor ?? 0)
                const estado = configEstadoCita[cita.estado]

                return (
                  <button
                    key={cita.id}
                    type="button"
                    onClick={() => onSeleccionar(cita)}
                    // El color va como variable CSS, nunca como estilo directo:
                    // la paleta se re-tiñe con la marca de la barbería.
                    style={
                      {
                        "--tono": color,
                        top: `${desde}rem`,
                        height: `${Math.max(alto, 1.5)}rem`,
                      } as React.CSSProperties
                    }
                    className={cn(
                      "absolute inset-x-1 overflow-hidden rounded-md border-l-2 border-(--tono) px-1.5 py-1 text-left text-[11px] leading-tight",
                      "bg-[color-mix(in_srgb,var(--tono)_14%,transparent)] hover:bg-[color-mix(in_srgb,var(--tono)_24%,transparent)]",
                      // Lo que ya no ocupa sitio se atenúa: sigue en la grilla
                      // porque pasó, pero no compite con lo que está por venir.
                      (cita.estado === "cancelada" || cita.estado === "no_asistio") &&
                        "line-through opacity-50"
                    )}
                  >
                    <span className="block truncate font-medium">
                      {hora(cita.iniciaEn)} · {cita.cliente?.nombre ?? "Sin cliente"}
                    </span>
                    <span className="block truncate text-muted-foreground">
                      {resumenServicios(cita.servicios.map((linea) => linea.nombre))}
                    </span>
                    <span className="sr-only">{estado.etiqueta}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
