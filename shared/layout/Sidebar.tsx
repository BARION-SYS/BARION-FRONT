"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { ChevronLeft, ChevronRight, LogOut, Store, X } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { InfoTooltip } from "@shared/components/tooltips/InfoTooltip"
import { notify } from "@shared/services/notify"
import { useAuthStore } from "@store/auth.store"
import { rutasDashboard, esRutaActiva, seccionesSidebar } from "@routes/rutasDashboard"
import { cn } from "@shared/utils/cn"

interface SidebarProps {
  colapsada: boolean
  alAlternarColapso: () => void
  abiertaEnMovil: boolean
  alCerrarMovil: () => void
}

export function Sidebar({
  colapsada,
  alAlternarColapso,
  abiertaEnMovil,
  alCerrarMovil,
}: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const cerrarSesion = useAuthStore((s) => s.cerrarSesion)

  // Logo según el tema activo — una sola imagen, vía la instancia de next-themes.
  const { resolvedTheme } = useTheme()
  const [montado, setMontado] = useState(false)
  useEffect(() => setMontado(true), [])
  const logoSrc =
    montado && resolvedTheme === "light" ? "/barion-logo-claro.webp" : "/barion-logo-oscuro.webp"

  const alCerrarSesion = () => {
    cerrarSesion()
    notify.info("Sesión cerrada")
    router.push("/")
  }

  // Cierra el drawer móvil al navegar
  useEffect(() => {
    alCerrarMovil()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <>
      {abiertaEnMovil && (
        <button
          aria-label="Cerrar menú"
          onClick={alCerrarMovil}
          className="fixed inset-0 z-40 cursor-pointer bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card transition-transform duration-300 ease-out motion-reduce:transition-none",
          "w-64 lg:static lg:translate-x-0 lg:transition-[width]",
          abiertaEnMovil ? "translate-x-0" : "-translate-x-full",
          colapsada ? "lg:w-16" : "lg:w-60"
        )}
        aria-label="Navegación principal"
      >
        {/* Marca */}
        <div
          className={cn(
            "flex items-center gap-3 px-4 py-4",
            colapsada && "lg:justify-center lg:px-0"
          )}
        >
          {/* Logo completo (ícono + nombre); colapsado queda solo el ícono */}
          <Image
            src={logoSrc}
            alt="Barion"
            width={200}
            height={56}
            className={cn("h-14 w-auto shrink-0 object-contain", colapsada && "lg:hidden")}
          />
          <Image
            src="/barion-icono-claro.webp"
            alt="Barion"
            width={48}
            height={48}
            className={cn("hidden h-12 w-12 shrink-0 object-contain", colapsada && "lg:block")}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={alCerrarMovil}
            aria-label="Cerrar menú"
            className="ml-auto lg:hidden"
          >
            <X aria-hidden />
          </Button>
        </div>

        {/* Tenant */}
        <div className={cn("px-3 pb-3", colapsada && "lg:hidden")}>
          <div className="flex items-center gap-2.5 rounded-xl border border-border bg-secondary/50 px-3 py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card">
              <Store className="h-3.5 w-3.5 text-primary" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs leading-none font-semibold text-foreground">
                Barbería El Rey
              </p>
              <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-(--exito)" aria-hidden />
                Abierta · Plan Premium
              </p>
            </div>
          </div>
        </div>

        {/* Navegación agrupada por sección — desde routes/rutasDashboard.ts */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-2 pb-4" aria-label="Secciones">
          {seccionesSidebar.map((seccion) => {
            const rutas = rutasDashboard.filter((r) => r.seccion === seccion.id)
            if (rutas.length === 0) return null
            return (
              <div key={seccion.id} role="group" aria-label={seccion.etiqueta}>
                <p
                  className={cn(
                    "px-3 pt-4 pb-1.5 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground/80 uppercase",
                    colapsada && "lg:hidden"
                  )}
                >
                  {seccion.etiqueta}
                </p>
                {/* Colapsada: separador sutil entre grupos en vez del rótulo */}
                <div
                  className={cn(
                    "hidden",
                    colapsada && "lg:mx-3 lg:my-3 lg:block lg:h-px lg:bg-border first:lg:hidden"
                  )}
                  aria-hidden
                />
                <div className="space-y-0.5">
                  {rutas.map((ruta) => {
                    const activa = esRutaActiva(ruta, pathname)
                    return (
                      <InfoTooltip
                        key={ruta.clave}
                        contenido={ruta.etiqueta}
                        side="right"
                        sideOffset={8}
                        activo={colapsada}
                      >
                        <Link
                          href={ruta.href}
                          aria-current={activa ? "page" : undefined}
                          className={cn(
                            "group relative flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm transition-colors duration-150 motion-reduce:transition-none",
                            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                            colapsada && "lg:min-h-11 lg:justify-center lg:px-0",
                            activa
                              ? "bg-primary/10 font-medium text-primary"
                              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                          )}
                        >
                          {/* Indicador de sección activa */}
                          <span
                            className={cn(
                              "absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary transition-opacity",
                              activa ? "opacity-100" : "opacity-0",
                              colapsada && "lg:hidden"
                            )}
                            aria-hidden
                          />
                          <ruta.icono
                            className={cn(
                              "h-4 w-4 shrink-0 transition-colors",
                              colapsada && "lg:h-5 lg:w-5",
                              activa
                                ? "text-primary"
                                : "text-muted-foreground group-hover:text-foreground"
                            )}
                            aria-hidden
                          />
                          <span className={cn(colapsada && "lg:hidden")}>{ruta.etiqueta}</span>
                        </Link>
                      </InfoTooltip>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>

        {/* Cerrar sesión */}
        <div className={cn("border-t border-border p-3", colapsada && "lg:px-1")}>
          <InfoTooltip contenido="Cerrar sesión" side="right" sideOffset={8} activo={colapsada}>
            <Button
              variant="ghost"
              onClick={alCerrarSesion}
              className={cn(
                "w-full justify-start gap-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
                colapsada && "lg:justify-center lg:px-0"
              )}
            >
              <LogOut aria-hidden />
              <span className={cn(colapsada && "lg:hidden")}>Cerrar sesión</span>
            </Button>
          </InfoTooltip>
        </div>

        {/* Colapso — solo desktop */}
        <Button
          variant="outline"
          size="icon"
          onClick={alAlternarColapso}
          aria-label={colapsada ? "Expandir barra lateral" : "Colapsar barra lateral"}
          className="absolute top-20 -right-3 z-10 hidden size-6 rounded-full lg:flex"
        >
          {colapsada ? <ChevronRight aria-hidden /> : <ChevronLeft aria-hidden />}
        </Button>
      </aside>
    </>
  )
}
