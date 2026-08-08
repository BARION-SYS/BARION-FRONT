"use client"

import { MoonStar, Users } from "lucide-react"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import { Loadable } from "@shared/components/feedback/Loadable"
import { useFormato } from "@shared/hooks/useFormato"
import { inicialesDe } from "@shared/utils/iniciales"
import { nombreDePais } from "@features/plataforma/utils/inventario"
import type { BarberiaInventario } from "@features/plataforma/types/plataforma.types"

interface PlataformaClientelaListProps {
  barberias: BarberiaInventario[]
  loading: boolean
  onAbrir: (barberia: BarberiaInventario) => void
}

/**
 * Quién sostiene más clientela.
 *
 * Es la lista que dice a quién no se puede perder, y por eso cada fila lleva
 * **dos** cifras: la clientela acumulada ordena, y las citas de 30 días dicen si
 * sigue viva. Una barbería con seiscientos clientes y cero citas este mes es la
 * fila más importante de toda la pantalla, y con una sola columna encabezaría el
 * ranking como si fuera la mejor.
 *
 * Se marca «sin actividad» con texto además de con color: un estado que solo se
 * distingue por el tono no se distingue.
 */
export function PlataformaClientelaList({
  barberias,
  loading,
  onAbrir,
}: PlataformaClientelaListProps) {
  const { numero } = useFormato()

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
      <ul className="flex flex-col gap-2">
        {barberias.map((barberia, posicion) => {
          const dormida = barberia.uso.citas30d === 0
          return (
            <li key={barberia.id}>
              <button
                type="button"
                onClick={() => onAbrir(barberia)}
                className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-secondary/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <span className="w-4 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
                  {posicion + 1}
                </span>
                <InitialsAvatar iniciales={inicialesDe(barberia.nombreComercial)} />

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {barberia.nombreComercial}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {nombreDePais(barberia.codigoPais)}
                    {barberia.propietario ? ` · ${barberia.propietario.nombre}` : ""}
                  </span>
                </span>

                <span className="shrink-0 text-right">
                  <span className="block text-sm font-semibold tabular-nums">
                    {numero(barberia.uso.clientesTotal)}
                  </span>
                  {dormida ? (
                    <span className="flex items-center justify-end gap-1 text-xs text-(--advertencia)">
                      <MoonStar className="size-3" aria-hidden />
                      Sin actividad
                    </span>
                  ) : (
                    <span className="block text-xs text-muted-foreground tabular-nums">
                      {numero(barberia.uso.citas30d)} citas · 30 d
                    </span>
                  )}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </Loadable>
  )
}
