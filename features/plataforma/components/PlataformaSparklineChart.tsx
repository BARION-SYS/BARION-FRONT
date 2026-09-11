"use client"

import { useId } from "react"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts"
import { ChartTooltip } from "@shared/components/charts/ChartTooltip"

export interface PuntoSparkline {
  etiqueta: string
  valor: number
}

interface PlataformaSparklineChartProps {
  puntos: PuntoSparkline[]
  /** Token de gráfica: `var(--chart-1)`. Nunca un color literal. */
  color: string
  formatear: (valor: number) => string
}

/**
 * La tendencia de un indicador, sin ejes ni rejilla: el número grande de la
 * tarjeta es lo que se lee, esto solo dice hacia dónde va. Lleva tooltip igual
 * —un trazo que no se puede consultar obliga a adivinar qué mes es cada pico—.
 */
export function PlataformaSparklineChart({
  puntos,
  color,
  formatear,
}: PlataformaSparklineChartProps) {
  // Un id por instancia: con varias tarjetas en pantalla, un gradiente con el
  // mismo id pintaría todas del color de la primera.
  const gradiente = `sparkline-${useId().replace(/:/g, "")}`

  if (puntos.length < 2) return null

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={puntos} margin={{ top: 2, right: 2, left: 2, bottom: 0 }}>
        <defs>
          <linearGradient id={gradiente} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {/* Eje oculto: no se pinta, pero es lo que le da al tooltip la etiqueta
            del mes en vez del índice del punto */}
        <XAxis dataKey="etiqueta" hide />
        <Tooltip
          cursor={{ stroke: "var(--border)" }}
          content={<ChartTooltip formatear={(entrada) => formatear(Number(entrada.value))} />}
        />
        <Area
          type="monotone"
          dataKey="valor"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradiente})`}
          dot={false}
          activeDot={{ r: 3, fill: color, strokeWidth: 0 }}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
