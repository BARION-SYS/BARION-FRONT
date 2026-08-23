"use client"

import { useState } from "react"
import { Loader2, Minus, Plus } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { FAMILIA_EXCLUIDA, NOMBRE_FAMILIA } from "@features/roles/constants/familias"
import type { ExcepcionPermiso, Permiso, Rol } from "@features/roles/types/roles.types"
import { useTextos } from "@shared/textos/useTextos"

interface RolesExcepcionesFormProps {
  /** El rol de la persona: sus capacidades son el punto de partida. */
  rol: Rol | undefined
  permisos: Permiso[]
  excepciones: ExcepcionPermiso[]
  cargando?: boolean
  onSubmit: (excepciones: ExcepcionPermiso[]) => Promise<void>
}

type Estado = "hereda" | "concedido" | "revocado"

/**
 * Capacidades de UNA persona sobre lo que le da su rol.
 *
 * Es la única pantalla de autorización que escribe: los roles los define Barion
 * y no se editan, así que todo ajuste —dar algo que su rol no trae, quitarle
 * algo que sí— se hace aquí, sin cambiar a nadie de rol.
 *
 * Cada capacidad tiene tres estados y no dos, porque "hereda" no es lo mismo que
 * "concedido": si mañana cambia el rol, lo heredado cambia con él y lo concedido
 * expresamente no. Perder esa diferencia convertiría cada ajuste puntual en una
 * copia congelada del rol.
 */
export function RolesExcepcionesForm({
  rol,
  permisos,
  excepciones,
  cargando,
  onSubmit,
}: RolesExcepcionesFormProps) {
  const t = useTextos("roles")
  const [cambios, setCambios] = useState<Map<string, boolean>>(
    new Map(excepciones.map((e) => [e.permiso, e.concedido]))
  )

  const delNegocio = permisos.filter((p) => p.familia !== FAMILIA_EXCLUIDA)
  const familias = [...new Set(delNegocio.map((p) => p.familia))]
  const delRol = new Set(rol?.permisos ?? [])

  const estadoDe = (clave: string): Estado => {
    const excepcion = cambios.get(clave)
    if (excepcion === undefined) return "hereda"
    return excepcion ? "concedido" : "revocado"
  }

  // Un clic sobre lo heredado lo invierte; otro devuelve a lo que dice el rol.
  const alternar = (clave: string) => {
    setCambios((previos) => {
      const siguiente = new Map(previos)
      if (estadoDe(clave) === "hereda") siguiente.set(clave, !delRol.has(clave))
      else siguiente.delete(clave)
      return siguiente
    })
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        void onSubmit([...cambios].map(([permiso, concedido]) => ({ permiso, concedido })))
      }}
    >
      <p className="text-xs text-muted-foreground">
        Parte de lo que le da su rol <strong>{rol?.nombre ?? "—"}</strong>. Lo que aquí se marque
        manda sobre el rol: una revocación gana siempre.
      </p>

      <div className="flex max-h-[50vh] flex-col gap-4 overflow-y-auto pr-1">
        {familias.map((familia) => (
          <section key={familia} className="flex flex-col gap-1.5">
            <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {NOMBRE_FAMILIA[familia] ?? familia}
            </h3>
            {delNegocio
              .filter((p) => p.familia === familia)
              .map((permiso) => {
                const estado = estadoDe(permiso.clave)
                const heredado = delRol.has(permiso.clave)
                return (
                  <button
                    key={permiso.clave}
                    type="button"
                    onClick={() => alternar(permiso.clave)}
                    className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 text-left text-sm transition-colors hover:bg-secondary/50"
                  >
                    <code className="min-w-0 flex-1 truncate text-xs">{permiso.clave}</code>
                    {estado === "concedido" && (
                      <span className="flex items-center gap-1 text-xs text-(--exito)">
                        <Plus className="size-3" aria-hidden />
                        Concedido
                      </span>
                    )}
                    {estado === "revocado" && (
                      <span className="flex items-center gap-1 text-xs text-destructive">
                        <Minus className="size-3" aria-hidden />
                        Revocado
                      </span>
                    )}
                    {estado === "hereda" && (
                      <span className="text-xs text-muted-foreground">
                        {heredado ? t("heredaSi") : t("heredaNo")}
                      </span>
                    )}
                  </button>
                )
              })}
          </section>
        ))}
      </div>

      <Button type="submit" disabled={cargando} className="h-10">
        {cargando && <Loader2 className="size-4 animate-spin" aria-hidden />}
        Guardar permisos
      </Button>
    </form>
  )
}
