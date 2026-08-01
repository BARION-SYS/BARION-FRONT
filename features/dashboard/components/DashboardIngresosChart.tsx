"use client"

import { TrendingUp } from "lucide-react"
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
import { SinDatos } from "@shared/components/feedback/SinDatos"
import type { PuntoGrafica } from "@features/dashboard/utils/serie"
import { useFormato } from "@shared/hooks/useFormato"

interface DashboardIngresosChartProps {
  datos: PuntoGrafica[]
  subtitulo: string
  /** `false` mientras el job nocturno del worker no haya calculado la historia. */
  disponible: boolean
}

export function DashboardIngresosChart({
  datos,
  subtitulo,
  disponible,
}: DashboardIngresosChartProps) {
  const { dinero, compacto } = useFormato()

  return (
    <SectionCard titulo="Ingresos" subtitulo={subtitulo}>
      {!disponible ? (
        <SinDatos
          titulo="Todavía no hay tendencia"
          detalle="La historia se calcula cada noche. Los datos de hoy sí están arriba."
          icono={TrendingUp}
        />
      ) : (
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
              dataKey="etiqueta"
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(valor) => compacto(Number(valor))}
            />
            <Tooltip
              content={
                <ChartTooltip
                  formatear={(entrada) =>
                    entrada.name === "ingresos"
                      ? dinero(Number(entrada.value))
                      : `${entrada.value} citas`
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
      )}
    </SectionCard>
  )
}
