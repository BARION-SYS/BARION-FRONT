"use client"

import Link from "next/link"
import { CalendarCheck, ChevronLeft, LogIn } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import { ThemeToggle } from "@shared/layout/ThemeToggle"
import { cn } from "@shared/utils/cn"
import { inicialesDe } from "@features/portal/utils/formato"
import { useTextos } from "@shared/textos/useTextos"

interface PortalCabeceraNavProps {
  nombre: string
  /** Ya resuelto por la api en la zona de la SEDE: aquí no se calcula nada. */
  abiertoAhora: boolean
  horarioHoy: string
  hrefCitas?: string
  hrefVolver?: string
  /**
   * Quién está delante. `undefined` = **todavía no se sabe**, y entonces no se
   * pinta nada: etiquetar de invitado a quien tiene sesión —o al revés— por
   * medio segundo es peor que esperar a saberlo.
   */
  acceso?: "invitado" | "cliente"
}

/**
 * Barra superior del portal público — la misma al reservar y en «Mis citas».
 *
 * **Ya no hay «Crear perfil»**: el registro es el propio código de verificación, y
 * un botón aparte llevaría a un formulario que no existe.
 *
 * La puerta del cliente y su área son **el mismo sitio** (`/b/{slug}/mis-citas`):
 * quien llega sin sesión encuentra allí el correo y el código, y quien la tiene
 * ve sus citas. Por eso el botón cambia de nombre y no de destino — y por eso no
 * hay ninguna pantalla que pregunte «¿ya eres cliente?»: preguntarlo con el
 * correo delante convertiría la portada en un oráculo de quién es cliente de esta
 * barbería.
 */
export function PortalCabeceraNav({
  nombre,
  abiertoAhora,
  horarioHoy,
  hrefCitas,
  hrefVolver,
  acceso,
}: PortalCabeceraNavProps) {
  const t = useTextos("portal.cabecera")
  return (
    <header className="sticky top-0 z-20 shrink-0 border-b border-border bg-card/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
        {hrefVolver && (
          <Button
            render={<Link href={hrefVolver} />}
            variant="ghost"
            size="icon"
            aria-label={t("volver")}
          >
            <ChevronLeft aria-hidden />
          </Button>
        )}

        <InitialsAvatar iniciales={inicialesDe(nombre)} tamano="sm" />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{nombre}</p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className={cn(
                "h-1.5 w-1.5 shrink-0 rounded-full",
                abiertoAhora ? "bg-(--exito)" : "bg-muted-foreground"
              )}
              aria-hidden
            />
            <span className="truncate">
              {abiertoAhora ? t("abierto", { horario: horarioHoy }) : t("cerrado")}
            </span>
          </p>
        </div>

        <ThemeToggle />

        {hrefCitas && acceso && (
          <Button
            render={<Link href={hrefCitas} />}
            variant="outline"
            className="h-9 gap-1.5 px-2 sm:px-3"
          >
            {acceso === "cliente" ? <CalendarCheck aria-hidden /> : <LogIn aria-hidden />}
            <span className="hidden text-xs font-semibold sm:inline">
              {acceso === "cliente" ? t("misCitas") : t("entrar")}
            </span>
            <span className="sr-only sm:hidden">
              {acceso === "cliente" ? t("misCitas") : t("entrar")}
            </span>
          </Button>
        )}
      </div>
    </header>
  )
}
