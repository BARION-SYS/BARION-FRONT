"use client"

import { useState } from "react"
import { FieldLabel } from "@shared/components/ui/field"
import { Switch } from "@shared/components/ui/switch"
import { BarberosForm } from "@features/barberos/components/BarberosForm"
import { EquipoForm } from "@features/equipo/components/EquipoForm"
import type { DatosBarbero } from "@features/barberos/schemas/barberos.schema"
import type { DatosAltaMiembro } from "@features/equipo/schemas/equipo.schema"
import type { Rol } from "@features/roles/types/roles.types"

interface PersonasAltaFormProps {
  roles: Rol[]
  cargando?: boolean
  /** Entra a la aplicación: cuenta, membresía y —si atiende— su ficha de barbero. */
  onAltaConAcceso: (datos: DatosAltaMiembro) => Promise<void>
  /** No entra: solo ficha de barbero, para que se le pueda agendar. */
  onAltaSinAcceso: (datos: DatosBarbero) => Promise<void>
}

/**
 * El alta de una persona, en dos preguntas y un solo sitio.
 *
 * «¿Entra a la aplicación?» decide contra qué superficie se crea —el equipo o la
 * ficha de barbero—, y dentro del equipo «¿atiende clientes?» decide si además
 * se le abre agenda. Antes eran dos formularios en dos pantallas, y quien daba
 * de alta a un barbero con cuenta tenía que hacerlo dos veces sin que nada se lo
 * dijera.
 */
export function PersonasAltaForm({
  roles,
  cargando,
  onAltaConAcceso,
  onAltaSinAcceso,
}: PersonasAltaFormProps) {
  const [entra, setEntra] = useState(true)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-secondary/40 px-4 py-3">
        <div className="min-w-0">
          <FieldLabel htmlFor="entra" className="text-sm font-medium">
            ¿Entra a la aplicación?
          </FieldLabel>
          <p className="mt-1 text-xs text-muted-foreground">
            {entra
              ? "Tendrá cuenta, rol y contraseña para iniciar sesión."
              : "Solo su ficha: aparece en la agenda y liquida comisiones, pero no inicia sesión."}
          </p>
        </div>
        <Switch
          id="entra"
          checked={entra}
          onCheckedChange={setEntra}
          aria-label="Entra a la aplicación"
        />
      </div>

      {entra ? (
        <EquipoForm roles={roles} cargando={cargando} onSubmit={onAltaConAcceso} />
      ) : (
        <BarberosForm cargando={cargando} onSubmit={onAltaSinAcceso} />
      )}
    </div>
  )
}
