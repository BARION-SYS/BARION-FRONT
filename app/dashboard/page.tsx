"use client"

import { useEffect } from "react"
import { DashboardMetaChart } from "@features/dashboard/components/DashboardMetaChart"
import { DashboardIngresosChart } from "@features/dashboard/components/DashboardIngresosChart"
import { DashboardCitasCard } from "@features/dashboard/components/DashboardCitasCard"
import { DashboardBarberosCard } from "@features/dashboard/components/DashboardBarberosCard"
import { DashboardServiciosCard } from "@features/dashboard/components/DashboardServiciosCard"
import { useDashboard } from "@features/dashboard/hooks/useDashboard"
import { StatCard } from "@shared/components/stats/StatCard"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"

// Contenedor: instancia el hook UNA vez y reparte datos por props.
export default function DashboardPage() {
  const {
    kpis,
    ingresosSemana,
    ingresosMensuales,
    citasHoy,
    resumenBarberos,
    serviciosPopulares,
    loadingResumen,
    fetchResumen,
  } = useDashboard()

  useEffect(() => {
    void fetchResumen()
  }, [fetchResumen])

  if (loadingResumen) {
    return (
      <main className="flex-1 space-y-6 overflow-y-auto p-4 md:p-6">
        <DataSkeleton
          variant="stats"
          count={6}
          className="grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
        />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <DataSkeleton variant="chart" className="xl:col-span-2" />
          <DataSkeleton variant="chart" />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <DataSkeleton variant="list" count={5} className="lg:col-span-3" />
          <DataSkeleton variant="card" count={2} className="flex flex-col gap-4 lg:col-span-2" />
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 space-y-6 overflow-y-auto p-4 md:p-6">
      <section aria-label="Indicadores clave">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
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

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3" aria-label="Ingresos">
        <div className="xl:col-span-2">
          <DashboardIngresosChart datos={ingresosSemana} />
        </div>
        <DashboardMetaChart datos={ingresosMensuales} />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-5" aria-label="Actividad">
        <div className="lg:col-span-3">
          <DashboardCitasCard citas={citasHoy} />
        </div>
        <div className="flex flex-col gap-4 lg:col-span-2">
          <DashboardBarberosCard barberos={resumenBarberos} />
          <DashboardServiciosCard servicios={serviciosPopulares} />
        </div>
      </section>
    </main>
  )
}
