"use client"

import { BarChart3 } from "lucide-react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { ChartTooltip } from "@shared/components/charts/ChartTooltip"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"
import { SinDatos } from "@shared/components/feedback/SinDatos"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/components/ui/tabs"
import { useFormato } from "@shared/hooks/useFormato"
import type { SemanaActividad } from "@features/plataforma/types/plataforma.types"

interface PlataformaActividadChartProps {
  semanas: SemanaActividad[] | null
  loading: boolean
}

// Creadas y atendidas comparten unidad —citas— y por eso sí van juntas en un
// eje; los clientes nuevos, en su pestaña.
const SERIES_CITAS = [
  { clave: "citasCreadas", etiqueta: "Creadas", color: "var(--chart-1)" },
  { clave: "citasAtendidas", etiqueta: "Atendidas", color: "var(--chart-2)" },
] as const

/**
 * Cómo se mueve una barbería semana a semana.
 *
 * Creadas contra atendidas es la comparación que importa: una barbería que
 * agenda cuarenta citas y cierra dos como completadas usa la agenda, pero no
 * el resto del producto —nómina y estadísticas se quedan vacías—.
 */
export function PlataformaActividadChart({ semanas, loading }: PlataformaActividadChartProps) {
  const { numero, diaUTC } = useFormato()

  const datos = (semanas ?? []).map((semana, i, todas) => ({
    ...semana,
    etiqueta:
      i === todas.length - 1 ? `${diaUTC(semana.semana)} · en curso` : diaUTC(semana.semana),
  }))
  const vacia = datos.every(
    (semana) =>
      semana.citasCreadas === 0 && semana.citasAtendidas === 0 && semana.clientesNuevos === 0
  )

  const eje = {
    tick: { fill: "var(--muted-foreground)", fontSize: 11 },
    axisLine: false,
    tickLine: false,
  } as const

  return (
    <SectionCard
      titulo="Actividad semanal"
      subtitulo="Últimas 12 semanas, de lunes a domingo (UTC)"
    >
      {loading || !semanas ? (
        <DataSkeleton variant="chart" />
      ) : vacia ? (
        <SinDatos
          titulo="Sin actividad en 12 semanas"
          detalle="No ha creado citas ni registrado clientes en este tiempo."
          icono={BarChart3}
          alto={240}
        />
      ) : (
        <Tabs defaultValue="citas" className="gap-4">
          <TabsList>
            <TabsTrigger value="citas">Citas</TabsTrigger>
            <TabsTrigger value="clientes">Clientes nuevos</TabsTrigger>
          </TabsList>

          <TabsContent value="citas" className="flex flex-col gap-3">
            <ul className="flex gap-4 text-xs text-muted-foreground" aria-label="Leyenda">
              {SERIES_CITAS.map((serie) => (
                <li key={serie.clave} className="flex items-center gap-1.5">
                  <span
                    className="size-2.5 rounded-sm bg-(--tono)"
                    style={{ "--tono": serie.color } as React.CSSProperties}
                    aria-hidden
                  />
                  {serie.etiqueta}
                </li>
              ))}
            </ul>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={datos} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="etiqueta"
                  {...eje}
                  tickFormatter={(valor) => String(valor).split(" · ")[0]}
                  interval="preserveStartEnd"
                  minTickGap={16}
                />
                <YAxis allowDecimals={false} {...eje} />
                <Tooltip
                  cursor={{ fill: "var(--secondary)" }}
                  content={
                    <ChartTooltip
                      formatear={(entrada) => `${entrada.name}: ${numero(Number(entrada.value))}`}
                    />
                  }
                />
                {SERIES_CITAS.map((serie) => (
                  <Bar
                    key={serie.clave}
                    dataKey={serie.clave}
                    name={serie.etiqueta}
                    fill={serie.color}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={16}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="clientes">
            <ResponsiveContainer width="100%" height={244}>
              <BarChart data={datos} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="etiqueta"
                  {...eje}
                  tickFormatter={(valor) => String(valor).split(" · ")[0]}
                  interval="preserveStartEnd"
                  minTickGap={16}
                />
                <YAxis allowDecimals={false} {...eje} />
                <Tooltip
                  cursor={{ fill: "var(--secondary)" }}
                  content={
                    <ChartTooltip
                      formatear={(entrada) => `${numero(Number(entrada.value))} clientes nuevos`}
                    />
                  }
                />
                <Bar
                  dataKey="clientesNuevos"
                  name="Clientes nuevos"
                  fill="var(--chart-3)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      )}
    </SectionCard>
  )
}
