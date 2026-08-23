"use client"

import { DollarSign, Gift, Scissors, TrendingUp } from "lucide-react"
import { StatCard } from "@shared/components/stats/StatCard"
import type { TotalesNomina } from "@features/nomina/types/nomina.types"
import { useFormato } from "@shared/hooks/useFormato"
import { useTextos } from "@shared/textos/useTextos"

interface NominaResumenProps {
  totales: TotalesNomina
}

export function NominaResumen({ totales }: NominaResumenProps) {
  const t = useTextos("nomina.resumen")
  const { dinero } = useFormato()

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <StatCard
        titulo={t("produccion")}
        valor={dinero(Number(totales.produccionCentavos))}
        icono={TrendingUp}
        subtitulo={t("produccionDetalle")}
      />
      <StatCard
        titulo={t("comisiones")}
        valor={dinero(Number(totales.comisionesCentavos))}
        icono={DollarSign}
        subtitulo={t("comisionesDetalle")}
      />
      <StatCard
        titulo={t("propinas")}
        valor={dinero(Number(totales.propinasCentavos))}
        icono={Gift}
        subtitulo={t("propinasDetalle")}
      />
      <StatCard
        titulo={t("total")}
        valor={dinero(Number(totales.totalCentavos))}
        icono={Scissors}
        acento
        subtitulo={t("totalDetalle")}
      />
    </div>
  )
}
