"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  Bell,
  CalendarDays,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  Settings,
  UserRound,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@shared/components/ui/avatar"
import { Button } from "@shared/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/components/ui/dropdown-menu"
import { Input } from "@shared/components/ui/input"
import { BrandStudio } from "@shared/layout/BrandStudio"
import { ThemeToggle } from "@shared/layout/ThemeToggle"
import { notify } from "@shared/services/notify"
import { getErrorMessage } from "@shared/utils/error"
import { useNotificaciones } from "@features/notificaciones/hooks/useNotificaciones"
import { useAuthStore } from "@store/auth.store"
import { obtenerRutaActiva } from "@routes/rutasDashboard"
import { cn } from "@shared/utils/cn"

interface NavbarProps {
  alAbrirMenuMovil: () => void
}

// Título/subtítulo desde routes; notificaciones y menú de usuario funcionales.
export function Navbar({ alAbrirMenuMovil }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const ruta = obtenerRutaActiva(pathname)

  const sesion = useAuthStore((s) => s.sesion)
  const cerrarSesion = useAuthStore((s) => s.cerrarSesion)
  const [montado, setMontado] = useState(false)
  useEffect(() => setMontado(true), [])

  const { notificaciones, fetchNotificaciones, handleMarcarLeida, handleMarcarTodasLeidas } =
    useNotificaciones()
  useEffect(() => {
    void fetchNotificaciones()
  }, [fetchNotificaciones])

  const noLeidas = notificaciones.filter((n) => !n.leida).length

  const alMarcarTodas = async () => {
    try {
      const message = await handleMarcarTodasLeidas()
      notify.success(message)
      void fetchNotificaciones()
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }

  const alAbrirNotificacion = async (id: number) => {
    try {
      await handleMarcarLeida(id)
      void fetchNotificaciones()
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }

  const alCerrarSesion = () => {
    cerrarSesion()
    notify.info("Sesión cerrada")
    router.push("/")
  }

  // Evita mismatch de hidratación: el store persistido solo se lee tras montar.
  const nombreUsuario = montado && sesion ? sesion.usuario.nombre : "Admin"
  const rolUsuario = montado && sesion ? sesion.usuario.rol : "Propietario"

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-card/50 px-4 backdrop-blur-sm md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={alAbrirMenuMovil}
          aria-label="Abrir menú"
          className="shrink-0 lg:hidden"
        >
          <Menu aria-hidden />
        </Button>
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-foreground">
            {ruta?.titulo ?? "Trimly"}
          </h1>
          {ruta?.subtitulo && (
            <p className="truncate text-xs text-muted-foreground">{ruta.subtitulo}</p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <div className="relative hidden items-center md:flex">
          <Search
            className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Buscar..."
            aria-label="Buscar"
            className="w-52 pl-9 text-xs"
          />
        </div>

        <BrandStudio />
        <ThemeToggle />

        {/* Notificaciones */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                size="icon"
                aria-label={
                  noLeidas > 0 ? `Notificaciones, ${noLeidas} sin leer` : "Notificaciones"
                }
                className="relative"
              >
                <Bell aria-hidden />
                {noLeidas > 0 && (
                  <span
                    className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-0.5 text-[10px] font-bold text-primary-foreground"
                    aria-hidden
                  >
                    {noLeidas}
                  </span>
                )}
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-sm font-medium text-foreground">Notificaciones</span>
              {noLeidas > 0 && (
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={() => void alMarcarTodas()}
                >
                  Marcar todas como leídas
                </Button>
              )}
            </div>
            <DropdownMenuSeparator />
            {notificaciones.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                Sin notificaciones
              </p>
            )}
            {notificaciones.map((n) => (
              <DropdownMenuItem
                key={n.id}
                onClick={() => void alAbrirNotificacion(n.id)}
                className="items-start gap-2 py-2"
              >
                <span
                  className={cn(
                    "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                    n.leida ? "bg-border" : "bg-primary"
                  )}
                  aria-hidden
                />
                <span className="min-w-0">
                  <span className={cn("block truncate text-sm", !n.leida && "font-semibold")}>
                    {n.titulo}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">{n.detalle}</span>
                  <span className="mt-0.5 block text-[10px] text-muted-foreground">{n.hace}</span>
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Menú de usuario */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                aria-label={`Menú de usuario: ${nombreUsuario}, ${rolUsuario}`}
                className="gap-2 pl-2"
              >
                <Avatar className="size-6" aria-hidden>
                  <AvatarFallback className="bg-primary text-[10px] font-bold text-primary-foreground">
                    {nombreUsuario.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-left md:block">
                  <span className="block text-xs leading-none font-medium text-foreground">
                    {nombreUsuario}
                  </span>
                  <span className="mt-0.5 block text-[10px] text-muted-foreground">
                    {rolUsuario}
                  </span>
                </span>
                <ChevronDown className="text-muted-foreground" aria-hidden />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-52">
            <div className="px-2 py-1.5">
              <span className="block text-sm font-medium text-foreground">{nombreUsuario}</span>
              <span className="block text-xs text-muted-foreground">{rolUsuario}</span>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/dashboard/configuracion")}>
              <UserRound aria-hidden /> Mi perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/dashboard/citas")}>
              <CalendarDays aria-hidden /> Mi agenda
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/dashboard/configuracion")}>
              <Settings aria-hidden /> Configuración
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={alCerrarSesion}>
              <LogOut aria-hidden /> Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
