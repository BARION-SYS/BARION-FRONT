"use client"

import { Receipt } from "lucide-react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { ChartTooltip } from "@shared/components/charts/ChartTooltip"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"
import { SinDatos } from "@shared/components/feedback/SinDatos"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/components/ui/tabs"
import { useFormato } from "@shared/hooks/useFormato"
import { monedasFacturadas, serieDeMoneda } from "@features/plataforma/utils/series"
import type { FacturacionPlataforma } from "@features/plataforma/types/plataforma.types"

interface PlataformaFacturacionChartProps {
  facturacion: FacturacionPlataforma | null
  /** Los meses de la ventana, como instantes UTC del día 1. */
  meses: string[]
  loading: boolean
}

// Dos series, siempre en este orden y con este color: la identidad no cambia
// al cambiar de moneda.
const SERIES = [
  { clave: "emitido", etiqueta: "Emitido", color: "var(--chart-1)" },
  { clave: "cobrado", etiqueta: "Cobrado", color: "var(--chart-2)" },
] as const

/**
 * Lo que Barion facturó y lo que entró, mes a mes, **una moneda por pestaña**:
 * sumar pesos con euros exige un tipo de cambio, y eso es una decisión contable.
 *
 * Emitido va por fecha de emisión y cobrado por fecha de pago, así que un mes
 * puede cobrar más de lo que emitió —entraron facturas del anterior—. No es un
 * error: son dos preguntas.
 */
export function PlataformaFacturacionChart({
  facturacion,
  meses,
  loading,
}: PlataformaFacturacionChartProps) {
  const { dineroEn, dineroCompactoEn, numero, mesUTC } = useFormato()
  const monedas = facturacion ? monedasFacturadas(facturacion) : []

  return (
    <SectionCard
      titulo="Facturación de Barion"
      subtitulo="Emitido y cobrado, por moneda"
      className="h-full"
    >
      {loading ? (
        <DataSkeleton variant="chart" />
      ) : !facturacion || monedas.length === 0 ? (
        <SinDatos
          titulo="Todavía no hay facturas"
          detalle="Aparecen aquí en cuanto se emita el primer cobro de una suscripción."
          icono={Receipt}
          alto={240}
        />
      ) : (
        <Tabs defaultValue={monedas[0]} className="gap-4">
          {monedas.length > 1 && (
            <TabsList>
              {monedas.map((moneda) => (
                <TabsTrigger key={moneda} value={moneda}>
                  {moneda}
                </TabsTrigger>
              ))}
            </TabsList>
          )}

          {monedas.map((moneda) => {
            const serie = serieDeMoneda(facturacion.serie, moneda, meses).map((punto) => ({
              ...punto,
              etiqueta: mesUTC(punto.mes),
            }))
            const cartera = facturacion.cartera.find((fila) => fila.moneda === moneda)

            return (
              <TabsContent key={moneda} value={moneda} className="flex flex-col gap-4">
                <dl className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-secondary/40 px-3 py-2.5">
                    <dt className="text-xs text-muted-foreground">Por cobrar hoy</dt>
                    <dd className="mt-0.5 text-lg font-semibold tabular-nums">
                      {dineroEn(Number(cartera?.pendienteCentavos ?? 0), moneda)}
                    </dd>
                    <dd className="text-xs text-muted-foreground">
                      {numero(cartera?.facturas ?? 0)} facturas abiertas
                    </dd>
                  </div>
                  <div className="rounded-lg bg-secondary/40 px-3 py-2.5">
                    <dt className="text-xs text-muted-foreground">Vencido</dt>
                    <dd
                      className={
                        (cartera?.vencidas ?? 0) > 0
                          ? "mt-0.5 text-lg font-semibold text-(--advertencia) tabular-nums"
                          : "mt-0.5 text-lg font-semibold tabular-nums"
                      }
                    >
                      {dineroEn(Number(cartera?.vencidoCentavos ?? 0), moneda)}
                    </dd>
                    <dd className="text-xs text-muted-foreground">
                      {numero(cartera?.vencidas ?? 0)} pasadas de fecha
                    </dd>
                  </div>
                </dl>

                <ul className="flex gap-4 text-xs text-muted-foreground" aria-label="Leyenda">
                  {SERIES.map((serieInfo) => (
                    <li key={serieInfo.clave} className="flex items-center gap-1.5">
                      <span
                        className="size-2.5 rounded-sm bg-(--tono)"
                        style={{ "--tono": serieInfo.color } as React.CSSProperties}
                        aria-hidden
                      />
                      {serieInfo.etiqueta}
                    </li>
                  ))}
                </ul>

                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={serie}
                    margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                    barGap={2}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="etiqueta"
                      tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                      minTickGap={12}
                    />
                    <YAxis
                      width={64}
                      tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(valor) => dineroCompactoEn(Number(valor), moneda)}
                    />
                    <Tooltip
                      cursor={{ fill: "var(--secondary)" }}
                      content={
                        <ChartTooltip
                          formatear={(entrada) =>
                            `${entrada.name}: ${dineroEn(Number(entrada.value), moneda)}`
                          }
                        />
                      }
                    />
                    {SERIES.map((serieInfo) => (
                      <Bar
                        key={serieInfo.clave}
                        dataKey={serieInfo.clave}
                        name={serieInfo.etiqueta}
                        fill={serieInfo.color}
                        radius={[4, 4, 0, 0]}
                        maxBarSize={18}
                      />
                    ))}
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
