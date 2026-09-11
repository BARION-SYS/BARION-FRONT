"use client"

import { Activity, CalendarCheck, CalendarClock, Users } from "lucide-react"
import { StatCard } from "@shared/components/stats/StatCard"
import { useFormato } from "@shared/hooks/useFormato"
import { PlataformaSparklineChart } from "@features/plataforma/components/PlataformaSparklineChart"
import { direccionDe, variacion } from "@features/plataforma/utils/salud"
import type { ResumenDesenlace } from "@features/plataforma/utils/series"
import type { BarberiaFicha, SemanaActividad } from "@features/plataforma/types/plataforma.types"

interface IndicadoresFichaProps {
  ficha: BarberiaFicha
  /** `null` mientras la actividad no haya llegado. */
  semanas: SemanaActividad[] | null
  desenlace: ResumenDesenlace | null
  ventanaDias: number
}

/**
 * Los cuatro números de una barbería. Los dos primeros salen de la ficha y se
 * pintan en cuanto llega; los que dependen de la actividad esperan con un guion
 * —un cero mientras carga se leería como «no hizo nada»—.
 */
export function IndicadoresFicha({
  ficha,
  semanas,
  desenlace,
  ventanaDias,
}: IndicadoresFichaProps) {
  const { numero, porcentaje, relativo, diaUTC } = useFormato()
  const cambio = variacion(ficha.uso.citas30d, ficha.uso.citas30dPrevios)
  // Sin la semana en curso, por lo mismo que en el tablero: siempre parece caída.
  const tendencia = (semanas ?? []).slice(0, -1).map((semana) => ({
    etiqueta: `Semana del ${diaUTC(semana.semana)}`,
    valor: semana.citasCreadas,
  }))
  const asistencia =
    desenlace && desenlace.total > 0 ? (desenlace.partes.atendidas / desenlace.total) * 100 : null

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <StatCard
        titulo="Clientes"
        valor={numero(ficha.uso.clientesTotal)}
        subtitulo={`${numero(ficha.uso.clientesNuevos30d)} nuevos en 30 días`}
        icono={Users}
      />
      <StatCard
        titulo="Citas · 30 días"
        valor={numero(ficha.uso.citas30d)}
        subtitulo={`${numero(ficha.uso.citasTotal)} desde el alta`}
        cambio={
          cambio === null
            ? "Sin mes anterior para comparar"
            : `${cambio > 0 ? "+" : ""}${porcentaje(cambio)} vs. 30 días previos`
        }
        tendencia={direccionDe(cambio)}
        icono={CalendarClock}
        grafica={
          <PlataformaSparklineChart
            puntos={tendencia}
            color="var(--chart-1)"
            formatear={(valor) => `${numero(valor)} citas`}
          />
        }
      />
      <StatCard
        titulo="Asistencia"
        valor={asistencia === null ? "—" : porcentaje(asistencia)}
        subtitulo={
          desenlace
            ? `${numero(desenlace.partes.atendidas)} de ${numero(desenlace.total)} citas en ${numero(ventanaDias)} días`
            : "Citas atendidas de las que ya pasaron"
        }
        icono={CalendarCheck}
      />
      <StatCard
        titulo="Última cita creada"
        // «Nunca» y no un guion: que jamás se haya creado una cita es un dato.
        valor={ficha.uso.ultimaCitaCreadaEn ? relativo(ficha.uso.ultimaCitaCreadaEn) : "Nunca"}
        subtitulo="Cuándo se agendó, no cuándo ocurre"
        icono={Activity}
      />
    </div>
  )
}
