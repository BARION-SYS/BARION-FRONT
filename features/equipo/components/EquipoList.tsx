"use client"

import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@shared/components/ui/dropdown-menu"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import { Loadable } from "@shared/components/feedback/Loadable"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import { inicialesDe } from "@shared/utils/iniciales"
import type { EstadoMembresia, Miembro } from "@features/equipo/types/equipo.types"
import type { Rol } from "@features/roles/types/roles.types"
import type { TonoEstado } from "@shared/types/ui.types"

interface EquipoListProps {
  miembros: Miembro[]
  roles: Rol[]
  loading: boolean
  onCambiarRol: (miembro: Miembro, codigoRol: string) => void
  onPermisos: (miembro: Miembro) => void
  onRevocar: (miembro: Miembro) => void
}

const TONO_ESTADO: Record<EstadoMembresia, { tono: TonoEstado; etiqueta: string }> = {
  activa: { tono: "exito", etiqueta: "Activa" },
  invitada: { tono: "advertencia", etiqueta: "Invitada" },
  revocada: { tono: "neutro", etiqueta: "Revocada" },
}

export function EquipoList({
  miembros,
  roles,
  loading,
  onCambiarRol,
  onPermisos,
  onRevocar,
}: EquipoListProps) {
  // El rol viaja como código; el nombre se pinta desde el catálogo de roles.
  const nombreDeRol = (codigo: string) => roles.find((r) => r.codigo === codigo)?.nombre ?? codigo

  return (
    <Loadable
      loading={loading}
      isEmpty={miembros.length === 0}
      variant="list"
      emptyState={
        <p className="py-10 text-center text-sm text-muted-foreground">
          Todavía no hay nadie con acceso. Invita a la primera persona.
        </p>
      }
    >
      <ul className="flex flex-col gap-2">
        {miembros.map((miembro) => {
          const estado = TONO_ESTADO[miembro.estado]
          return (
            <li
              key={miembro.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
            >
              <InitialsAvatar iniciales={inicialesDe(miembro.nombre)} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{miembro.nombre}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {miembro.usuario?.email ?? miembro.usuario?.telefonoE164 ?? "—"}
                </p>
              </div>

              <span className="hidden text-xs text-muted-foreground sm:block">
                {nombreDeRol(miembro.rol)}
              </span>
              <StatusBadge tono={estado.tono} etiqueta={estado.etiqueta} compacta />

              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                  <MoreHorizontal className="size-4" aria-hidden />
                  <span className="sr-only">Acciones de {miembro.nombre}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Cambiar rol</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {roles
                        .filter((rol) => rol.codigo !== miembro.rol)
                        .map((rol) => (
                          <DropdownMenuItem
                            key={rol.id}
                            onClick={() => onCambiarRol(miembro, rol.codigo)}
                          >
                            {rol.nombre}
                          </DropdownMenuItem>
                        ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuItem onClick={() => onPermisos(miembro)}>
                    Permisos a medida
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {miembro.estado !== "revocada" && (
                    <DropdownMenuItem onClick={() => onRevocar(miembro)}>
                      Revocar acceso
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          )
        })}
      </ul>
    </Loadable>
  )
}
