"use client"

import { useState } from "react"
import { Check, Copy, MailCheck, Send, TriangleAlert } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { useTextos } from "@shared/textos/useTextos"

interface EquipoCredencialProps {
  nombre: string
  /** `null` cuando esa persona ya tenía cuenta: entra con la suya. */
  contrasena: string | null
  cuentaExistente: boolean
  /** Se le mandó el enlace para que ponga su contraseña. */
  invitado?: boolean
  /** A dónde fue la invitación. Se enseña para poder cazar una errata. */
  email?: string
  reenviando?: boolean
  onReenviar?: () => void
  onCerrar: () => void
}

/**
 * Cómo entra quien acaba de recibir acceso. Tres finales distintos:
 *
 * 1. **Invitado** — el caso normal. Se le mandó un enlace para que ponga su
 *    contraseña, así que aquí no hay nada que copiar ni que dictar. Se enseña la
 *    dirección a la que fue, que es donde se caza una errata, y se ofrece
 *    reenviarla.
 * 2. **Ya tenía cuenta** — entra con la suya, que nadie de esta barbería puede
 *    cambiar.
 * 3. **Contraseña puesta a mano** — quien administra la escribió, así que se
 *    enseña UNA vez. La api la guarda hasheada y no hay endpoint que la
 *    devuelva: si esta pantalla se cierra sin copiarla, la única salida es
 *    regenerarla, y por eso el aviso va antes que el valor.
 */
export function EquipoCredencial({
  nombre,
  contrasena,
  cuentaExistente,
  invitado,
  email,
  reenviando,
  onReenviar,
  onCerrar,
}: EquipoCredencialProps) {
  const t = useTextos("equipo")
  const [copiada, setCopiada] = useState(false)

  const copiar = async () => {
    if (!contrasena) return
    await navigator.clipboard.writeText(contrasena)
    setCopiada(true)
    window.setTimeout(() => setCopiada(false), 2000)
  }

  // El camino normal desde que el alta invita: no hay ninguna contraseña que
  // enseñar porque nadie la conoce — la pone quien entra, desde su enlace.
  if (invitado) {
    return (
      <div className="flex flex-col gap-4">
        <p className="flex items-start gap-2 rounded-lg bg-[color-mix(in_srgb,var(--exito)_12%,transparent)] px-3 py-2.5 text-sm text-(--exito)">
          <MailCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
          Le mandamos a <span className="font-medium">{email}</span> un enlace para que cree su
          contraseña.
        </p>

        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{nombre}</span> ya puede entrar en cuanto lo
          abra. Tú no tienes que dictarle nada: nadie más ve esa contraseña, ni siquiera nosotros.
        </p>

        {/* Reenviar aquí y no solo en la ficha: si el correo se tecleó mal, el
            momento de darse cuenta es este, leyéndolo en pantalla. */}
        <div className="flex flex-wrap gap-2">
          {onReenviar && (
            <Button
              type="button"
              variant="outline"
              className="h-11 sm:h-10"
              disabled={reenviando}
              onClick={onReenviar}
            >
              <Send className="size-4" aria-hidden />
              Reenviar invitación
            </Button>
          )}
          <Button onClick={onCerrar} className="h-11 flex-1 sm:h-10">
            Entendido
          </Button>
        </div>
      </div>
    )
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
            aria-label={t("copiarContrasena")}
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
          {copiada ? t("contrasenaCopiada") : t("contrasenaAviso")}
        </span>
      </div>

      <Button onClick={onCerrar} className="h-10">
        Ya la guardé
      </Button>
    </div>
  )
}
