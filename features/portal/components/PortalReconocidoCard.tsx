"use client"

import Link from "next/link"
import { CalendarCheck, ShieldCheck, ShieldAlert } from "lucide-react"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import { Button } from "@shared/components/ui/button"
import { inicialesDe } from "@features/portal/utils/formato"

interface PortalReconocidoCardProps {
  nombre: string
  /** `false` = hay sesión pero el canal no está probado: al reservar pedirá código. */
  verificado: boolean
  hrefCitas: string
  onNoSoyYo: () => void
}

/**
 * «Ya te conocemos», y se dice al ENTRAR, no en el paso 4.
 *
 * Quien vuelve necesita saber tres cosas antes de invertir cuatro pasos: que no le
 * van a volver a pedir sus datos, dónde están sus citas, y cómo salir si este no es
 * su dispositivo —el móvil de un amigo es un caso normal en una barbería—.
 * Enterarse de todo eso al final es exactamente lo que hace que un flujo se sienta
 * un trámite.
 *
 * Presentacional puro: la sesión la cierra el padre, que es quien tiene la mutación.
 */
export function PortalReconocidoCard({
  nombre,
  verificado,
  hrefCitas,
  onNoSoyYo,
}: PortalReconocidoCardProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4">
      <InitialsAvatar iniciales={inicialesDe(nombre)} tamano="md" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">Hola, {nombre}</p>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {verificado ? (
            <>
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-(--exito)" aria-hidden />
              No tendrás que volver a dejar tus datos
            </>
          ) : (
            <>
              <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-(--advertencia)" aria-hidden />
              Te pediremos un código al confirmar, para verificar tu correo
            </>
          )}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button variant="outline" className="min-h-11" render={<Link href={hrefCitas} />}>
          <CalendarCheck aria-hidden />
          Mis citas
        </Button>
        <Button variant="ghost" className="min-h-11" onClick={onNoSoyYo}>
          No soy yo
        </Button>
      </div>
    </div>
  )
}
