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
import { Button } from "@shared/components/ui/button"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { ChartTooltip } from "@shared/components/charts/ChartTooltip"
import type { PuntoIngresoDiario } from "@features/dashboard/types/dashboard.types"
import { formatNumber } from "@shared/utils/numbers"

interface Props {
  datos: PuntoIngresoDiario[]
}

export function DashboardIngresosChart({ datos }: Props) {
  return (
    <SectionCard
      titulo="Ingresos esta semana"
      subtitulo="14 — 20 Julio 2026"
      accion={
        <div
          className="flex items-center gap-1 rounded-lg bg-secondary p-1"
          role="group"
          aria-label="Rango de tiempo"
        >
          {["Sem", "Mes", "Año"].map((rango) => (
            <Button
              key={rango}
              size="sm"
              variant={rango === "Sem" ? "default" : "ghost"}
              aria-pressed={rango === "Sem"}
              className="h-7 px-2.5 text-xs"
            >
              {rango}
            </Button>
          ))}
        </div>
      }
    >
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={datos} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradienteIngresos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="dia"
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip
            content={
              <ChartTooltip
                formatear={(e) =>
                  e.name === "ingresos" ? `$${formatNumber(Number(e.value))}` : `${e.value} citas`
                }
              />
            }
          />
          <Area
            type="monotone"
            dataKey="ingresos"
            stroke="var(--chart-1)"
            strokeWidth={2}
            fill="url(#gradienteIngresos)"
            dot={false}
            activeDot={{ r: 4, fill: "var(--chart-1)" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </SectionCard>
  )
}
