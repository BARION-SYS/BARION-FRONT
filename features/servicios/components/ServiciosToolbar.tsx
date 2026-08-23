"use client"

import { Search } from "lucide-react"
import { Input } from "@shared/components/ui/input"
import { useTextos } from "@shared/textos/useTextos"
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
  const t = useTextos("servicios.toolbar")
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
          placeholder={t("buscar")}
          aria-label={t("buscar")}
          className="pl-9"
        />
      </div>

      <Select
        value={categoria || TODAS}
        onValueChange={(valor) => onCategoria(!valor || valor === TODAS ? "" : valor)}
      >
        <SelectTrigger className="w-full sm:w-48" aria-label={t("categoria")}>
          <SelectValue placeholder={t("categoria")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TODAS}>{t("todasLasCategorias")}</SelectItem>
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
        <SelectTrigger className="w-full sm:w-44" aria-label={t("estado")}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ESTADOS.todos}>{t("todoElCatalogo")}</SelectItem>
          <SelectItem value={ESTADOS.activos}>{t("soloEnCarta")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
