"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "motion/react"
import {
  Bell,
  CalendarDays,
  ChevronDown,
  LogOut,
  MapPin,
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
import { useFormato } from "@shared/hooks/useFormato"
import { SelectorIdioma } from "@shared/layout/SelectorIdioma"
import { useTextos } from "@shared/providers/TextosProvider"
import { getErrorMessage } from "@shared/utils/error"
import { useNotificaciones } from "@features/notificaciones/hooks/useNotificaciones"
import { useSedes } from "@features/sedes/hooks/useSedes"
import { useAuth } from "@features/auth/hooks/useAuth"
import { useAuthStore } from "@store/auth.store"
import { useSedeActual, useSedeStore } from "@store/sede.store"
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
  const t = useTextos()
  // El nombre de la sección no vive en la ruta: la ruta dice a dónde se va y con
  // qué permiso, el diccionario cómo se llama en el idioma de quien mira.
  const copiaRuta = ruta ? t.navegacion.rutas[ruta.clave] : null

  /**
   * El área de plataforma comparte chrome con el panel, pero no comparte datos:
   * el staff de Barion no pertenece a ninguna barbería, así que ni tiene sedes
   * entre las que elegir ni bandeja de avisos. Pedirlos igualmente sería un 403
   * por recarga y un menú que lleva a rutas que esa sesión no puede abrir.
   *
   * Los colores del panel quedan FUERA de esta bandera: no son dato de ninguna
   * barbería, sino la preferencia de quien mira la pantalla, guardada en este
   * navegador. El staff también pasa el día aquí dentro.
   */
  const esAdmin = pathname.startsWith("/admin")

  const sesion = useAuthStore((s) => s.sesion)
  const { handleLogoutAuth } = useAuth()
  const { relativo } = useFormato()

  const {
    notificaciones,
    noLeidas,
    fetchNotificaciones,
    handleMarcarLeidaNotificacion,
    handleMarcarTodasLeidasNotificaciones,
  } = useNotificaciones()
  useEffect(() => {
    if (esAdmin) return
    // La campana enseña las últimas, no la bandeja entera: la lista completa es
    // de su pantalla.
    void fetchNotificaciones({ limit: 10 })
  }, [fetchNotificaciones, esAdmin])

  // Transversal: la sede activa alimenta filtros de listados y timezone de
  // formateo (`useFormato`) en todo el panel, no solo aquí.
  const { sedes, fetchSedes } = useSedes()
  const setSedes = useSedeStore((s) => s.setSedes)
  const setSedeActual = useSedeStore((s) => s.setSedeActual)
  const sedeActual = useSedeActual()
  useEffect(() => {
    if (esAdmin) return
    void fetchSedes()
  }, [fetchSedes, esAdmin])
  useEffect(() => {
    setSedes(sedes)
  }, [sedes, setSedes])

  const alMarcarTodas = async () => {
    try {
      const message = await handleMarcarTodasLeidasNotificaciones()
      notify.success(message)
      void fetchNotificaciones({ limit: 10 })
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }

  const alAbrirNotificacion = async (id: string) => {
    try {
      await handleMarcarLeidaNotificacion(id)
      void fetchNotificaciones({ limit: 10 })
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }

  // La cookie la borra la API: limpiar solo el store dejaría la sesión viva en
  // el servidor y el AuthProvider volvería a meter al usuario al panel.
  const alCerrarSesion = async () => {
    const message = await handleLogoutAuth()
    notify.info(message)
    router.replace("/entrar")
  }

  // El AuthProvider no pinta el chrome sin sesión resuelta, así que aquí siempre
  // hay una. El email es el respaldo de quien todavía no tiene nombre puesto.
  const nombreUsuario = sesion?.usuario.nombre ?? sesion?.usuario.email ?? ""
  // La sesión de plataforma llega sin rol —no tiene membresía en ninguna
  // barbería—, así que se nombra por lo que es en vez de dejar el hueco vacío.
  const rolUsuario = esAdmin ? t.navbar.staffPlataforma : (sesion?.rol?.nombre ?? "")

  return (
    <motion.header
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 140, damping: 22, delay: 0.05 }}
      className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-card/50 px-4 backdrop-blur-sm md:px-6"
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 140, damping: 22, delay: 0.25 }}
        className="flex min-w-0 items-center gap-3"
      >
        <Button
          variant="outline"
          size="icon"
          onClick={alAbrirMenuMovil}
          aria-label={t.navegacion.abrirMenu}
          className="shrink-0 lg:hidden"
        >
          <Menu aria-hidden />
        </Button>
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-foreground">
            {copiaRuta?.titulo ?? "Barion"}
          </h1>
          {copiaRuta?.subtitulo && (
            <p className="truncate text-xs text-muted-foreground">{copiaRuta.subtitulo}</p>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 140, damping: 22, delay: 0.35 }}
        className="flex shrink-0 items-center gap-2"
      >
        <div className="relative hidden items-center md:flex">
          <Search
            className="pointer-events-none absolute left-3.5 h-3.5 w-3.5 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder={t.comun.buscarPlaceholder}
            aria-label={t.comun.buscar}
            className="w-56 rounded-full border-transparent bg-secondary/60 pl-9 text-xs transition-colors focus-visible:border-border focus-visible:bg-card"
          />
          <kbd
            className="pointer-events-none absolute right-3 hidden rounded border border-border bg-card px-1.5 py-0.5 font-sans text-[10px] text-muted-foreground lg:block"
            aria-hidden
          >
            ⌘K
          </kbd>
        </div>

        {!esAdmin && sedes.length > 1 && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  aria-label={t.navbar.sedeActiva(sedeActual?.nombre ?? "")}
                  className="hidden max-w-40 gap-1.5 text-xs font-medium md:inline-flex"
                >
                  <MapPin className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                  <span className="truncate">{sedeActual?.nombre}</span>
                  <ChevronDown className="size-3 shrink-0 text-muted-foreground" aria-hidden />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              {sedes.map((sede) => (
                <DropdownMenuItem key={sede.id} onClick={() => setSedeActual(sede.id)}>
                  <MapPin aria-hidden />
                  {sede.nombre}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Colores del panel — como el tema, disponible para cualquiera que use
            el panel: no hay petición que hacer ni permiso que comprobar */}
        <SelectorIdioma />
        <BrandStudio />
        <ThemeToggle />

        <div className="mx-1 hidden h-6 w-px bg-border md:block" aria-hidden />

        {/* Notificaciones — la bandeja es de quien trabaja en una barbería */}
        {!esAdmin && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={noLeidas > 0 ? t.navbar.sinLeer(noLeidas) : t.navbar.notificaciones}
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
                <span className="text-sm font-medium text-foreground">
                  {t.navbar.notificaciones}
                </span>
                {noLeidas > 0 && (
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    onClick={() => void alMarcarTodas()}
                  >
                    {t.navbar.marcarTodas}
                  </Button>
                )}
              </div>
              <DropdownMenuSeparator />
              {notificaciones.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                  {t.navbar.sinNotificaciones}
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
                      {n.titulo ?? n.tipo}
                    </span>
                    {n.detalle && (
                      <span className="block truncate text-xs text-muted-foreground">
                        {n.detalle}
                      </span>
                    )}
                    <span className="mt-0.5 block text-[10px] text-muted-foreground">
                      {relativo(n.creadaEn)}
                    </span>
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Menú de usuario */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                aria-label={t.navbar.menuUsuario(nombreUsuario, rolUsuario)}
                className="h-11 gap-2.5 rounded-full py-0 pr-3 pl-1.5"
              >
                <span className="relative shrink-0" aria-hidden>
                  <Avatar className="size-8 ring-2 ring-primary/25">
                    <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">
                      {nombreUsuario.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {/* Estado en línea */}
                  <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-card bg-(--exito)" />
                </span>
                <span className="hidden text-left md:block">
                  <span className="block max-w-32 truncate text-sm leading-tight font-semibold text-foreground">
                    {nombreUsuario}
                  </span>
                  <span className="block text-[11px] leading-tight text-muted-foreground">
                    {rolUsuario}
                  </span>
                </span>
                <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-60">
            <div className="flex items-center gap-3 px-2 py-2.5">
              <Avatar className="size-9 ring-2 ring-primary/25" aria-hidden>
                <AvatarFallback className="bg-primary text-sm font-bold text-primary-foreground">
                  {nombreUsuario.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <span className="block truncate text-sm font-semibold text-foreground">
                  {nombreUsuario}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-(--exito)" aria-hidden />
                  {rolUsuario}
                </span>
              </div>
            </div>
            <DropdownMenuSeparator />
            {/* Los atajos son del panel de una barbería: en plataforma llevarían
                a rutas que esa sesión no puede abrir. */}
            {!esAdmin && (
              <>
                <DropdownMenuItem onClick={() => router.push("/dashboard/configuracion")}>
                  <UserRound aria-hidden /> {t.navbar.miPerfil}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/dashboard/citas")}>
                  <CalendarDays aria-hidden /> {t.navbar.miAgenda}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/dashboard/configuracion")}>
                  <Settings aria-hidden /> {t.navbar.configuracion}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem variant="destructive" onClick={alCerrarSesion}>
              <LogOut aria-hidden /> {t.comun.cerrarSesion}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>
    </motion.header>
  )
}
