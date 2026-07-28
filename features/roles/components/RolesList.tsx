"use client"

import { Lock, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@shared/components/ui/dropdown-menu"
import { Loadable } from "@shared/components/feedback/Loadable"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import type { Rol } from "@features/roles/types/roles.types"

interface RolesListProps {
  roles: Rol[]
  loading: boolean
  onEditar: (rol: Rol) => void
  onEliminar: (rol: Rol) => void
}

export function RolesList({ roles, loading, onEditar, onEliminar }: RolesListProps) {
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
          <li
            key={rol.id}
            className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium">{rol.nombre}</p>
                {rol.esSistema && (
                  <StatusBadge tono="neutro" etiqueta="De Barion" icono={Lock} compacta />
                )}
              </div>
              <p className="truncate text-xs text-muted-foreground">
                <code>{rol.codigo}</code> · {rol.permisos.length} capacidades
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                <MoreHorizontal className="size-4" aria-hidden />
                <span className="sr-only">Acciones de {rol.nombre}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEditar(rol)}>
                  {rol.esSistema ? "Ver capacidades" : "Editar"}
                </DropdownMenuItem>
                {!rol.esSistema && (
                  <DropdownMenuItem onClick={() => onEliminar(rol)}>Eliminar</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        ))}
      </ul>
    </Loadable>
  )
}
