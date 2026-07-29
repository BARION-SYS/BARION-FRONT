"use client"

import { ChevronRight } from "lucide-react"
import { Loadable } from "@shared/components/feedback/Loadable"
import type { Rol } from "@features/roles/types/roles.types"

interface RolesListProps {
  roles: Rol[]
  loading: boolean
  /** Abre el detalle: qué trae ese rol. No hay edición — los define Barion. */
  onVer: (rol: Rol) => void
}

export function RolesList({ roles, loading, onVer }: RolesListProps) {
  return (
    <Loadable
      loading={loading}
      isEmpty={roles.length === 0}
      variant="list"
      emptyState={
        <p className="py-10 text-center text-sm text-muted-foreground">Todavía no hay roles.</p>
      }
    >
      <ul className="flex flex-col gap-2">
        {roles.map((rol) => (
          <li key={rol.id}>
            <button
              type="button"
              onClick={() => onVer(rol)}
              className="flex w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-secondary/50"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{rol.nombre}</p>
                <p className="truncate text-xs text-muted-foreground">
                  <code>{rol.codigo}</code> · {rol.permisos.length} capacidades
                </p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="sr-only">Ver capacidades de {rol.nombre}</span>
            </button>
          </li>
        ))}
      </ul>
    </Loadable>
  )
}
