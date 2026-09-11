"use client"

import { CalendarX } from "lucide-react"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"
import { SinDatos } from "@shared/components/feedback/SinDatos"
import { InfoTooltip } from "@shared/components/tooltips/InfoTooltip"
import { useFormato } from "@shared/hooks/useFormato"
import { colorDeTono } from "@shared/utils/tono"
import type { Desenlace, ResumenDesenlace } from "@features/plataforma/utils/series"
import type { TonoEstado } from "@shared/types/ui.types"

interface PlataformaDesenlaceChartProps {
  desenlace: ResumenDesenlace | null
  ventanaDias: number
  loading: boolean
}

// Orden fijo: de lo bueno a lo que pide una llamada. El tono es de estado, con
// su etiqueta y su cifra al lado — nunca solo color.
const DESENLACES: { clave: Desenlace; etiqueta: string; tono: TonoEstado; detalle: string }[] = [
  { clave: "atendidas", etiqueta: "Atendidas", tono: "exito", detalle: "Completadas" },
  { clave: "canceladas", etiqueta: "Canceladas", tono: "neutro", detalle: "Por quien sea" },
  { clave: "no_asistio", etiqueta: "No asistió", tono: "peligro", detalle: "Nadie vino" },
  {
    clave: "sin_cerrar",
    etiqueta: "Sin cerrar",
    tono: "advertencia",
    detalle: "Ya pasaron y nadie marcó qué ocurrió",
  },
]

/**
 * En qué terminaron las citas que ya debieron ocurrir.
 *
 * «Sin cerrar» es la cifra que más dice de cómo usan Barion: citas del pasado
 * que siguen como reservadas. No es un fallo del sistema, es una barbería que
 * agenda aquí pero no marca lo que pasó — y sin eso la nómina y las
 * estadísticas no tienen de qué salir.
 */
export function PlataformaDesenlaceChart({
  desenlace,
  ventanaDias,
  loading,
}: PlataformaDesenlaceChartProps) {
  const { numero, porcentaje } = useFormato()

  return (
    <SectionCard
      titulo="Qué pasó con lo agendado"
      subtitulo={`Citas de los últimos ${ventanaDias} días que ya debieron ocurrir`}
      className="h-full"
    >
      {loading || !desenlace ? (
        <DataSkeleton variant="card" />
      ) : desenlace.total === 0 ? (
        <SinDatos
          titulo="Ninguna cita en la ventana"
          detalle="Cuando pasen sus primeras citas, aquí se ve cuántas se atendieron."
          icono={CalendarX}
          alto={160}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <div
            className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full"
            role="img"
            aria-label={DESENLACES.map((d) => `${d.etiqueta}: ${desenlace.partes[d.clave]}`).join(
              ", "
            )}
          >
            {DESENLACES.filter((d) => desenlace.partes[d.clave] > 0).map((d) => (
              <InfoTooltip
                key={d.clave}
                contenido={`${d.etiqueta}: ${numero(desenlace.partes[d.clave])}`}
              >
                <span
                  className="h-full min-w-1.5 grow-(--peso) basis-0 bg-(--tono) transition-opacity hover:opacity-80"
                  style={
                    {
                      "--peso": desenlace.partes[d.clave],
                      "--tono": colorDeTono[d.tono],
                    } as React.CSSProperties
                  }
                />
              </InfoTooltip>
            ))}
          </div>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
            {DESENLACES.map((d) => (
              <div key={d.clave} className="min-w-0">
                <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span
                    className="size-2 shrink-0 rounded-full bg-(--tono)"
                    style={{ "--tono": colorDeTono[d.tono] } as React.CSSProperties}
                    aria-hidden
                  />
                  {d.etiqueta}
                </dt>
                <dd className="mt-0.5 flex items-baseline gap-1.5">
                  <span className="text-lg font-semibold tabular-nums">
                    {porcentaje((desenlace.partes[d.clave] / desenlace.total) * 100)}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {numero(desenlace.partes[d.clave])}
                  </span>
                </dd>
                <dd className="truncate text-xs text-muted-foreground">{d.detalle}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </SectionCard>
  )
}
