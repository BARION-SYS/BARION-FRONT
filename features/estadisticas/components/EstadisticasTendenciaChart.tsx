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

interface EstadisticasTendenciaChartProps {
  datos: PuntoGrafica[]
  subtitulo: string
  disponible: boolean
}

export function EstadisticasTendenciaChart({
  datos,
  subtitulo,
  disponible,
}: EstadisticasTendenciaChartProps) {
  const { dinero, compacto } = useFormato()

  return (
    <SectionCard titulo="Evolución de ingresos" subtitulo={subtitulo} className="h-full">
      {!disponible ? (
        <SinDatos
          titulo="Todavía no hay historia"
          detalle="La tendencia se calcula cada noche a partir de las citas cerradas."
          icono={TrendingUp}
          alto={200}
        />
      ) : (
        <>
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
                    formatear={(entrada) => `Ingresos: ${dinero(Number(entrada.value))}`}
                  />
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
            <span className="text-xs text-muted-foreground">Ingresos del período</span>
          </div>
        </>
      )}
    </SectionCard>
  )
}
