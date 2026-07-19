"use client"

import { useEffect, useState } from "react"
import { Download } from "lucide-react"
import { NominaBarberoDetail } from "@features/nomina/components/NominaBarberoDetail"
import { NominaResumen } from "@features/nomina/components/NominaResumen"
import { NominaBarberoCard } from "@features/nomina/components/NominaBarberoCard"
import { useNomina } from "@features/nomina/hooks/useNomina"
import type { PeriodoNomina, TotalesNomina } from "@features/nomina/types/nomina.types"
import { Button } from "@shared/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@shared/components/ui/tabs"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"

// Contenedor: única instancia del hook; los hijos reciben datos + callbacks por props.
export default function NominaPage() {
  const { periodos, nominaBarberos, loadingNomina, error, fetchNomina } = useNomina()

  const [periodo, setPeriodo] = useState<PeriodoNomina>("semana")
  const [idSeleccionado, setIdSeleccionado] = useState<number | null>(null)

  useEffect(() => {
    fetchNomina(periodo)
  }, [fetchNomina, periodo])

  const seleccionado =
    nominaBarberos.find((b) => b.id === idSeleccionado) ?? nominaBarberos[0] ?? null
  const etiquetaPeriodo = periodos.find((p) => p.valor === periodo)?.etiqueta ?? ""

  const totales: TotalesNomina = nominaBarberos.reduce(
    (acc, b) => ({
      produccion: acc.produccion + b.produccion,
      comisiones: acc.comisiones + b.comision,
      propinas: acc.propinas + b.propinas,
      totalAPagar: acc.totalAPagar + b.total,
    }),
    { produccion: 0, comisiones: 0, propinas: 0, totalAPagar: 0 }
  )

  return (
    <main className="flex-1 space-y-6 overflow-y-auto p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={periodo} onValueChange={(valor) => setPeriodo(valor as PeriodoNomina)}>
          <TabsList className="group-data-horizontal/tabs:h-9">
            {periodos.map((p) => (
              <TabsTrigger key={p.valor} value={p.valor} className="cursor-pointer px-3 text-xs">
                {p.etiqueta}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Button variant="outline" size="lg" className="cursor-pointer">
          <Download aria-hidden />
          Exportar
        </Button>
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {loadingNomina && nominaBarberos.length === 0 ? (
        <div className="space-y-6">
          <DataSkeleton variant="stats" count={4} />
          <DataSkeleton variant="list" count={3} />
        </div>
      ) : (
        <>
          <section aria-label="Resumen de nómina">
            <NominaResumen totales={totales} />
          </section>

          <section
            className="grid grid-cols-1 gap-4 lg:grid-cols-3"
            aria-label="Nómina por barbero"
          >
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-foreground">Equipo</h2>
              {nominaBarberos.map((b) => (
                <NominaBarberoCard
                  key={b.id}
                  barbero={b}
                  participacion={
                    totales.produccion > 0 ? (b.produccion / totales.produccion) * 100 : 0
                  }
                  seleccionado={b.id === seleccionado?.id}
                  onSeleccionar={() => setIdSeleccionado(b.id)}
                />
              ))}
            </div>
            <div className="lg:col-span-2">
              {seleccionado && (
                <NominaBarberoDetail barbero={seleccionado} etiquetaPeriodo={etiquetaPeriodo} />
              )}
            </div>
          </section>
        </>
      )}
    </main>
  )
}
