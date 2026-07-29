"use client"

import { CalendarClock, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@shared/components/ui/dropdown-menu"
import { Loadable } from "@shared/components/feedback/Loadable"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import type { Sede } from "@features/sedes/types/sedes.types"

interface SedesListProps {
  sedes: Sede[]
  loading: boolean
  /** Sin `sedes.gestionar` la lista se consulta, pero no ofrece qué cambiar. */
  gestiona: boolean
  onEditar: (sede: Sede) => void
  onCalendario: (sede: Sede) => void
  onAlternarActiva: (sede: Sede) => void
}

export function SedesList({
  sedes,
  loading,
  gestiona,
  onEditar,
  onCalendario,
  onAlternarActiva,
}: SedesListProps) {
  return (
    <Loadable
      loading={loading}
      isEmpty={sedes.length === 0}
      variant="list"
      emptyState={
        <p className="py-10 text-center text-sm text-muted-foreground">
          Todavía no hay sedes. Crea la primera con el botón de arriba.
        </p>
      }
    >
      <ul className="flex flex-col gap-2">
        {sedes.map((sede) => (
          <li
            key={sede.id}
            className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium">{sede.nombre}</p>
                {!sede.activa && <StatusBadge tono="neutro" etiqueta="Desactivada" compacta />}
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {sede.zonaHoraria}
                {sede.direccion?.ciudad ? ` · ${sede.direccion.ciudad}` : ""} ·{" "}
                <code>{sede.slugQr}</code>
              </p>
            </div>

            <button
              type="button"
              onClick={() => onCalendario(sede)}
              className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <CalendarClock className="size-4" aria-hidden />
              Horario
            </button>

            {gestiona && (
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                  <MoreHorizontal className="size-4" aria-hidden />
                  <span className="sr-only">Acciones de {sede.nombre}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEditar(sede)}>Editar</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onCalendario(sede)}>
                    Horario y cierres
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAlternarActiva(sede)}>
                    {sede.activa ? "Desactivar" : "Reactivar"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </li>
        ))}
      </ul>
    </Loadable>
  )
}
