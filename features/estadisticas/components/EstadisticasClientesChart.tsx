"use client"

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { ChartTooltip } from "@shared/components/charts/ChartTooltip"
import type { PuntoEvolucionMensual } from "@features/estadisticas/types/estadisticas.types"

interface Props {
  datos: PuntoEvolucionMensual[]
}

export function EstadisticasClientesChart({ datos }: Props) {
  return (
    <SectionCard
      titulo="Crecimiento de clientes"
      subtitulo="Nuevos registros mensuales"
      className="h-full"
    >
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={datos} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
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
          />
          <Tooltip content={<ChartTooltip formatear={(e) => `Clientes: ${e.value}`} />} />
          <Line
            type="monotone"
            dataKey="clientes"
            stroke="var(--chart-3)"
            strokeWidth={2}
            dot={{ fill: "var(--chart-3)", r: 3 }}
            activeDot={{ r: 4, fill: "var(--chart-3)" }}
            name="clientes"
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-3 flex items-center gap-1.5">
        <span className="inline-block h-2.5 w-2.5 rounded-sm bg-(--chart-3)" aria-hidden />
        <span className="text-xs text-muted-foreground">Clientes nuevos</span>
      </div>
    </SectionCard>
  )
}
