"use client"

import { Plus, Search, X } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Input } from "@shared/components/ui/input"
import { useFormato } from "@shared/hooks/useFormato"
import { ESTADO_BARBERIA } from "@features/plataforma/utils/inventario"
import type { EstadoBarberia } from "@features/plataforma/types/plataforma.types"

interface PlataformaToolbarProps {
  busqueda: string
  estado: EstadoBarberia | "todas"
  total: number
  onBuscar: (valor: string) => void
  onFiltrarEstado: (estado: EstadoBarberia | "todas") => void
  onLimpiar: () => void
  /** Sin `plataforma.barberias.gestionar` el inventario se consulta, no se toca. */
  gestiona: boolean
  onCrear: () => void
}

const ESTADOS: (EstadoBarberia | "todas")[] = ["todas", "activa", "solo_lectura", "suspendida"]

function etiquetaDe(valor: EstadoBarberia | "todas"): string {
  return valor === "todas" ? "Todas" : ESTADO_BARBERIA[valor].etiqueta
}

export function PlataformaToolbar({
  busqueda,
  estado,
  total,
  onBuscar,
  onFiltrarEstado,
  onLimpiar,
  gestiona,
  onCrear,
}: PlataformaToolbarProps) {
  const { numero } = useFormato()
  const filtrando = busqueda !== "" || estado !== "todas"

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
            // Por el correo del dueño entra la mitad de los casos de soporte:
            // quien escribe pidiendo ayuda firma con su correo, no con el
            // identificador de su barbería.
            placeholder="Buscar por nombre, identificador o correo del dueño"
            className="pl-9"
            aria-label="Buscar barbería"
          />
        </div>

        {/* Los cuatro cortes que de verdad se usan: el estado es la única
            pregunta que se hace a diario sobre el inventario. */}
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por estado">
          {ESTADOS.map((opcion) => (
            <Button
              key={opcion}
              type="button"
              size="sm"
              variant={estado === opcion ? "default" : "outline"}
              aria-pressed={estado === opcion}
              onClick={() => onFiltrarEstado(opcion)}
            >
              {etiquetaDe(opcion)}
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
          {numero(total)} {total === 1 ? "barbería" : "barberías"}
          {filtrando && " con estos filtros"}
        </span>
        {gestiona && (
          <Button type="button" onClick={onCrear}>
            <Plus className="size-4" aria-hidden />
            Nueva barbería
          </Button>
        )}
      </div>
    </div>
  )
}
