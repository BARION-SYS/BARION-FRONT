"use client"

import { CalendarX } from "lucide-react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { ChartTooltip } from "@shared/components/charts/ChartTooltip"
import { SinDatos } from "@shared/components/feedback/SinDatos"
import type { PuntoGrafica } from "@features/dashboard/utils/serie"

interface EstadisticasCancelacionesChartProps {
  datos: PuntoGrafica[]
  subtitulo: string
  disponible: boolean
}

/**
 * «Perdidas» agrupa canceladas y no-asistió. Para el negocio son lo mismo —un
 * hueco que no se cobró—; separarlas es un análisis de causas, no de resultado.
 */
export function EstadisticasCancelacionesChart({
  datos,
  subtitulo,
  disponible,
}: EstadisticasCancelacionesChartProps) {
  return (
    <SectionCard titulo="Completadas vs perdidas" subtitulo={subtitulo} className="h-full">
      {!disponible ? (
        <SinDatos titulo="Todavía no hay historia" icono={CalendarX} />
      ) : (
        <>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={datos}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              barSize={12}
              barGap={4}
            >
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
              />
              <Tooltip
                content={
                  <ChartTooltip
                    formatear={(entrada) =>
                      `${entrada.name === "completadas" ? "Completadas" : "Perdidas"}: ${entrada.value}`
                    }
                  />
                }
              />
              <Bar
                dataKey="completadas"
                fill="var(--chart-2)"
                radius={[4, 4, 0, 0]}
                name="completadas"
              />
              <Bar
                dataKey="canceladas"
                fill="var(--chart-5)"
                radius={[4, 4, 0, 0]}
                name="canceladas"
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-(--chart-2)" aria-hidden />
              <span className="text-xs text-muted-foreground">Completadas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-(--chart-5)" aria-hidden />
              <span className="text-xs text-muted-foreground">Perdidas</span>
            </div>
          </div>
        </>
      )}
    </SectionCard>
  )
}
