"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { ChartTooltip } from "@shared/components/charts/ChartTooltip"
import type { PuntoEvolucionMensual } from "@features/estadisticas/types/estadisticas.types"
import { formatNumber, formatCompact } from "@shared/utils/numbers"

interface Props {
  datos: PuntoEvolucionMensual[]
}

export function EstadisticasTendenciaChart({ datos }: Props) {
  return (
    <SectionCard titulo="Evolución de ingresos" subtitulo="Enero — Julio 2026" className="h-full">
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={datos} margin={{ top: 0, right: 0, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="gradienteTendencia" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
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
              <ChartTooltip formatear={(e) => `Ingresos: $${formatNumber(Number(e.value))}`} />
            }
          />
          <Area
            type="monotone"
            dataKey="ingresos"
            stroke="var(--chart-1)"
            strokeWidth={2}
            fill="url(#gradienteTendencia)"
            dot={false}
            activeDot={{ r: 4, fill: "var(--chart-1)" }}
            name="ingresos"
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-3 flex items-center gap-1.5">
        <span className="inline-block h-2.5 w-2.5 rounded-sm bg-(--chart-1)" aria-hidden />
        <span className="text-xs text-muted-foreground">Ingresos mensuales</span>
      </div>
    </SectionCard>
  )
}
