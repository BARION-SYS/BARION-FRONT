import { Search, UserPlus, Users } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Card } from "@shared/components/ui/card"
import { Input } from "@shared/components/ui/input"
import { cn } from "@shared/utils/cn"
import type { FiltroEtiqueta, ResumenClientes } from "@features/clientes/types/clientes.types"

const filtros: FiltroEtiqueta[] = ["Todos", "VIP", "Frecuente", "Regular", "Nuevo"]

interface Props {
  busqueda: string
  onBusquedaChange: (valor: string) => void
  filtro: FiltroEtiqueta
  onFiltroChange: (filtro: FiltroEtiqueta) => void
  resumen: ResumenClientes
}

// Presentacional: búsqueda, filtros por etiqueta y mini-resumen.
export function ClientesToolbar({
  busqueda,
  onBusquedaChange,
  filtro,
  onFiltroChange,
  resumen,
}: Props) {
  const estadisticas = [
    { etiqueta: "Total clientes", valor: resumen.totalClientes, icono: Users },
    { etiqueta: "Nuevos hoy", valor: resumen.nuevosHoy, icono: UserPlus },
  ]

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          value={busqueda}
          onChange={(e) => onBusquedaChange(e.target.value)}
          placeholder="Buscar cliente o teléfono..."
          aria-label="Buscar cliente o teléfono"
          className="h-9 rounded-full border-transparent bg-secondary/60 pl-9 text-xs transition-colors focus-visible:border-border focus-visible:bg-card"
        />
      </div>

      {/* Chips en varias filas — nunca scroll horizontal */}
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por etiqueta">
        {filtros.map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filtro === f ? "default" : "outline"}
            onClick={() => onFiltroChange(f)}
            aria-pressed={filtro === f}
            className={cn(
              "h-9 shrink-0 cursor-pointer rounded-full px-3 text-[11px] font-medium motion-reduce:transition-none",
              filtro !== f && "text-muted-foreground hover:text-foreground"
            )}
          >
            {f}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {estadisticas.map((s) => (
          <Card key={s.etiqueta} className="flex-row items-center gap-2.5 p-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <s.icono className="size-3.5 text-primary" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-lg leading-none font-bold text-foreground tabular-nums">
                {s.valor}
              </span>
              <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">
                {s.etiqueta}
              </span>
            </span>
          </Card>
        ))}
      </div>
    </div>
  )
}
