"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { ChartTooltip } from "@shared/components/charts/ChartTooltip"
import type { PuntoCitasMensual } from "@features/estadisticas/types/estadisticas.types"

interface Props {
  datos: PuntoCitasMensual[]
}

export function EstadisticasCancelacionesChart({ datos }: Props) {
  return (
    <SectionCard
      titulo="Citas completadas vs canceladas"
      subtitulo="Enero — Julio 2026"
      className="h-full"
    >
      <ResponsiveContainer width="100%" height={180}>
        <BarChart
          data={datos}
          margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
          barSize={12}
          barGap={4}
        >
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
          <Tooltip
            content={
              <ChartTooltip
                formatear={(e) =>
                  `${e.name === "completadas" ? "Completadas" : "Canceladas"}: ${e.value}`
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
          <Bar dataKey="canceladas" fill="var(--chart-5)" radius={[4, 4, 0, 0]} name="canceladas" />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-3 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-(--chart-2)" aria-hidden />
          <span className="text-xs text-muted-foreground">Completadas</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-(--chart-5)" aria-hidden />
          <span className="text-xs text-muted-foreground">Canceladas</span>
        </div>
      </div>
    </SectionCard>
  )
}
