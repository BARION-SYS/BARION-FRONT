import { Plus } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { cn } from "@shared/utils/cn"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import { configEtiquetaCliente } from "@features/clientes/utils/etiquetaCliente"
import type { Cliente } from "@features/clientes/types/clientes.types"

interface Props {
  clientes: Cliente[]
  seleccionadoId: Cliente["id"]
  onSeleccionar: (id: Cliente["id"]) => void
  onNuevo: () => void
}

// Presentacional: lista seleccionable de clientes + alta rápida.
export function ClientesList({ clientes, seleccionadoId, onSeleccionar, onNuevo }: Props) {
  return (
    <>
      <ul className="min-h-0 flex-1 space-y-1.5 overflow-y-auto" aria-label="Clientes">
        {clientes.map((c) => {
          const config = configEtiquetaCliente[c.etiqueta]
          const seleccionado = c.id === seleccionadoId
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onSeleccionar(c.id)}
                aria-pressed={seleccionado}
                className={cn(
                  "min-h-9 w-full cursor-pointer rounded-xl border p-3 text-left transition-colors motion-reduce:transition-none",
                  "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
                  seleccionado
                    ? "border-primary/40 bg-primary/5"
                    : "border-border bg-card hover:bg-secondary"
                )}
              >
                <div className="flex items-center gap-3">
                  <InitialsAvatar iniciales={c.iniciales} color={config.color} className="size-9" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-xs font-semibold text-foreground">{c.nombre}</p>
                      <StatusBadge etiqueta={c.etiqueta} tono={config.tono} />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      <span className="tabular-nums">{c.visitas}</span> visitas · {c.ultimaVisita}
                    </p>
                  </div>
                </div>
              </button>
            </li>
          )
        })}
        {clientes.length === 0 && (
          <li className="py-6 text-center text-xs text-muted-foreground">
            Sin resultados para la búsqueda
          </li>
        )}
      </ul>

      <Button size="lg" onClick={onNuevo} className="w-full cursor-pointer">
        <Plus aria-hidden /> Nuevo cliente
      </Button>
    </>
  )
}
