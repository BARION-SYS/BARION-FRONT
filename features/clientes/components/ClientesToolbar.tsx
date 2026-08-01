"use client"

import { Search } from "lucide-react"
import { Input } from "@shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select"

interface ClientesToolbarProps {
  buscar: string
  segmentoId: string
  /** Las etiquetas que existen hoy, no una lista fija: las define la barbería. */
  segmentos: { id: string; nombre: string }[]
  total: number
  onBuscar: (valor: string) => void
  onSegmento: (valor: string) => void
}

const TODOS = "todos"

export function ClientesToolbar({
  buscar,
  segmentoId,
  segmentos,
  total,
  onBuscar,
  onSegmento,
}: ClientesToolbarProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={buscar}
          onChange={(e) => onBuscar(e.target.value)}
          placeholder="Nombre, teléfono o correo"
          aria-label="Buscar cliente"
          className="pl-9"
        />
      </div>

      <Select
        value={segmentoId || TODOS}
        onValueChange={(valor) => onSegmento(!valor || valor === TODOS ? "" : valor)}
      >
        <SelectTrigger aria-label="Etiqueta" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TODOS}>Todas las etiquetas</SelectItem>
          {segmentos.map((segmento) => (
            <SelectItem key={segmento.id} value={segmento.id}>
              {segmento.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <p
        className="px-1 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground/80 uppercase"
        aria-live="polite"
      >
        {total} {total === 1 ? "cliente" : "clientes"}
      </p>
    </div>
  )
}
