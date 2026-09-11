"use client"

import Link from "next/link"
import { Users } from "lucide-react"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import { Loadable } from "@shared/components/feedback/Loadable"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import { useFormato } from "@shared/hooks/useFormato"
import { inicialesDe } from "@shared/utils/iniciales"
import { nombreDePais } from "@features/plataforma/utils/inventario"
import { PULSO, pulsoDe } from "@features/plataforma/utils/salud"
import type { BarberiaInventario } from "@features/plataforma/types/plataforma.types"

interface PlataformaClientelaListProps {
  barberias: BarberiaInventario[]
  loading: boolean
}

/**
 * Quién sostiene más clientela.
 *
 * Es la lista que dice a quién no se puede perder, y por eso cada fila lleva su
 * PULSO al lado de la cifra: una barbería con seiscientos clientes y cero citas
 * este mes es la fila más importante de toda la pantalla, y con una sola
 * columna encabezaría el ranking como si fuera la mejor.
 *
 * La barra de fondo es proporcional a la primera: el ranking se lee de un
 * vistazo sin comparar números de seis cifras.
 */
export function PlataformaClientelaList({ barberias, loading }: PlataformaClientelaListProps) {
  const { numero } = useFormato()
  const techo = Math.max(...barberias.map((barberia) => barberia.uso.clientesTotal), 1)

  return (
    <Loadable
      loading={loading}
      isEmpty={barberias.length === 0}
      variant="list"
      count={5}
      emptyState={
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <Users className="size-5 text-muted-foreground" aria-hidden />
          <p className="text-sm font-medium">Ninguna barbería tiene clientela todavía</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            Aparecen aquí en cuanto registren a su primer cliente.
          </p>
        </div>
      }
    >
      <ol className="-mx-2 flex flex-col">
        {barberias.map((barberia, posicion) => {
          const pulso = PULSO[pulsoDe(barberia)]
          return (
            <li key={barberia.id}>
              <Link
                href={`/admin/barberias/${barberia.id}`}
                className="flex min-h-11 items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-secondary/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <span className="w-4 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
                  {posicion + 1}
                </span>
                <InitialsAvatar iniciales={inicialesDe(barberia.nombreComercial)} />

                <span className="min-w-0 flex-1 space-y-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-medium">{barberia.nombreComercial}</span>
                    <span className="shrink-0 text-sm font-semibold tabular-nums">
                      {numero(barberia.uso.clientesTotal)}
                    </span>
                  </span>
                  <span
                    className="block h-1 overflow-hidden rounded-full bg-secondary"
                    style={
                      {
                        "--parte": `${(barberia.uso.clientesTotal / techo) * 100}%`,
                      } as React.CSSProperties
                    }
                    aria-hidden
                  >
                    <span className="block h-full w-(--parte) rounded-full bg-(--chart-3)" />
                  </span>
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs text-muted-foreground">
                      {nombreDePais(barberia.codigoPais)} · {numero(barberia.uso.citas30d)} citas en
                      30 días
                    </span>
                    <StatusBadge tono={pulso.tono} etiqueta={pulso.etiqueta} icono={pulso.icono} />
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ol>
    </Loadable>
  )
}
