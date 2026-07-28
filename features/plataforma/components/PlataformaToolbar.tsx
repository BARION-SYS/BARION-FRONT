"use client"

import { Plus, Search } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Input } from "@shared/components/ui/input"
import type { EstadoBarberia } from "@features/plataforma/types/plataforma.types"

interface PlataformaToolbarProps {
  busqueda: string
  estado: EstadoBarberia | "todas"
  total: number
  onBuscar: (valor: string) => void
  onFiltrarEstado: (estado: EstadoBarberia | "todas") => void
  onCrear: () => void
}

const ESTADOS: { valor: EstadoBarberia | "todas"; etiqueta: string }[] = [
  { valor: "todas", etiqueta: "Todas" },
  { valor: "activa", etiqueta: "Activas" },
  { valor: "solo_lectura", etiqueta: "Solo lectura" },
  { valor: "suspendida", etiqueta: "Suspendidas" },
]

export function PlataformaToolbar({
  busqueda,
  estado,
  total,
  onBuscar,
  onFiltrarEstado,
  onCrear,
}: PlataformaToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:max-w-xs sm:flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={busqueda}
            onChange={(e) => onBuscar(e.target.value)}
            placeholder="Buscar por nombre o identificador"
            className="pl-9"
            aria-label="Buscar barbería"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {ESTADOS.map((opcion) => (
            <Button
              key={opcion.valor}
              type="button"
              size="sm"
              variant={estado === opcion.valor ? "default" : "outline"}
              onClick={() => onFiltrarEstado(opcion.valor)}
            >
              {opcion.etiqueta}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">
          {total} {total === 1 ? "barbería" : "barberías"}
        </span>
        <Button type="button" onClick={onCrear}>
          <Plus className="size-4" aria-hidden />
          Nueva barbería
        </Button>
      </div>
    </div>
  )
}
