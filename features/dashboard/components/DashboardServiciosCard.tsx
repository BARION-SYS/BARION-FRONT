"use client"

import type { CSSProperties } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { ChartTooltip } from "@shared/components/charts/ChartTooltip"
import { SinDatos } from "@shared/components/feedback/SinDatos"
import { tokenDeColor } from "@shared/utils/color"
import type { ServicioTop } from "@features/dashboard/types/dashboard.types"
import { useFormato } from "@shared/hooks/useFormato"
import { useTextos } from "@shared/textos/useTextos"

interface DashboardServiciosCardProps {
  servicios: ServicioTop[]
  subtitulo: string
}

export function DashboardServiciosCard({ servicios, subtitulo }: DashboardServiciosCardProps) {
  const t = useTextos("dashboard.servicios")
  const { numero, porcentaje } = useFormato()

  const total = servicios.reduce((suma, servicio) => suma + servicio.veces, 0)
  const datos = servicios.map((servicio, indice) => ({
    ...servicio,
    // El porcentaje se deriva aquí: la api entrega el conteo crudo, que es el
    // dato, y el reparto depende de cuántos se hayan pedido.
    parte: total === 0 ? 0 : (servicio.veces / total) * 100,
    color: tokenDeColor(indice),
  }))

  return (
    <SectionCard
      titulo={t("titulo")}
      accion={
        <span className="rounded-md bg-secondary px-2 py-1 text-[10px] text-muted-foreground">
          {subtitulo}
        </span>
      }
    >
      {servicios.length === 0 ? (
        <SinDatos titulo={t("sinDatos")} alto={100} />
      ) : (
        <div className="flex items-center gap-4">
          <ResponsiveContainer width={100} height={100}>
            <PieChart>
              <Pie
                data={datos}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={45}
                paddingAngle={3}
                dataKey="parte"
                nameKey="nombre"
              >
                {datos.map((servicio) => (
                  <Cell key={servicio.nombre} fill={servicio.color} />
                ))}
              </Pie>
              <Tooltip
                content={
                  <ChartTooltip
                    formatear={(entrada) => `${entrada.name}: ${porcentaje(Number(entrada.value))}`}
                  />
                }
              />
            </PieChart>
          </ResponsiveContainer>
          <ul className="flex-1 space-y-2">
            {datos.map((servicio) => (
              <li key={servicio.nombre} className="flex items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full bg-(--tono)"
                  style={{ "--tono": servicio.color } as CSSProperties}
                  aria-hidden
                />
                <span className="flex-1 truncate text-[11px] text-muted-foreground">
                  {servicio.nombre}
                </span>
                <span className="text-[11px] font-semibold text-foreground tabular-nums">
                  {numero(servicio.veces)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </SectionCard>
  )
}
