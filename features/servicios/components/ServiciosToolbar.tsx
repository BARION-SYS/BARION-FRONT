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

interface ServiciosToolbarProps {
  buscar: string
  categoria: string
  soloActivos: boolean
  /** Las categorías que existen hoy en la carta, no una lista fija. */
  categorias: string[]
  onBuscar: (valor: string) => void
  onCategoria: (valor: string) => void
  onSoloActivos: (valor: boolean) => void
}

const TODAS = "todas"
const ESTADOS = { todos: "todos", activos: "activos" } as const

export function ServiciosToolbar({
  buscar,
  categoria,
  soloActivos,
  categorias,
  onBuscar,
  onCategoria,
  onSoloActivos,
}: ServiciosToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={buscar}
          onChange={(e) => onBuscar(e.target.value)}
          placeholder="Buscar servicio"
          aria-label="Buscar servicio"
          className="pl-9"
        />
      </div>

      <Select
        value={categoria || TODAS}
        onValueChange={(valor) => onCategoria(!valor || valor === TODAS ? "" : valor)}
      >
        <SelectTrigger className="w-full sm:w-48" aria-label="Categoría">
          <SelectValue placeholder="Categoría" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TODAS}>Todas las categorías</SelectItem>
          {categorias.map((valor) => (
            <SelectItem key={valor} value={valor}>
              {valor}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={soloActivos ? ESTADOS.activos : ESTADOS.todos}
        onValueChange={(valor) => onSoloActivos(valor === ESTADOS.activos)}
      >
        <SelectTrigger className="w-full sm:w-44" aria-label="Estado">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ESTADOS.todos}>Todo el catálogo</SelectItem>
          <SelectItem value={ESTADOS.activos}>Solo en carta</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
