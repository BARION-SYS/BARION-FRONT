import { Plus, Users } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { cn } from "@shared/utils/cn"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import { useFormato } from "@shared/hooks/useFormato"
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
  const { relativo } = useFormato()

  return (
    <>
      <p
        className="px-1 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground/80 uppercase"
        aria-live="polite"
      >
        {clientes.length} {clientes.length === 1 ? "cliente" : "clientes"}
      </p>

      <ul
        className="scroll-fino space-y-1.5 lg:min-h-0 lg:flex-1 lg:overflow-y-auto"
        aria-label="Clientes"
      >
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
                  "relative min-h-11 w-full cursor-pointer overflow-hidden rounded-xl border p-3 text-left transition-colors motion-reduce:transition-none",
                  "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
                  seleccionado
                    ? "border-primary/40 bg-primary/5"
                    : "border-border bg-card hover:bg-secondary"
                )}
              >
                {/* Indicador de selección */}
                <span
                  className={cn(
                    "absolute inset-y-2 left-0 w-0.5 rounded-full bg-primary transition-opacity",
                    seleccionado ? "opacity-100" : "opacity-0"
                  )}
                  aria-hidden
                />
                <div className="flex items-center gap-3">
                  <InitialsAvatar
                    iniciales={c.iniciales}
                    color={config.color}
                    className="size-10"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">{c.nombre}</p>
                      <StatusBadge etiqueta={c.etiqueta} tono={config.tono} />
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      <span className="tabular-nums">{c.visitas}</span> visitas ·{" "}
                      {relativo(c.ultimaVisitaEn)}
                    </p>
                  </div>
                </div>
              </button>
            </li>
          )
        })}
        {clientes.length === 0 && (
          <li className="flex flex-col items-center py-8 text-muted-foreground">
            <Users className="size-8 opacity-30" aria-hidden />
            <p className="mt-2 text-xs font-medium">Sin resultados</p>
            <p className="mt-0.5 text-[11px] opacity-80">Prueba con otro nombre o filtro</p>
          </li>
        )}
      </ul>

      <Button size="lg" onClick={onNuevo} className="w-full cursor-pointer font-semibold">
        <Plus aria-hidden /> Nuevo cliente
      </Button>
    </>
  )
}
