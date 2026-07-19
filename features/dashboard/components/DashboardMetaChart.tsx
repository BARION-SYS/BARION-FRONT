"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { ChartTooltip } from "@shared/components/charts/ChartTooltip"
import type { PuntoIngresoMensual } from "@features/dashboard/types/dashboard.types"
import { formatNumber, formatCompact } from "@shared/utils/numbers"

interface Props {
  datos: PuntoIngresoMensual[]
}

export function DashboardMetaChart({ datos }: Props) {
  return (
    <SectionCard titulo="Ingresos vs Meta" subtitulo="Comparativo mensual 2026">
      <ResponsiveContainer width="100%" height={180}>
        <BarChart
          data={datos}
          margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
          barSize={10}
          barGap={4}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="mes"
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${formatCompact(v)}`}
          />
          <Tooltip
            content={
              <ChartTooltip
                formatear={(e) =>
                  `${e.name === "ingresos" ? "Ingresos" : "Meta"}: $${formatNumber(Number(e.value))}`
                }
              />
            }
          />
          <Bar dataKey="ingresos" fill="var(--chart-1)" radius={[4, 4, 0, 0]} name="ingresos" />
          <Bar dataKey="meta" fill="var(--border)" radius={[4, 4, 0, 0]} name="meta" />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-3 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary" aria-hidden />
          <span className="text-xs text-muted-foreground">Ingresos</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-border" aria-hidden />
          <span className="text-xs text-muted-foreground">Meta</span>
        </div>
      </div>
    </SectionCard>
  )
}
