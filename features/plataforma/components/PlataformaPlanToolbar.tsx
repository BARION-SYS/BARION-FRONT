"use client"

import { Plus, Search, X } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Input } from "@shared/components/ui/input"
import { useFormato } from "@shared/hooks/useFormato"

/** Sin valor llegan los publicados **y** los retirados: es el default de la API. */
export type FiltroPublicacion = "todos" | "publicados" | "retirados"

interface PlataformaPlanToolbarProps {
  busqueda: string
  publicacion: FiltroPublicacion
  total: number
  onBuscar: (valor: string) => void
  onFiltrarPublicacion: (valor: FiltroPublicacion) => void
  onLimpiar: () => void
  /** Sin `plataforma.planes.gestionar` el catálogo se consulta, no se toca. */
  gestiona: boolean
  onCrear: () => void
}

const OPCIONES: { valor: FiltroPublicacion; etiqueta: string }[] = [
  { valor: "todos", etiqueta: "Todos" },
  { valor: "publicados", etiqueta: "Publicados" },
  { valor: "retirados", etiqueta: "Retirados" },
]

/**
 * Los dos cortes que se hacen sobre el catálogo: buscar por código o nombre, y
 * separar lo que se vende de lo que se retiró.
 *
 * «Retirados» tiene su propio filtro y no se esconde: un plan retirado sigue
 * cobrándose a quien lo tenía, así que soporte necesita poder encontrarlo.
 */
export function PlataformaPlanToolbar({
  busqueda,
  publicacion,
  total,
  onBuscar,
  onFiltrarPublicacion,
  onLimpiar,
  gestiona,
  onCrear,
}: PlataformaPlanToolbarProps) {
  const { numero } = useFormato()
  const filtrando = busqueda !== "" || publicacion !== "todos"

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:max-w-xs sm:flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={busqueda}
            onChange={(e) => onBuscar(e.target.value)}
            placeholder="Buscar por código o nombre"
            className="pl-9"
            aria-label="Buscar plan"
          />
        </div>

        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por publicación">
          {OPCIONES.map((opcion) => (
            <Button
              key={opcion.valor}
              type="button"
              size="sm"
              variant={publicacion === opcion.valor ? "default" : "outline"}
              aria-pressed={publicacion === opcion.valor}
              onClick={() => onFiltrarPublicacion(opcion.valor)}
            >
              {opcion.etiqueta}
            </Button>
          ))}
          {filtrando && (
            <Button type="button" size="sm" variant="ghost" onClick={onLimpiar}>
              <X className="size-3.5" aria-hidden />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground tabular-nums">
          {numero(total)} {total === 1 ? "plan" : "planes"}
          {filtrando && " con estos filtros"}
        </span>
        {gestiona && (
          <Button type="button" onClick={onCrear}>
            <Plus className="size-4" aria-hidden />
            Nuevo plan
          </Button>
        )}
      </div>
    </div>
  )
}
