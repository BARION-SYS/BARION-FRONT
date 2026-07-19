"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { ChartTooltip } from "@shared/components/charts/ChartTooltip"
import type { ServicioPopular } from "@features/dashboard/types/dashboard.types"

interface Props {
  servicios: ServicioPopular[]
}

export function DashboardServiciosCard({ servicios }: Props) {
  return (
    <SectionCard
      titulo="Servicios populares"
      accion={
        <span className="rounded-md bg-secondary px-2 py-1 text-[10px] text-muted-foreground">
          Este mes
        </span>
      }
    >
      <div className="flex items-center gap-4">
        <ResponsiveContainer width={100} height={100}>
          <PieChart>
            <Pie
              data={servicios}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={45}
              paddingAngle={3}
              dataKey="porcentaje"
            >
              {servicios.map((servicio) => (
                <Cell key={servicio.nombre} fill={servicio.color} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip formatear={(e) => `${e.name}: ${e.value}%`} />} />
          </PieChart>
        </ResponsiveContainer>
        <ul className="flex-1 space-y-2">
          {servicios.map((servicio) => (
            <li key={servicio.nombre} className="flex items-center gap-2">
              <span
                className="h-2 w-2 shrink-0 rounded-full bg-(--tono)"
                style={{ "--tono": servicio.color } as React.CSSProperties}
                aria-hidden
              />
              <span className="flex-1 truncate text-[11px] text-muted-foreground">
                {servicio.nombre}
              </span>
              <span className="text-[11px] font-semibold text-foreground tabular-nums">
                {servicio.porcentaje}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </SectionCard>
  )
}
