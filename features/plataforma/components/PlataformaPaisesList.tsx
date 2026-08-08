"use client"

import { Globe } from "lucide-react"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { Loadable } from "@shared/components/feedback/Loadable"
import { useFormato } from "@shared/hooks/useFormato"
import type { UsoPais } from "@features/plataforma/types/plataforma.types"

interface PlataformaPaisesListProps {
  paises: UsoPais[]
  loading: boolean
}

/**
 * El uso por país: dónde se vendió, cuánta gente hay debajo y si se mueve.
 *
 * **Sustituye a la gráfica de barras que solo contaba barberías.** Aquella
 * respondía «dónde se vendió» y se leía como «dónde se usa», que no es lo
 * mismo: cuatro barberías españolas con más clientela que dieciocho colombianas
 * dormidas es exactamente el caso que una barra tapa. Tres cifras no caben en un
 * eje, así que esto es una tabla y no un gráfico — y esa es la razón, no el
 * gusto.
 *
 * La barra de fondo es proporcional a la clientela del país con más: da la
 * lectura de un vistazo sin pedir que nadie compare dos números de seis cifras.
 */
export function PlataformaPaisesList({ paises, loading }: PlataformaPaisesListProps) {
  const { numero } = useFormato()

  // Sobre el máximo y no sobre el total: con un país dominante todos los demás
  // quedarían en una raya invisible.
  const techo = Math.max(...paises.map((pais) => pais.clientes), 1)

  return (
    <SectionCard
      titulo="Uso por país"
      subtitulo="Dónde está de verdad el producto"
      className="h-full"
    >
      <Loadable
        loading={loading}
        isEmpty={paises.length === 0}
        variant="list"
        count={3}
        emptyState={
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Globe className="size-5 text-muted-foreground" aria-hidden />
            <p className="text-sm font-medium">Sin barberías todavía</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              El reparto por país aparece con la primera alta.
            </p>
          </div>
        }
      >
        <ul className="flex flex-col gap-3">
          {paises.map((pais) => (
            <li key={pais.codigo} className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate text-sm font-medium">{pais.nombre}</span>
                <span className="shrink-0 text-sm font-semibold tabular-nums">
                  {numero(pais.clientes)}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">clientes</span>
                </span>
              </div>

              {/* Ancho por variable CSS y no por `style` de color: la regla del
                  repo es que lo que llega por dato viaja como custom property */}
              <div
                className="h-1.5 overflow-hidden rounded-full bg-secondary"
                style={{ "--parte": `${(pais.clientes / techo) * 100}%` } as React.CSSProperties}
                aria-hidden
              >
                <div className="h-full w-(--parte) rounded-full bg-(--chart-3)" />
              </div>

              <p className="text-xs text-muted-foreground tabular-nums">
                {numero(pais.barberias)} {pais.barberias === 1 ? "barbería" : "barberías"} ·{" "}
                {numero(pais.citas30d)} citas en 30 días
              </p>
            </li>
          ))}
        </ul>
      </Loadable>
    </SectionCard>
  )
}
