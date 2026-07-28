"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { AnimatePresence, motion, type Variants } from "motion/react"
import { ChevronLeft, LogOut, Store, X } from "lucide-react"
import { LogoBarion } from "@shared/components/brand/LogoBarion"
import { Button } from "@shared/components/ui/button"
import { InfoTooltip } from "@shared/components/tooltips/InfoTooltip"
import { notify } from "@shared/services/notify"
import { useAuth } from "@features/auth/hooks/useAuth"
import { esRutaActiva, rutasDe, rutasVisibles, seccionesDe } from "@routes/rutasDashboard"
import { useAuthStore } from "@store/auth.store"
import { cn } from "@shared/utils/cn"

// Entrada del chrome: cascada pausada desde la izquierda, con resorte suave.
// Solo anima contenido interno — el transform del <aside> pertenece al drawer móvil.
const contenedorNav: Variants = {
  oculto: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.35 } },
}

const itemNav: Variants = {
  oculto: { opacity: 0, x: -28 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 140, damping: 22 } },
}

// Etiquetas que se pliegan con el colapso (ancho + opacidad, no display)
const claseEtiqueta = (colapsada: boolean) =>
  cn(
    "overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-300",
    colapsada ? "lg:max-w-0 lg:opacity-0" : "max-w-40 opacity-100"
  )

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
  const barberia = useAuthStore((s) => s.sesion?.barberia)
  const permisos = useAuthStore((s) => s.sesion?.permisos)
  // El menú se CONSTRUYE con lo que la sesión puede hacer, no es una lista fija.
  // Sin sesión resuelta todavía no se pinta ninguna entrada: enseñarlas todas
  // durante un instante y quitarlas después es peor que esperar.
  const rutasDelArea = rutasVisibles(rutasDe(pathname), permisos ?? [])
  const router = useRouter()
  const { handleLogoutAuth } = useAuth()

  // La cookie la borra la API: limpiar solo el store dejaría la sesión viva en
  // el servidor y el AuthProvider volvería a meter al usuario al panel.
  const alCerrarSesion = async () => {
    const message = await handleLogoutAuth()
    notify.info(message)
    router.replace("/")
  }

  // Cierra el drawer móvil al navegar
  useEffect(() => {
    alCerrarMovil()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <>
      <AnimatePresence>
        {abiertaEnMovil && (
          <motion.button
            aria-label="Cerrar menú"
            onClick={alCerrarMovil}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 cursor-pointer bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card",
          "transition-transform duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
          "w-64 lg:static lg:translate-x-0 lg:transition-[width] lg:duration-500 lg:ease-[cubic-bezier(0.16,1,0.3,1)]",
          abiertaEnMovil ? "translate-x-0" : "-translate-x-full",
          colapsada ? "lg:w-16" : "lg:w-60"
        )}
        aria-label="Navegación principal"
      >
        {/* Marca */}
        <motion.div
          initial={{ opacity: 0, x: -28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 140, damping: 22, delay: 0.1 }}
          className={cn(
            "relative flex items-center gap-3 overflow-hidden px-4 py-4",
            colapsada && "lg:px-0"
          )}
        >
          {/* Logo completo ↔ ícono: crossfade durante el cambio de ancho, sin saltos */}
          <LogoBarion
            priority
            className={cn(
              "h-12 shrink-0 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
              colapsada && "lg:scale-90 lg:opacity-0"
            )}
          />
          <LogoBarion
            variante="icono"
            priority
            className={cn(
              "absolute left-1/2 hidden h-11 -translate-x-1/2 transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:block",
              colapsada ? "lg:opacity-100 lg:delay-150" : "lg:opacity-0"
            )}
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
        </motion.div>

        {/* Cinta de barbero — sello de marca bajo el logo */}
        <motion.div
          className="cinta-barberia h-0.5 shrink-0 origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          aria-hidden
        />

        {/* Tenant. El staff de Barion no tiene barbería: se omite en vez de
            pintar un hueco con datos de nadie. */}
        {barberia && (
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 140, damping: 22, delay: 0.22 }}
            className={cn(
              "overflow-hidden px-3 transition-[max-height,opacity,padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
              colapsada ? "lg:max-h-0 lg:py-0 lg:opacity-0" : "max-h-24 py-3 opacity-100"
            )}
          >
            <div className="flex items-center gap-2.5 rounded-xl border border-border bg-secondary/50 px-3 py-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                <Store className="h-3.5 w-3.5 text-primary" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs leading-none font-semibold text-foreground">
                  {barberia.nombreComercial}
                </p>
                <p className="mt-1 truncate text-[10px] text-muted-foreground">/{barberia.slug}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navegación agrupada por sección — desde routes/rutasDashboard.ts */}
        <motion.nav
          className="scroll-fino flex-1 space-y-1 overflow-x-hidden overflow-y-auto px-2 pb-4"
          aria-label="Secciones"
          variants={contenedorNav}
          initial="oculto"
          animate="visible"
        >
          {seccionesDe(pathname).map((seccion) => {
            const rutas = rutasDelArea.filter((r) => r.seccion === seccion.id)
            if (rutas.length === 0) return null
            return (
              <motion.div
                key={seccion.id}
                role="group"
                aria-label={seccion.etiqueta}
                variants={itemNav}
              >
                <p
                  className={cn(
                    "overflow-hidden px-3 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground/80 uppercase",
                    "transition-[max-height,opacity,padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    colapsada
                      ? "lg:max-h-0 lg:py-0 lg:opacity-0"
                      : "max-h-8 pt-4 pb-1.5 opacity-100"
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
                            "group relative flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm transition-all duration-300 motion-reduce:transition-none",
                            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                            colapsada && "lg:min-h-11 lg:gap-0 lg:px-3.5",
                            activa
                              ? "bg-primary/10 font-medium text-primary"
                              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                          )}
                        >
                          {/* Indicador de sección activa — se desliza entre rutas */}
                          {activa && (
                            <motion.span
                              layoutId="indicador-nav-activo"
                              transition={{ type: "spring", stiffness: 350, damping: 30 }}
                              className={cn(
                                "absolute top-[calc(50%-10px)] left-0 h-5 w-0.5 rounded-full bg-primary",
                                colapsada && "lg:hidden"
                              )}
                              aria-hidden
                            />
                          )}
                          <ruta.icono
                            className={cn(
                              "h-4 w-4 shrink-0 transition-all duration-300",
                              colapsada && "lg:h-5 lg:w-5",
                              activa
                                ? "text-primary"
                                : "text-muted-foreground group-hover:text-foreground"
                            )}
                            aria-hidden
                          />
                          <span className={claseEtiqueta(colapsada)}>{ruta.etiqueta}</span>
                        </Link>
                      </InfoTooltip>
                    )
                  })}
                </div>
              </motion.div>
            )
          })}
        </motion.nav>

        {/* Cerrar sesión */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 140, damping: 22, delay: 0.75 }}
          className="border-t border-border p-3"
        >
          <InfoTooltip contenido="Cerrar sesión" side="right" sideOffset={8} activo={colapsada}>
            <Button
              variant="ghost"
              onClick={alCerrarSesion}
              className={cn(
                "w-full justify-start gap-3 text-muted-foreground transition-all duration-300 hover:bg-destructive/10 hover:text-destructive",
                colapsada && "lg:gap-0 lg:px-2.5"
              )}
            >
              <LogOut aria-hidden />
              <span className={claseEtiqueta(colapsada)}>Cerrar sesión</span>
            </Button>
          </InfoTooltip>
        </motion.div>

        {/* Colapso — solo desktop; el chevron gira con el estado */}
        <Button
          variant="outline"
          size="icon"
          onClick={alAlternarColapso}
          aria-label={colapsada ? "Expandir barra lateral" : "Colapsar barra lateral"}
          className="absolute top-20 -right-3 z-10 hidden size-6 rounded-full shadow-sm lg:flex"
        >
          <ChevronLeft
            className={cn(
              "transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
              colapsada && "rotate-180"
            )}
            aria-hidden
          />
        </Button>
      </aside>
    </>
  )
}
