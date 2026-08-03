"use client"

import type { LucideIcon } from "lucide-react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { ChartTooltip } from "@shared/components/charts/ChartTooltip"
import { SinDatos } from "@shared/components/feedback/SinDatos"
import { useFormato } from "@shared/hooks/useFormato"
import type { SegmentoInventario } from "@features/plataforma/types/plataforma.types"

interface PlataformaSegmentosChartProps {
  titulo: string
  subtitulo: string
  segmentos: SegmentoInventario[]
  /** Token de gráfica: `var(--chart-3)`. Nunca un color literal. */
  color: string
  vacio: { titulo: string; detalle: string; icono: LucideIcon }
}

/**
 * Un corte del inventario por una dimensión de pocas categorías: país, plan.
 *
 * Barras horizontales y no verticales porque lo que hay que leer es la etiqueta
 * —«Colombia», «Sin plan»—, y en vertical se rota hasta ser ilegible en un
 * móvil. Los dos cortes comparten componente: son la misma pregunta cambiando de
 * eje, y duplicarlo garantizaría que uno de los dos se quede sin arreglar.
 */
export function PlataformaSegmentosChart({
  titulo,
  subtitulo,
  segmentos,
  color,
  vacio,
}: PlataformaSegmentosChartProps) {
  const { numero } = useFormato()
  // Cada barra necesita su aire: con muchas categorías el alto crece en vez de
  // apretarlas hasta que las etiquetas se pisan.
  const alto = Math.max(160, segmentos.length * 40)

  return (
    <SectionCard titulo={titulo} subtitulo={subtitulo} className="h-full">
      {segmentos.length === 0 ? (
        <SinDatos titulo={vacio.titulo} detalle={vacio.detalle} icono={vacio.icono} />
      ) : (
        <ResponsiveContainer width="100%" height={alto}>
          <BarChart
            data={segmentos}
            layout="vertical"
            margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
            barSize={16}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="etiqueta"
              width={110}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "var(--secondary)" }}
              content={
                <ChartTooltip
                  formatear={(entrada) => {
                    const valor = Number(entrada.value)
                    return `${numero(valor)} ${valor === 1 ? "barbería" : "barberías"}`
                  }}
                />
              }
            />
            <Bar dataKey="total" fill={color} radius={[0, 4, 4, 0]} name="barberías" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </SectionCard>
  )
}
