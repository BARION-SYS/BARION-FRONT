"use client"

import { Store } from "lucide-react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { ChartTooltip } from "@shared/components/charts/ChartTooltip"
import { SinDatos } from "@shared/components/feedback/SinDatos"
import { useFormato } from "@shared/hooks/useFormato"
import { COLOR_ESTADO } from "@features/plataforma/utils/inventario"
import type {
  EstadoBarberia,
  SegmentoInventario,
} from "@features/plataforma/types/plataforma.types"

interface PlataformaEstadoChartProps {
  segmentos: SegmentoInventario[]
  total: number
}

/**
 * Cómo está repartido el inventario entre activas, en solo lectura y
 * suspendidas — que es la única pregunta que se hace todos los días quien cobra.
 *
 * La leyenda lleva la cifra al lado: la proporción se ve, pero el número es lo
 * que se apunta, y un anillo no se lee con un lector de pantalla.
 */
export function PlataformaEstadoChart({ segmentos, total }: PlataformaEstadoChartProps) {
  const { numero, porcentaje } = useFormato()

  return (
    <SectionCard titulo="Por estado" subtitulo="Cómo está el inventario ahora" className="h-full">
      {total === 0 ? (
        <SinDatos
          titulo="Todavía no hay barberías"
          detalle="En cuanto des de alta la primera, aquí se ve el reparto."
          icono={Store}
        />
      ) : (
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <ResponsiveContainer width="100%" height={180} className="max-w-[220px]">
            <PieChart>
              <Pie
                data={segmentos}
                dataKey="total"
                nameKey="etiqueta"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={2}
                strokeWidth={0}
              >
                {segmentos.map((segmento) => (
                  <Cell
                    key={segmento.clave}
                    fill={COLOR_ESTADO[segmento.clave as EstadoBarberia]}
                  />
                ))}
              </Pie>
              <Tooltip
                content={
                  <ChartTooltip
                    formatear={(entrada) => `${entrada.name}: ${numero(Number(entrada.value))}`}
                  />
                }
              />
            </PieChart>
          </ResponsiveContainer>

          <ul className="flex w-full flex-col gap-2">
            {segmentos.map((segmento) => (
              <li key={segmento.clave} className="flex items-center gap-2 text-sm">
                <span
                  className="inline-block size-2.5 shrink-0 rounded-sm bg-(--tono)"
                  style={
                    {
                      "--tono": COLOR_ESTADO[segmento.clave as EstadoBarberia],
                    } as React.CSSProperties
                  }
                  aria-hidden
                />
                <span className="flex-1 truncate text-muted-foreground">{segmento.etiqueta}</span>
                <span className="font-medium tabular-nums">{numero(segmento.total)}</span>
                <span className="w-12 text-right text-xs text-muted-foreground tabular-nums">
                  {porcentaje((segmento.total / total) * 100)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </SectionCard>
  )
}
