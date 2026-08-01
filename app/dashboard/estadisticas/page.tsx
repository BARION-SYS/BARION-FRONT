"use client"

import { useEffect, useMemo, useState } from "react"
import { CalendarCheck, CalendarX, DollarSign, Gauge, Repeat } from "lucide-react"
import { EstadisticasCancelacionesChart } from "@features/estadisticas/components/EstadisticasCancelacionesChart"
import { EstadisticasOcupacionChart } from "@features/estadisticas/components/EstadisticasOcupacionChart"
import { EstadisticasServiciosChart } from "@features/estadisticas/components/EstadisticasServiciosChart"
import { EstadisticasTendenciaChart } from "@features/estadisticas/components/EstadisticasTendenciaChart"
import { useEstadisticas } from "@features/estadisticas/hooks/useEstadisticas"
import { aPuntosGrafica, totalesDeSerie, ultimosDias } from "@features/dashboard/utils/serie"
import type { Granularidad } from "@features/dashboard/types/dashboard.types"
import { StatCard } from "@shared/components/stats/StatCard"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"
import { Tabs, TabsList, TabsTrigger } from "@shared/components/ui/tabs"
import { useFormato } from "@shared/hooks/useFormato"
import { inicioDiaLocal } from "@shared/utils/datetime"
import { useSedeActual } from "@store/sede.store"

const VENTANAS: { valor: string; etiqueta: string; dias: number; granularidad: Granularidad }[] = [
  { valor: "30d", etiqueta: "30 días", dias: 30, granularidad: "dia" },
  { valor: "6m", etiqueta: "6 meses", dias: 182, granularidad: "semana" },
  { valor: "1a", etiqueta: "12 meses", dias: 365, granularidad: "mes" },
]

/**
 * El análisis del negocio.
 *
 * **Casi todo aquí depende del agregado nocturno del worker, que todavía no
 * existe.** Cuando falta, los charts dicen "aún no hay historia" en vez de
 * pintar ceros: un cero se lee como un negocio parado, y lo que pasa es que
 * nadie ha calculado la serie. Lo único que funciona hoy es la distribución de
 * servicios, que es transaccional.
 */
export default function EstadisticasPage() {
  const { serie, servicios, loadingEstadisticas, error, fetchEstadisticas } = useEstadisticas()

  const sedeActual = useSedeActual()
  const { dinero, numero, porcentaje, timezone, fechaCorta } = useFormato()

  const [ventana, setVentana] = useState("30d")
  const elegida = VENTANAS.find((opcion) => opcion.valor === ventana) ?? VENTANAS[0]

  const rangoAgregado = useMemo(
    () => ({
      ...ultimosDias(timezone, elegida.dias, elegida.granularidad),
      sedeId: sedeActual?.id,
    }),
    [timezone, elegida.dias, elegida.granularidad, sedeActual?.id]
  )

  const rangoTransaccional = useMemo(
    () => ({
      desde: inicioDiaLocal(rangoAgregado.desde, timezone),
      // El agregado incluye el último día entero; el transaccional corta al
      // inicio del siguiente, que es lo mismo expresado en instantes.
      hasta: inicioDiaLocal(rangoAgregado.hasta, timezone),
      sedeId: sedeActual?.id,
    }),
    [rangoAgregado.desde, rangoAgregado.hasta, timezone, sedeActual?.id]
  )

  useEffect(() => {
    void fetchEstadisticas(rangoAgregado, rangoTransaccional)
  }, [fetchEstadisticas, rangoAgregado, rangoTransaccional])

  const puntos = useMemo(
    () => aPuntosGrafica(serie.puntos, (periodo) => fechaCorta(`${periodo}T12:00:00Z`)),
    [serie.puntos, fechaCorta]
  )
  const totales = useMemo(() => totalesDeSerie(serie.puntos), [serie.puntos])

  const sinHistoria = !serie.disponible

  if (loadingEstadisticas && serie.puntos.length === 0 && servicios.length === 0) {
    return (
      <main className="flex-1 space-y-6 overflow-y-auto p-4 md:p-6">
        <DataSkeleton variant="stats" count={5} />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <DataSkeleton variant="chart" className="xl:col-span-2" />
          <DataSkeleton variant="chart" />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <DataSkeleton variant="chart" />
          <DataSkeleton variant="chart" />
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 space-y-6 overflow-y-auto p-4 md:p-6">
      <Tabs value={ventana} onValueChange={setVentana}>
        <TabsList className="group-data-horizontal/tabs:h-9">
          {VENTANAS.map((opcion) => (
            <TabsTrigger
              key={opcion.valor}
              value={opcion.valor}
              className="cursor-pointer px-3 text-xs"
            >
              {opcion.etiqueta}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <section aria-label={`Indicadores de ${elegida.etiqueta}`}>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {/* Un guion, no un cero: la diferencia entre "no se sabe" y "no hubo". */}
          <StatCard
            titulo="Ingresos"
            valor={sinHistoria ? "—" : dinero(totales.ingresos)}
            icono={DollarSign}
            acento
            subtitulo={elegida.etiqueta}
          />
          <StatCard
            titulo="Completadas"
            valor={sinHistoria ? "—" : numero(totales.completadas)}
            icono={CalendarCheck}
            subtitulo="Citas cerradas"
          />
          <StatCard
            titulo="Perdidas"
            valor={sinHistoria ? "—" : numero(totales.canceladas)}
            icono={CalendarX}
            subtitulo="Canceladas y no asistió"
          />
          <StatCard
            titulo="Ocupación"
            valor={sinHistoria || totales.ocupacion === null ? "—" : porcentaje(totales.ocupacion)}
            icono={Gauge}
            subtitulo="Del tiempo ofrecido"
          />
          <StatCard
            titulo="Cupos recuperados"
            valor={sinHistoria ? "—" : numero(totales.cuposRecuperados)}
            icono={Repeat}
            subtitulo="Por lista de espera"
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3" aria-label="Tendencias">
        <div className="xl:col-span-2">
          <EstadisticasTendenciaChart
            datos={puntos}
            subtitulo={elegida.etiqueta}
            disponible={serie.disponible}
          />
        </div>
        <EstadisticasServiciosChart servicios={servicios} subtitulo={elegida.etiqueta} />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2" aria-label="Citas y ocupación">
        <EstadisticasCancelacionesChart
          datos={puntos}
          subtitulo={elegida.etiqueta}
          disponible={serie.disponible}
        />
        <EstadisticasOcupacionChart
          datos={puntos}
          subtitulo={elegida.etiqueta}
          disponible={serie.disponible}
        />
      </section>
    </main>
  )
}
