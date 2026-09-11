"use client"

import { LineChart as IconoSerie } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { ChartTooltip } from "@shared/components/charts/ChartTooltip"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"
import { SinDatos } from "@shared/components/feedback/SinDatos"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/components/ui/tabs"
import { useFormato } from "@shared/hooks/useFormato"
import type { MesPlataforma } from "@features/plataforma/types/plataforma.types"

interface PlataformaEvolucionChartProps {
  meses: MesPlataforma[]
  loading: boolean
  /** Mensaje de la api si la historia no se pudo leer. */
  error: string | null
}

/**
 * Las métricas van en pestañas y no juntas en un mismo gráfico: citas (miles) y
 * altas (unidades) en un solo eje aplastan las altas contra el suelo, y dos ejes
 * invitan a comparar alturas que no se pueden comparar.
 *
 * El orden, el color y la unidad de cada una son estructura y viven aquí, no en
 * el componente.
 */
const METRICAS = [
  { clave: "citas", titulo: "Citas", unidad: "citas creadas", color: "var(--chart-1)" },
  { clave: "clientes", titulo: "Clientes", unidad: "clientes nuevos", color: "var(--chart-3)" },
  { clave: "activas", titulo: "Activas", unidad: "barberías con citas", color: "var(--chart-2)" },
  { clave: "altas", titulo: "Altas", unidad: "barberías nuevas", color: "var(--chart-4)" },
  { clave: "bajas", titulo: "Bajas", unidad: "suscripciones canceladas", color: "var(--chart-5)" },
] as const

type ClaveMetrica = (typeof METRICAS)[number]["clave"]

const VALOR: Record<ClaveMetrica, (mes: MesPlataforma) => number> = {
  citas: (mes) => mes.citasCreadas,
  clientes: (mes) => mes.clientesNuevos,
  activas: (mes) => mes.barberiasConActividad,
  altas: (mes) => mes.altas,
  bajas: (mes) => mes.cancelaciones,
}

/**
 * Cómo se mueve Barion mes a mes.
 *
 * **El mes en curso va atenuado y rotulado** «en curso»: con diez días
 * contados siempre parece un desplome, y quien lo lee sin aviso sale a apagar
 * un incendio que no existe.
 */
export function PlataformaEvolucionChart({ meses, loading, error }: PlataformaEvolucionChartProps) {
  const { numero, compacto, mesUTC } = useFormato()

  return (
    <SectionCard titulo="Evolución" subtitulo="Últimos 12 meses, en UTC" className="h-full">
      {loading ? (
        <DataSkeleton variant="chart" />
      ) : error || meses.length === 0 ? (
        <SinDatos
          titulo="La historia no está disponible"
          detalle={error ?? "La api todavía no devolvió la serie mensual."}
          icono={IconoSerie}
          alto={240}
        />
      ) : (
        <Tabs defaultValue="citas" className="gap-4">
          <div className="-mx-1 overflow-x-auto px-1 pb-1">
            <TabsList>
              {METRICAS.map((metrica) => (
                <TabsTrigger key={metrica.clave} value={metrica.clave}>
                  {metrica.titulo}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {METRICAS.map((metrica) => {
            const datos = meses.map((mes, i) => ({
              etiqueta: i === meses.length - 1 ? `${mesUTC(mes.mes)} · en curso` : mesUTC(mes.mes),
              corta: mesUTC(mes.mes),
              valor: VALOR[metrica.clave](mes),
            }))
            const cerrados = datos.slice(0, -1)
            const total = cerrados.reduce((suma, punto) => suma + punto.valor, 0)
            const mejor = cerrados.reduce(
              (max, punto) => (punto.valor > max.valor ? punto : max),
              cerrados[0] ?? datos[0]
            )

            return (
              <TabsContent
                key={metrica.clave}
                value={metrica.clave}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-wrap gap-x-6 gap-y-1">
                  <p className="text-sm text-muted-foreground">
                    <span className="text-lg font-semibold text-foreground tabular-nums">
                      {numero(total)}
                    </span>{" "}
                    {metrica.unidad} en {numero(cerrados.length)} meses cerrados
                  </p>
                  {mejor && mejor.valor > 0 && (
                    <p className="self-end text-xs text-muted-foreground">
                      Mejor mes: <span className="font-medium text-foreground">{mejor.corta}</span>{" "}
                      ({numero(mejor.valor)})
                    </p>
                  )}
                </div>

                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={datos} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    {/* El eje lleva la etiqueta larga —es la que recibe el
                        tooltip— y la recorta al pintarla */}
                    <XAxis
                      dataKey="etiqueta"
                      tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                      tickFormatter={(valor) => String(valor).split(" · ")[0]}
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                      minTickGap={12}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(valor) => compacto(Number(valor))}
                    />
                    <Tooltip
                      cursor={{ fill: "var(--secondary)" }}
                      content={
                        <ChartTooltip
                          formatear={(entrada) =>
                            `${numero(Number(entrada.value))} ${metrica.unidad}`
                          }
                        />
                      }
                    />
                    <Bar
                      dataKey="valor"
                      name={metrica.unidad}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={36}
                    >
                      {datos.map((punto, i) => (
                        <Cell
                          key={punto.corta}
                          fill={metrica.color}
                          fillOpacity={i === datos.length - 1 ? 0.4 : 1}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>
            )
          })}
        </Tabs>
      )}
    </SectionCard>
  )
}
