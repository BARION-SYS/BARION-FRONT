"use client"

import { Target } from "lucide-react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { ChartTooltip } from "@shared/components/charts/ChartTooltip"
import { SinDatos } from "@shared/components/feedback/SinDatos"
import type { PuntoGrafica } from "@features/dashboard/utils/serie"
import { useFormato } from "@shared/hooks/useFormato"

interface DashboardMetaChartProps {
  datos: PuntoGrafica[]
  disponible: boolean
  /** `false` cuando nadie ha fijado ninguna meta todavía. */
  hayMetas: boolean
}

export function DashboardMetaChart({ datos, disponible, hayMetas }: DashboardMetaChartProps) {
  const { dinero, compacto } = useFormato()

  return (
    <SectionCard
      titulo="Ingresos vs meta"
      subtitulo={hayMetas ? "Comparativo mensual" : "Sin meta fijada"}
    >
      {!disponible ? (
        <SinDatos
          titulo="Todavía no hay historia mensual"
          detalle="Se calcula cada noche."
          icono={Target}
        />
      ) : (
        <>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={datos}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              barSize={10}
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
                tickFormatter={(valor) => compacto(Number(valor))}
              />
              <Tooltip
                content={
                  <ChartTooltip
                    formatear={(entrada) =>
                      `${entrada.name === "ingresos" ? "Ingresos" : "Meta"}: ${dinero(
                        Number(entrada.value)
                      )}`
                    }
                  />
                }
              />
              <Bar dataKey="ingresos" fill="var(--chart-1)" radius={[4, 4, 0, 0]} name="ingresos" />
              {/* Sin metas fijadas la barra no se dibuja: una meta en cero se
                  leería como un objetivo puesto en cero. */}
              {hayMetas && (
                <Bar dataKey="meta" fill="var(--border)" radius={[4, 4, 0, 0]} name="meta" />
              )}
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary" aria-hidden />
              <span className="text-xs text-muted-foreground">Ingresos</span>
            </div>
            {hayMetas && (
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-border" aria-hidden />
                <span className="text-xs text-muted-foreground">Meta</span>
              </div>
            )}
          </div>
        </>
      )}
    </SectionCard>
  )
}
