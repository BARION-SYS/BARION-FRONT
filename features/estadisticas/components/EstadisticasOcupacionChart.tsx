"use client"

import { Gauge } from "lucide-react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { ChartTooltip } from "@shared/components/charts/ChartTooltip"
import { SinDatos } from "@shared/components/feedback/SinDatos"
import type { PuntoGrafica } from "@features/dashboard/utils/serie"
import { useFormato } from "@shared/hooks/useFormato"
import { useTextos } from "@shared/textos/useTextos"

interface EstadisticasOcupacionChartProps {
  datos: PuntoGrafica[]
  subtitulo: string
  disponible: boolean
}

/**
 * Minutos ocupados sobre minutos ofrecidos. Es la métrica que dice si el negocio
 * tiene hueco, y **no se deduce del número de citas**: veinte cortes de quince
 * minutos no llenan lo que llenan diez de una hora.
 */
export function EstadisticasOcupacionChart({
  datos,
  subtitulo,
  disponible,
}: EstadisticasOcupacionChartProps) {
  const t = useTextos("estadisticas.ocupacion")
  const { porcentaje } = useFormato()

  // Un período sin jornada declarada no tiene ocupación: se omite en vez de
  // dibujarlo en cero, que se leería como un día vacío.
  const puntos = datos.filter((punto) => punto.ocupacion !== null)

  return (
    <SectionCard titulo={t("titulo")} subtitulo={subtitulo} className="h-full">
      {!disponible || puntos.length === 0 ? (
        <SinDatos titulo={t("sinDatos")} detalle={t("sinDatosDetalle")} icono={Gauge} />
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={puntos} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="etiqueta"
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(valor) => `${valor}%`}
            />
            <Tooltip
              content={
                <ChartTooltip
                  formatear={(entrada) => `Ocupación: ${porcentaje(Number(entrada.value))}`}
                />
              }
            />
            <Line
              type="monotone"
              dataKey="ocupacion"
              stroke="var(--chart-3)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "var(--chart-3)" }}
              name="ocupacion"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </SectionCard>
  )
}
