import { DollarSign, Gift, Scissors, TrendingUp } from "lucide-react"
import { StatCard } from "@shared/components/stats/StatCard"
import type { TotalesNomina } from "@features/nomina/types/nomina.types"
import { formatNumber } from "@shared/utils/numbers"

interface Props {
  totales: TotalesNomina
}

export function NominaResumen({ totales }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <StatCard
        titulo="Producción total"
        valor={`$${formatNumber(totales.produccion)}`}
        icono={TrendingUp}
        subtitulo="Ventas del periodo"
      />
      <StatCard
        titulo="Comisiones totales"
        valor={`$${formatNumber(totales.comisiones)}`}
        icono={DollarSign}
        subtitulo="Según % de cada barbero"
      />
      <StatCard
        titulo="Propinas totales"
        valor={`$${formatNumber(totales.propinas)}`}
        icono={Gift}
        subtitulo="Acumuladas"
      />
      <StatCard
        titulo="Total a pagar"
        valor={`$${formatNumber(totales.totalAPagar)}`}
        icono={Scissors}
        acento
        subtitulo="Comisiones + propinas"
      />
    </div>
  )
}
