"use client"

import { useState } from "react"
import { Check, Copy, TriangleAlert } from "lucide-react"
import { Button } from "@shared/components/ui/button"

interface EquipoCredencialProps {
  nombre: string
  /** `null` cuando esa persona ya tenía cuenta: entra con la suya. */
  contrasena: string | null
  cuentaExistente: boolean
  onCerrar: () => void
}

/**
 * La contraseña inicial, mostrada UNA vez.
 *
 * No es un detalle de estilo: la api la guarda hasheada y no existe ningún
 * endpoint que la devuelva. Si esta pantalla se cierra sin que nadie la copie,
 * la única salida es regenerarla — así que el aviso va antes que el valor y el
 * botón de cerrar es lo último.
 */
export function EquipoCredencial({
  nombre,
  contrasena,
  cuentaExistente,
  onCerrar,
}: EquipoCredencialProps) {
  const [copiada, setCopiada] = useState(false)

  const copiar = async () => {
    if (!contrasena) return
    await navigator.clipboard.writeText(contrasena)
    setCopiada(true)
    window.setTimeout(() => setCopiada(false), 2000)
  }

  if (cuentaExistente || !contrasena) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{nombre}</span> ya tenía cuenta en Barion,
          así que entrará con su propia contraseña. Aquí no se puede cambiar: es suya, y la usa
          también donde trabaje además de aquí.
        </p>
        <Button onClick={onCerrar} className="h-10">
          Entendido
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <p
        role="alert"
        className="flex items-start gap-2 rounded-lg bg-[color-mix(in_srgb,var(--advertencia)_12%,transparent)] px-3 py-2.5 text-sm text-(--advertencia)"
      >
        <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
        Esta es la única vez que se muestra. Cópiala o dictásela ahora; si se pierde, hay que
        regenerarla.
      </p>

      <div className="flex flex-col gap-2">
        <span className="text-sm text-muted-foreground">
          Contraseña de <span className="font-medium text-foreground">{nombre}</span>
        </span>
        <div className="flex items-center gap-2">
          <code className="flex-1 truncate rounded-lg border border-border bg-secondary px-3 py-2.5 font-mono text-base tracking-wide tabular-nums">
            {contrasena}
          </code>
          <Button
            type="button"
            variant="outline"
            onClick={() => void copiar()}
            aria-label="Copiar la contraseña"
            className="size-11 shrink-0"
          >
            {copiada ? (
              <Check className="size-4 text-(--exito)" aria-hidden />
            ) : (
              <Copy className="size-4" aria-hidden />
            )}
          </Button>
        </div>
        {/* El estado de la copia también se anuncia: el icono solo no lo dice. */}
        <span aria-live="polite" className="text-xs text-muted-foreground">
          {copiada ? "Copiada al portapapeles" : "Tendrá que cambiarla la primera vez que entre."}
        </span>
      </div>

      <Button onClick={onCerrar} className="h-10">
        Ya la guardé
      </Button>
    </div>
  )
}
