"use client"

import { InfoTooltip } from "@shared/components/tooltips/InfoTooltip"
import { useFormato } from "@shared/hooks/useFormato"
import { colorDeTono } from "@shared/utils/tono"
import { GRUPO_SALUD, type SegmentoSalud } from "@features/plataforma/utils/salud"

interface PlataformaSaludChartProps {
  segmentos: SegmentoSalud[]
  total: number
}

/**
 * La cartera entera en una sola barra: cuántas operan sanas, cuántas acaban de
 * llegar, cuántas se están yendo y cuántas ya no tienen servicio.
 *
 * Una barra apilada y no un anillo porque se compara de izquierda a derecha sin
 * girar la cabeza, y cabe a lo ancho de un móvil. Cada grupo lleva su cifra y
 * su desglose en texto en la leyenda: el tono ayuda, pero no es el dato.
 */
export function PlataformaSaludChart({ segmentos, total }: PlataformaSaludChartProps) {
  const { numero, porcentaje } = useFormato()
  const sanas = segmentos.find((segmento) => segmento.grupo === "sanas")?.total ?? 0
  const visibles = segmentos.filter((segmento) => segmento.total > 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold tracking-tight tabular-nums">
          {porcentaje((sanas / total) * 100)}
        </span>
        <span className="text-sm text-muted-foreground">de la cartera opera sana</span>
      </div>

      {/* El hueco entre segmentos es de superficie (gap), no un borde: separa sin
          añadir una línea que compita con los colores */}
      <div
        className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full"
        role="img"
        aria-label={visibles
          .map((segmento) => `${GRUPO_SALUD[segmento.grupo].etiqueta}: ${segmento.total}`)
          .join(", ")}
      >
        {visibles.map((segmento) => (
          <InfoTooltip
            key={segmento.grupo}
            contenido={`${GRUPO_SALUD[segmento.grupo].etiqueta}: ${numero(segmento.total)} (${porcentaje((segmento.total / total) * 100)})`}
          >
            {/* Crece en proporción a su cifra y no por porcentaje de ancho: con
                los huecos entre segmentos, los porcentajes sumarían más de 100 */}
            <span
              className="h-full min-w-1.5 grow-(--peso) basis-0 bg-(--tono) transition-opacity hover:opacity-80"
              style={
                {
                  "--peso": segmento.total,
                  "--tono": colorDeTono[GRUPO_SALUD[segmento.grupo].tono],
                } as React.CSSProperties
              }
            />
          </InfoTooltip>
        ))}
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
        {segmentos.map((segmento) => (
          <div key={segmento.grupo} className="min-w-0">
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className="size-2 shrink-0 rounded-full bg-(--tono)"
                style={
                  {
                    "--tono": colorDeTono[GRUPO_SALUD[segmento.grupo].tono],
                  } as React.CSSProperties
                }
                aria-hidden
              />
              {GRUPO_SALUD[segmento.grupo].etiqueta}
            </dt>
            <dd className="mt-0.5 text-lg font-semibold tabular-nums">{numero(segmento.total)}</dd>
            {segmento.desglose.length > 0 && (
              <dd className="truncate text-xs text-muted-foreground">
                {segmento.desglose
                  .map((parte) => `${numero(parte.total)} ${parte.etiqueta}`)
                  .join(" · ")}
              </dd>
            )}
          </div>
        ))}
      </dl>
    </div>
  )
}
