"use client"

import { Search, X } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Input } from "@shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select"
import { useFormato } from "@shared/hooks/useFormato"
import { ETIQUETA_SUSCRIPCION } from "@features/plataforma/constants/planes.copy"
import type { EstadoSuscripcion, PlanAdmin } from "@features/plataforma/types/plataforma.types"

/** Centinela de «sin filtro»: un select no sabe representar `undefined`. */
export const TODOS = "todos"

interface PlataformaSuscripcionToolbarProps {
  busqueda: string
  estado: EstadoSuscripcion | typeof TODOS
  planCodigo: string
  /** El catálogo real: el código del plan se elige, no se teclea. */
  planes: PlanAdmin[]
  total: number
  onBuscar: (valor: string) => void
  onFiltrarEstado: (valor: EstadoSuscripcion | typeof TODOS) => void
  onFiltrarPlan: (valor: string) => void
  onLimpiar: () => void
}

const ESTADOS: EstadoSuscripcion[] = ["prueba", "activa", "mora", "cancelada", "sobre_limite"]

/**
 * Los tres cortes con los que se atiende: quién es, en qué estado está su cobro
 * y qué plan tiene.
 *
 * El estado va en un `Select` y no en botones —como sí hace el inventario—
 * porque son cinco y no cuatro, y a 375 px una fila de cinco píldoras se parte.
 */
export function PlataformaSuscripcionToolbar({
  busqueda,
  estado,
  planCodigo,
  planes,
  total,
  onBuscar,
  onFiltrarEstado,
  onFiltrarPlan,
  onLimpiar,
}: PlataformaSuscripcionToolbarProps) {
  const { numero } = useFormato()
  const filtrando = busqueda !== "" || estado !== TODOS || planCodigo !== TODOS

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
            placeholder="Buscar por nombre o identificador"
            className="pl-9"
            aria-label="Buscar barbería"
          />
        </div>

        {/* `null` es el «sin selección» de Base UI y aquí no existe: sin filtro
            de estado se está en «todos», que sí es un valor. */}
        <Select value={estado} onValueChange={(valor) => onFiltrarEstado(valor ?? TODOS)}>
          <SelectTrigger className="w-full sm:w-48" aria-label="Filtrar por estado del cobro">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>Todos los estados</SelectItem>
            {ESTADOS.map((opcion) => (
              <SelectItem key={opcion} value={opcion}>
                {ETIQUETA_SUSCRIPCION[opcion] ?? opcion}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={planCodigo} onValueChange={(valor) => onFiltrarPlan(valor ?? TODOS)}>
          <SelectTrigger className="w-full sm:w-44" aria-label="Filtrar por plan">
            <SelectValue placeholder="Todos los planes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>Todos los planes</SelectItem>
            {planes.map((plan) => (
              <SelectItem key={plan.id} value={plan.codigo}>
                {plan.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {filtrando && (
          <Button type="button" size="sm" variant="ghost" onClick={onLimpiar}>
            <X className="size-3.5" aria-hidden />
            Limpiar
          </Button>
        )}
      </div>

      <span className="text-xs text-muted-foreground tabular-nums">
        {numero(total)} {total === 1 ? "suscripción" : "suscripciones"}
        {filtrando && " con estos filtros"}
      </span>
    </div>
  )
}
