"use client"

import { useEffect } from "react"
import { StatCard } from "@shared/components/stats/StatCard"
import { EstadisticasTendenciaChart } from "@features/estadisticas/components/EstadisticasTendenciaChart"
import { EstadisticasServiciosChart } from "@features/estadisticas/components/EstadisticasServiciosChart"
import { EstadisticasCancelacionesChart } from "@features/estadisticas/components/EstadisticasCancelacionesChart"
import { EstadisticasClientesChart } from "@features/estadisticas/components/EstadisticasClientesChart"
import { useEstadisticas } from "@features/estadisticas/hooks/useEstadisticas"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"

// Padre de la pantalla: única instancia del hook, reparte datos por props.
export default function EstadisticasPage() {
  const {
    kpis,
    evolucionMensual,
    citasPorMes,
    topServicios,
    loadingEstadisticas,
    error,
    fetchEstadisticas,
  } = useEstadisticas()

  useEffect(() => {
    fetchEstadisticas()
  }, [fetchEstadisticas])

  if (loadingEstadisticas) {
    return (
      <main className="flex-1 space-y-6 overflow-y-auto p-4 md:p-6">
        <DataSkeleton variant="stats" count={4} />
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

  if (error) {
    return (
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      </main>
    )
  }

  return (
    <main className="flex-1 space-y-6 overflow-y-auto p-4 md:p-6">
      <section aria-label="Indicadores del año">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {kpis.map((kpi) => (
            <StatCard
              key={kpi.clave}
              titulo={kpi.titulo}
              valor={kpi.valor}
              cambio={kpi.cambio}
              tendencia={kpi.tendencia}
              icono={kpi.icono}
              acento={kpi.acento}
              subtitulo={kpi.subtitulo}
            />
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3" aria-label="Tendencias">
        <div className="xl:col-span-2">
          <EstadisticasTendenciaChart datos={evolucionMensual} />
        </div>
        <EstadisticasServiciosChart servicios={topServicios} />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2" aria-label="Citas y clientes">
        <EstadisticasCancelacionesChart datos={citasPorMes} />
        <EstadisticasClientesChart datos={evolucionMensual} />
      </section>
    </main>
  )
}
