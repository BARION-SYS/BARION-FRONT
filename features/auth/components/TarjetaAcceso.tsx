"use client"

import { motion, type Variants } from "motion/react"
import type { LucideIcon } from "lucide-react"
import { LogoBarion } from "@shared/components/brand/LogoBarion"
import { cn } from "@shared/utils/cn"

/*
  El mismo lenguaje de movimiento que la tarjeta del login: entra desde abajo con
  un escalonado visible —es lo primero que se ve de la pantalla— y sale en menos
  de la mitad de tiempo, porque la salida es la que retrasa lo siguiente.
*/
const tarjeta: Variants = {
  oculto: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 170,
      damping: 21,
      staggerChildren: 0.07,
      delayChildren: 0.09,
    },
  },
  salida: {
    opacity: 0,
    y: -28,
    scale: 0.98,
    transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] },
  },
}

/** Cada bloque de dentro entra con resorte. Los hijos lo usan con `variants`. */
export const bloqueAcceso: Variants = {
  oculto: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 240, damping: 24 } },
}

// Las líneas se dibujan desde un punto: se leen como el corte del papel.
const linea: Variants = {
  oculto: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] } },
}

// Desde 0.4 y no desde cero: una escala que nace en 0 se lee como un parpadeo.
const perforacion: Variants = {
  oculto: { scale: 0.4, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 420, damping: 20 } },
}

/** El color del icono de la cabecera: dice de un vistazo qué clase de paso es. */
const TONOS = {
  primario: "bg-primary/12 text-primary",
  exito: "bg-[color-mix(in_srgb,var(--exito)_14%,transparent)] text-(--exito)",
  advertencia: "bg-[color-mix(in_srgb,var(--advertencia)_14%,transparent)] text-(--advertencia)",
} as const

interface TarjetaAccesoProps {
  /** Rótulo corto a la derecha del logo: en qué paso del acceso se está. */
  insignia: string
  icono: LucideIcon
  tono?: keyof typeof TONOS
  titulo: string
  descripcion: React.ReactNode
  children?: React.ReactNode
  /** Lo que va en el talón del ticket, bajo la perforación: la salida de la pantalla. */
  pie?: React.ReactNode
  className?: string
}

/**
 * La tarjeta de las pantallas de acceso que no son el login: el mismo ticket de
 * turno —cinta de barbero arriba, talón cortado abajo— con la cabecera ya
 * resuelta.
 *
 * El `h1` es el título del paso y no un subtítulo: por debajo de `lg` el panel
 * de marca no se pinta y esta es la única cabecera de la pantalla.
 */
export function TarjetaAcceso({
  insignia,
  icono: Icono,
  tono = "primario",
  titulo,
  descripcion,
  children,
  pie,
  className,
}: TarjetaAccesoProps) {
  return (
    <motion.div
      className={cn(
        "acceso-tarjeta w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card/85 shadow-xl backdrop-blur-xl",
        className
      )}
      variants={tarjeta}
      initial="oculto"
      animate="visible"
      exit="salida"
    >
      <motion.div
        className="cinta-barberia h-1.5 w-full origin-left"
        initial={{ scaleX: 0 }}
        animate={{
          scaleX: 1,
          transition: { duration: 0.65, ease: [0.23, 1, 0.32, 1], delay: 0.2 },
        }}
        aria-hidden
      />

      <div
        className={cn(
          "px-(--acceso-borde) pt-(--acceso-borde)",
          // Con talón, el aire de abajo lo pone la separación entre bloques y no
          // el borde de la tarjeta: sumar los dos dejaba un hueco muerto entre
          // el último botón y la línea de corte, y el talón se leía suelto.
          pie ? "pb-(--acceso-salto)" : "pb-(--acceso-borde)"
        )}
      >
        <motion.div variants={bloqueAcceso}>
          <div className="flex items-center justify-between gap-3">
            <LogoBarion variante="icono" priority className="h-(--acceso-logo)" />
            <span className="rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-xs font-medium tracking-widest text-muted-foreground uppercase">
              {insignia}
            </span>
          </div>

          {/*
            El icono acompaña al TÍTULO y la descripción va debajo a ancho
            completo. Con los tres en la misma columna sangrada, la descripción
            se partía en tres líneas cortas contra un borde derecho vacío,
            justo encima de un campo que sí ocupa toda la tarjeta: la línea de
            texto y la del formulario no empezaban ni acababan en el mismo
            sitio, y eso es lo que hacía que la tarjeta se viera descuadrada.
          */}
          <div className="mt-(--acceso-salto) flex items-center gap-3.5">
            <motion.span
              variants={perforacion}
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-xl",
                TONOS[tono]
              )}
              aria-hidden
            >
              <Icono className="size-5" />
            </motion.span>
            <h1 className="min-w-0 text-2xl font-bold text-balance text-foreground sm:text-[1.75rem] sm:leading-tight">
              {titulo}
            </h1>
          </div>
          <p className="mt-3 text-sm text-pretty text-muted-foreground">{descripcion}</p>
        </motion.div>

        {children}
      </div>

      {/*
        El talón del ticket. Antes llevaba dos círculos absolutos en los bordes
        para fingir la perforación, y la tarjeta recorta lo que sobresale
        (`overflow-hidden`): lo que se veía no eran dos agujeros sino dos medias
        lunas pegadas al borde, que se leen como un fallo de render y no como un
        ticket. La línea de corte sola —punteada, a sangre— dice lo mismo sin
        depender de que nada se salga del papel.
      */}
      {pie && (
        <motion.div variants={bloqueAcceso} className="bg-secondary/25">
          <motion.div
            className="origin-left border-t border-dashed border-border"
            variants={linea}
            aria-hidden
          />
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-(--acceso-borde) py-3 text-center">
            {pie}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
