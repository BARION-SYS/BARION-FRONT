"use client"

import { Check, Minus } from "lucide-react"
import { FAMILIA_EXCLUIDA, NOMBRE_FAMILIA } from "@features/roles/constants/familias"
import type { Permiso, Rol } from "@features/roles/types/roles.types"

interface RolesDetailProps {
  rol: Rol
  permisos: Permiso[]
}

/**
 * Qué trae un rol, en solo lectura.
 *
 * No hay formulario de rol porque no hay nada que editar: los roles los define
 * Barion y valen igual en todas las barberías. Ajustar a UNA persona se hace
 * desde su ficha, con las excepciones de permiso.
 */
export function RolesDetail({ rol, permisos }: RolesDetailProps) {
  const delNegocio = permisos.filter((p) => p.familia !== FAMILIA_EXCLUIDA)
  const familias = [...new Set(delNegocio.map((p) => p.familia))]
  const trae = new Set(rol.permisos)

  return (
    <div className="flex flex-col gap-5">
      <p className="rounded-lg border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
        Este rol lo define Barion y es igual en todas las barberías, por eso no se edita. Para que
        una persona concreta pueda más —o menos— que su rol, se ajustan sus permisos desde Personas.
      </p>

      <div className="flex items-baseline justify-between">
        <p className="text-sm font-medium">Capacidades</p>
        <span className="text-xs text-muted-foreground">{trae.size} activas</span>
      </div>

      <div className="flex max-h-[50vh] flex-col gap-4 overflow-y-auto pr-1">
        {familias.map((familia) => (
          <section key={familia} className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {NOMBRE_FAMILIA[familia] ?? familia}
            </h3>
            <ul className="grid gap-2 sm:grid-cols-2">
              {delNegocio
                .filter((p) => p.familia === familia)
                .map((permiso) => {
                  const activa = trae.has(permiso.clave)
                  return (
                    <li
                      key={permiso.clave}
                      className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2 text-sm"
                    >
                      {activa ? (
                        <Check className="size-3.5 shrink-0 text-(--exito)" aria-hidden />
                      ) : (
                        <Minus className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                      )}
                      <code
                        className={
                          activa
                            ? "min-w-0 truncate text-xs"
                            : "min-w-0 truncate text-xs text-muted-foreground"
                        }
                      >
                        {permiso.clave}
                      </code>
                      <span className="sr-only">{activa ? "incluida" : "no incluida"}</span>
                    </li>
                  )
                })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
