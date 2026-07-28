"use client"

import { useState } from "react"
import { Loader2, Lock } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Checkbox } from "@shared/components/ui/checkbox"
import { Field, FieldLabel } from "@shared/components/ui/field"
import { Input } from "@shared/components/ui/input"
import type { Permiso, Rol } from "@features/roles/types/roles.types"

interface RolesFormProps {
  /** Sin rol = alta. Con rol = edición, y entonces el código no se toca. */
  rol?: Rol | null
  permisos: Permiso[]
  cargando?: boolean
  onSubmit: (datos: { codigo: string; nombre: string; permisos: string[] }) => Promise<void>
}

/** Rótulos de familia. Sin entrada, se muestra la clave tal cual. */
const NOMBRE_FAMILIA: Record<string, string> = {
  barberias: "Barbería",
  sedes: "Sedes",
  equipo: "Equipo",
  roles: "Roles y permisos",
  barberos: "Barberos",
  catalogo: "Catálogo",
  agenda: "Agenda",
  clientes: "Clientes",
  ganancias: "Liquidación",
  jornadas: "Jornadas",
  reportes: "Reportes",
  plataforma: "Plataforma",
}

/**
 * Alta y edición de un rol, con la matriz de capacidades agrupada por familia.
 *
 * Se envía el paquete COMPLETO de permisos y no las diferencias: es lo único que
 * permite quitar uno. Por eso el formulario mantiene el conjunto entero en
 * estado en lugar de acumular altas y bajas.
 */
export function RolesForm({ rol, permisos, cargando, onSubmit }: RolesFormProps) {
  const editando = Boolean(rol)
  const bloqueado = rol?.esSistema ?? false

  const [codigo, setCodigo] = useState(rol?.codigo ?? "")
  const [nombre, setNombre] = useState(rol?.nombre ?? "")
  const [elegidos, setElegidos] = useState<Set<string>>(new Set(rol?.permisos ?? []))

  // Las capacidades de plataforma no se reparten desde una barbería: no salen
  // de un rol sino de la bandera del staff de Barion.
  const delNegocio = permisos.filter((p) => p.familia !== "plataforma")
  const familias = [...new Set(delNegocio.map((p) => p.familia))]

  const alternar = (clave: string) => {
    setElegidos((previos) => {
      const siguiente = new Set(previos)
      if (siguiente.has(clave)) siguiente.delete(clave)
      else siguiente.add(clave)
      return siguiente
    })
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault()
        void onSubmit({ codigo, nombre, permisos: [...elegidos] })
      }}
    >
      {bloqueado && (
        <p className="flex items-start gap-2 rounded-lg border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
          <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          Este rol lo define Barion y lo comparten todas las barberías, así que no se puede editar.
          Crea uno propio con estos mismos permisos si necesitas cambiarlo.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="codigo">Código</FieldLabel>
          <Input
            id="codigo"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="recepcion_caja"
            disabled={editando || bloqueado}
          />
          <p className="text-xs text-muted-foreground">
            {editando ? "El código no cambia: es estable" : "Minúsculas, números y guion bajo"}
          </p>
        </Field>

        <Field>
          <FieldLabel htmlFor="nombre">Nombre</FieldLabel>
          <Input
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Recepción con caja"
            disabled={bloqueado}
          />
        </Field>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-medium">Capacidades</p>
          <span className="text-xs text-muted-foreground">{elegidos.size} activas</span>
        </div>

        {familias.map((familia) => (
          <fieldset key={familia} className="flex flex-col gap-2">
            <legend className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {NOMBRE_FAMILIA[familia] ?? familia}
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {delNegocio
                .filter((p) => p.familia === familia)
                .map((permiso) => (
                  <label
                    key={permiso.clave}
                    className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <Checkbox
                      checked={elegidos.has(permiso.clave)}
                      onCheckedChange={() => alternar(permiso.clave)}
                      disabled={bloqueado}
                    />
                    <code className="min-w-0 truncate text-xs">{permiso.clave}</code>
                  </label>
                ))}
            </div>
          </fieldset>
        ))}
      </div>

      {!bloqueado && (
        <Button type="submit" disabled={cargando} className="h-10">
          {cargando && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {editando ? "Guardar rol" : "Crear rol"}
        </Button>
      )}
    </form>
  )
}
