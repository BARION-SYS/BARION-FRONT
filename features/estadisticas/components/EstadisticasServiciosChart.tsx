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

interface EstadisticasServiciosChartProps {
  servicios: ServicioTop[]
  subtitulo: string
}

/**
 * Sale de las líneas de las citas completadas y es TRANSACCIONAL: funciona
 * aunque la tendencia todavía no esté calculada.
 */
export function EstadisticasServiciosChart({
  servicios,
  subtitulo,
}: EstadisticasServiciosChartProps) {
  const t = useTextos("estadisticas.servicios")
  const { dinero, porcentaje } = useFormato()

  const total = servicios.reduce((suma, servicio) => suma + servicio.veces, 0)
  const datos = servicios.map((servicio, indice) => ({
    ...servicio,
    parte: total === 0 ? 0 : (servicio.veces / total) * 100,
    color: tokenDeColor(indice),
  }))

  return (
    <SectionCard titulo={t("titulo")} subtitulo={subtitulo} className="h-full">
      {servicios.length === 0 ? (
        <SinDatos titulo={t("sinDatos")} alto={160} />
      ) : (
        <>
          <div className="flex justify-center">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie
                  data={datos}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
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
                      formatear={(entrada) =>
                        `${entrada.name}: ${porcentaje(Number(entrada.value))}`
                      }
                    />
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-2">
            {datos.map((servicio) => (
              <li key={servicio.nombre} className="flex items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full bg-(--tono)"
                  style={{ "--tono": servicio.color } as CSSProperties}
                  aria-hidden
                />
                <span className="flex-1 truncate text-xs text-muted-foreground">
                  {servicio.nombre}
                </span>
                <span className="text-xs font-semibold text-foreground tabular-nums">
                  {dinero(Number(servicio.ingresosCentavos))}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </SectionCard>
  )
}
