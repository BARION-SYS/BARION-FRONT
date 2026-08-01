"use client"

import { DollarSign, Gift, Scissors, TrendingUp } from "lucide-react"
import { StatCard } from "@shared/components/stats/StatCard"
import type { TotalesNomina } from "@features/nomina/types/nomina.types"
import { useFormato } from "@shared/hooks/useFormato"

interface NominaResumenProps {
  totales: TotalesNomina
}

export function NominaResumen({ totales }: NominaResumenProps) {
  const { dinero } = useFormato()

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <StatCard
        titulo="Producción total"
        valor={dinero(Number(totales.produccionCentavos))}
        icono={TrendingUp}
        subtitulo="Lo que se le cobró al cliente"
      />
      <StatCard
        titulo="Comisiones"
        valor={dinero(Number(totales.comisionesCentavos))}
        icono={DollarSign}
        subtitulo="La parte de cada barbero"
      />
      <StatCard
        titulo="Propinas"
        valor={dinero(Number(totales.propinasCentavos))}
        icono={Gift}
        subtitulo="Van íntegras a quien atendió"
      />
      <StatCard
        titulo="Total a pagar"
        valor={dinero(Number(totales.totalCentavos))}
        icono={Scissors}
        acento
        subtitulo="Comisiones + propinas + ajustes"
      />
    </div>
  )
}
