"use client"

import { AlertTriangle, CalendarClock, Gauge, Store, Users } from "lucide-react"
import { StatCard } from "@shared/components/stats/StatCard"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"
import { useFormato } from "@shared/hooks/useFormato"
import { PlataformaSparklineChart } from "@features/plataforma/components/PlataformaSparklineChart"
import { direccionDe, variacion } from "@features/plataforma/utils/salud"
import { inventarioAlCierre } from "@features/plataforma/utils/series"
import type { MesPlataforma, ResumenPlataforma } from "@features/plataforma/types/plataforma.types"

interface PlataformaIndicadoresProps {
  resumen: ResumenPlataforma
  /** La historia mensual. Vacía mientras carga o si la api aún no la sirve. */
  meses: MesPlataforma[]
  adopcion: { activas: number; usando: number }
  atencion: { total: number; detalle: string }
  loading: boolean
}

/**
 * Los números del negocio de Barion, cada uno con su tendencia.
 *
 * El número grande sale del inventario de HOY —cierto en el instante en que se
 * pinta—; la mini-gráfica, de la historia mensual. **La tendencia de las citas
 * compara 30 días contra los 30 anteriores**, no el mes en curso contra el
 * pasado: un mes a medias siempre parece una caída.
 */
export function PlataformaIndicadores({
  resumen,
  meses,
  adopcion,
  atencion,
  loading,
}: PlataformaIndicadoresProps) {
  const { numero, porcentaje, mesUTC } = useFormato()

  if (loading) return <DataSkeleton variant="stats" count={5} />

  // Las mini-gráficas dejan fuera el mes en curso por la misma razón: su último
  // punto caería siempre, y un trazo que acaba en picado se lee como alarma.
  const cerrados = meses.slice(0, -1)
  const tendencia = (valor: (mes: MesPlataforma) => number) =>
    cerrados.map((mes) => ({ etiqueta: mesUTC(mes.mes), valor: valor(mes) }))

  // El inventario al cierre de cada mes. Se calcula con TODOS los meses —el
  // en curso incluido, que resta lo que entró después— y se descarta su punto.
  const alCierre = inventarioAlCierre(
    resumen.total,
    meses.map((mes) => mes.altas)
  )
  const acumulado = cerrados.map((mes, i) => ({ etiqueta: mesUTC(mes.mes), valor: alCierre[i] }))

  const altasDelMes = meses.at(-1)?.altas ?? 0
  const cambioCitas = variacion(resumen.citas30d, resumen.citas30dPrevios)
  const adopcionPct = adopcion.activas > 0 ? (adopcion.usando / adopcion.activas) * 100 : null

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5">
      <StatCard
        titulo="Barberías"
        valor={numero(resumen.total)}
        subtitulo={`${numero(resumen.porEstado.activa)} activas · ${numero(resumen.enPrueba)} en prueba`}
        cambio={altasDelMes > 0 ? `+${numero(altasDelMes)} este mes` : "Ninguna alta este mes"}
        tendencia={altasDelMes > 0 ? "sube" : "neutra"}
        icono={Store}
        acento
        className="col-span-2 lg:col-span-1"
        grafica={
          <PlataformaSparklineChart puntos={acumulado} color="var(--primary)" formatear={numero} />
        }
      />
      <StatCard
        titulo="Citas · 30 días"
        valor={numero(resumen.citas30d)}
        subtitulo={`${numero(resumen.citasTotal)} desde el principio`}
        cambio={
          cambioCitas === null
            ? "Sin mes anterior para comparar"
            : `${cambioCitas > 0 ? "+" : ""}${porcentaje(cambioCitas)} vs. 30 días previos`
        }
        tendencia={direccionDe(cambioCitas)}
        icono={CalendarClock}
        grafica={
          <PlataformaSparklineChart
            puntos={tendencia((mes) => mes.citasCreadas)}
            color="var(--chart-1)"
            formatear={(valor) => `${numero(valor)} citas`}
          />
        }
      />
      {/* La clientela sumada es el tamaño real de lo que sostiene Barion:
          veinte barberías con dos mil personas debajo son otro producto que
          veinte con cincuenta */}
      <StatCard
        titulo="Clientes"
        valor={numero(resumen.clientesTotal)}
        subtitulo={
          resumen.clientesNuevos30d > 0
            ? `${numero(resumen.clientesNuevos30d)} nuevos en 30 días`
            : "Ninguno nuevo en 30 días"
        }
        icono={Users}
        grafica={
          <PlataformaSparklineChart
            puntos={tendencia((mes) => mes.clientesNuevos)}
            color="var(--chart-3)"
            formatear={(valor) => `${numero(valor)} nuevos`}
          />
        }
      />
      {/* La adopción es el denominador honesto: cien barberías dadas de alta
          con veinte creando citas es otro negocio que cincuenta con cincuenta */}
      <StatCard
        titulo="Adopción"
        valor={adopcionPct === null ? "—" : porcentaje(adopcionPct)}
        subtitulo={`${numero(adopcion.usando)} de ${numero(adopcion.activas)} activas crearon citas en 30 días`}
        icono={Gauge}
        grafica={
          <PlataformaSparklineChart
            puntos={tendencia((mes) => mes.barberiasConActividad)}
            color="var(--chart-2)"
            formatear={(valor) => `${numero(valor)} con actividad`}
          />
        }
      />
      <StatCard
        titulo="Requieren atención"
        valor={numero(atencion.total)}
        subtitulo={atencion.detalle}
        icono={AlertTriangle}
      />
    </div>
  )
}
