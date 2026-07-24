"use client"

import Link from "next/link"
import { CalendarCheck, ChevronLeft, UserPlus } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import { ThemeToggle } from "@shared/layout/ThemeToggle"
import { cn } from "@shared/utils/cn"

interface PortalCabeceraNavProps {
  nombre: string
  iniciales: string
  abiertoAhora: boolean
  horarioHoy: string
  hrefRegistro?: string
  hrefCitas?: string
  hrefVolver?: string
}

// Barra superior del portal público — misma en reservar, registro y "Mis citas".
export function PortalCabeceraNav({
  nombre,
  iniciales,
  abiertoAhora,
  horarioHoy,
  hrefRegistro,
  hrefCitas,
  hrefVolver,
}: PortalCabeceraNavProps) {
  return (
    <header className="sticky top-0 z-20 shrink-0 border-b border-border bg-card/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
        {hrefVolver && (
          <Button
            render={<Link href={hrefVolver} />}
            nativeButton={false}
            variant="ghost"
            size="icon"
            aria-label="Volver al portal"
          >
            <ChevronLeft aria-hidden />
          </Button>
        )}

        <InitialsAvatar iniciales={iniciales} tamano="sm" />

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
              {abiertoAhora ? `Abierto · ${horarioHoy}` : "Cerrado ahora"}
            </span>
          </p>
        </div>

        <ThemeToggle />

        {hrefRegistro && (
          <Button
            render={<Link href={hrefRegistro} />}
            nativeButton={false}
            variant="ghost"
            className="h-9 gap-1.5 px-2 sm:px-3"
          >
            <UserPlus aria-hidden />
            <span className="hidden text-xs font-semibold sm:inline">Crear perfil</span>
            <span className="sr-only sm:hidden">Crear perfil</span>
          </Button>
        )}

        {hrefCitas && (
          <Button
            render={<Link href={hrefCitas} />}
            nativeButton={false}
            variant="outline"
            className="h-9 gap-1.5 px-2 sm:px-3"
          >
            <CalendarCheck aria-hidden />
            <span className="hidden text-xs font-semibold sm:inline">Mis citas</span>
            <span className="sr-only sm:hidden">Mis citas</span>
          </Button>
        )}
      </div>
    </header>
  )
}
