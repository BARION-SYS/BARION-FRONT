"use client"

import { Plus, ShieldCheck } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import { Loadable } from "@shared/components/feedback/Loadable"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import { useFormato } from "@shared/hooks/useFormato"
import { cn } from "@shared/utils/cn"
import { inicialesDe } from "@shared/utils/iniciales"
import type { Cliente } from "@features/clientes/types/clientes.types"

interface ClientesListProps {
  clientes: Cliente[]
  loading: boolean
  seleccionadoId: string | null
  /** `clientes.gestionar`: sin él, el directorio se consulta y no se toca. */
  gestiona: boolean
  onSeleccionar: (id: string) => void
  onNuevo: () => void
}

/**
 * El directorio. La ETIQUETA la resuelve la api —una, la de mayor prioridad—,
 * así que aquí no se decide cuál gana ni se calcula ninguna.
 */
export function ClientesList({
  clientes,
  loading,
  seleccionadoId,
  gestiona,
  onSeleccionar,
  onNuevo,
}: ClientesListProps) {
  const { relativo } = useFormato()

  return (
    <div className="flex min-h-0 flex-col gap-3">
      {gestiona && (
        <Button type="button" size="sm" onClick={onNuevo} className="self-start">
          <Plus className="size-4" aria-hidden />
          Nuevo cliente
        </Button>
      )}

      <Loadable
        loading={loading}
        isEmpty={clientes.length === 0}
        variant="list"
        count={6}
        emptyState={
          <p className="py-10 text-center text-sm text-muted-foreground">
            No hay clientes con esos filtros.
          </p>
        }
      >
        <ul className="scroll-fino flex flex-col gap-2 lg:min-h-0 lg:overflow-y-auto">
          {clientes.map((cliente) => (
            <li key={cliente.id}>
              <button
                type="button"
                onClick={() => onSeleccionar(cliente.id)}
                aria-current={cliente.id === seleccionadoId}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
                  cliente.id === seleccionadoId
                    ? "border-primary/40 bg-secondary"
                    : "border-border bg-card hover:bg-secondary/60"
                )}
              >
                <InitialsAvatar
                  iniciales={inicialesDe(`${cliente.nombre} ${cliente.apellido ?? ""}`)}
                />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-sm font-medium">
                    {cliente.nombre} {cliente.apellido}
                    {/* Verificado = ese teléfono es suyo de verdad. Es lo que
                        sostiene el recordatorio y la campaña. */}
                    {cliente.telefonoVerificado && (
                      <ShieldCheck
                        className="size-3.5 shrink-0 text-(--exito)"
                        aria-label="Teléfono verificado"
                      />
                    )}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {cliente.ultimaVisitaEn
                      ? `Última visita ${relativo(cliente.ultimaVisitaEn)}`
                      : "Sin visitas todavía"}
                  </p>
                </div>
                {cliente.etiqueta && (
                  <StatusBadge tono="primario" etiqueta={cliente.etiqueta.nombre} compacta />
                )}
              </button>
            </li>
          ))}
        </ul>
      </Loadable>
    </div>
  )
}
