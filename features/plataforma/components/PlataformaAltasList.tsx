"use client"

import { Store } from "lucide-react"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import { Loadable } from "@shared/components/feedback/Loadable"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import { useFormato } from "@shared/hooks/useFormato"
import { inicialesDe } from "@shared/utils/iniciales"
import { ESTADO_BARBERIA, nombreDePais } from "@features/plataforma/utils/inventario"
import type { BarberiaInventario } from "@features/plataforma/types/plataforma.types"

interface PlataformaAltasListProps {
  barberias: BarberiaInventario[]
  loading: boolean
  onAbrir: (barberia: BarberiaInventario) => void
}

/**
 * Las últimas barberías que entraron.
 *
 * Es lo primero que se mira al abrir el área: si una venta de ayer quedó a
 * medias, aquí se ve antes de que el cliente llame.
 */
export function PlataformaAltasList({ barberias, loading, onAbrir }: PlataformaAltasListProps) {
  const { relativo } = useFormato()

  return (
    <Loadable
      loading={loading}
      isEmpty={barberias.length === 0}
      variant="list"
      count={4}
      emptyState={
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <Store className="size-5 text-muted-foreground" aria-hidden />
          <p className="text-sm font-medium">Todavía no has dado de alta ninguna</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            La primera barbería se crea desde Barberías › Nueva barbería.
          </p>
        </div>
      }
    >
      <ul className="flex flex-col gap-2">
        {barberias.map((barberia) => {
          const estado = ESTADO_BARBERIA[barberia.estado]
          return (
            <li key={barberia.id}>
              <button
                type="button"
                onClick={() => onAbrir(barberia)}
                className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-secondary/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <InitialsAvatar iniciales={inicialesDe(barberia.nombreComercial)} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {barberia.nombreComercial}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {nombreDePais(barberia.codigoPais)} · {relativo(barberia.creadoEn)}
                  </span>
                </span>
                <StatusBadge tono={estado.tono} etiqueta={estado.etiqueta} compacta />
              </button>
            </li>
          )
        })}
      </ul>
    </Loadable>
  )
}
