"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { ChartTooltip } from "@shared/components/charts/ChartTooltip"
import type { ServicioTop } from "@features/estadisticas/types/estadisticas.types"

interface Props {
  servicios: ServicioTop[]
}

export function EstadisticasServiciosChart({ servicios }: Props) {
  return (
    <SectionCard
      titulo="Distribución de servicios"
      subtitulo="Participación anual"
      className="h-full"
    >
      <div className="flex justify-center">
        <ResponsiveContainer width={160} height={160}>
          <PieChart>
            <Pie
              data={servicios}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={4}
              dataKey="porcentaje"
              nameKey="nombre"
            >
              {servicios.map((servicio) => (
                <Cell key={servicio.nombre} fill={servicio.color} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip formatear={(e) => `${e.name}: ${e.value}%`} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-2 space-y-2">
        {servicios.map((servicio) => (
          <li key={servicio.nombre} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full bg-(--tono)"
              style={{ "--tono": servicio.color } as React.CSSProperties}
              aria-hidden
            />
            <span className="flex-1 truncate text-xs text-muted-foreground">{servicio.nombre}</span>
            <span className="text-xs font-bold text-foreground tabular-nums">
              {servicio.porcentaje}%
            </span>
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}
