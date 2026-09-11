"use client"

import { MotionConfig, motion } from "motion/react"
import { PanelMarca } from "@features/auth/components/PanelMarca"
import { ThemeToggle } from "@shared/layout/ThemeToggle"

/**
 * El marco de toda pantalla de acceso: la puerta global, pedir el enlace,
 * elegir la contraseña nueva y el cambio obligatorio.
 *
 * Existía solo en `/entrar`, y las otras tres eran una tarjeta suelta sobre un
 * fondo liso: quien pasaba del login a «olvidé mi contraseña» sentía que había
 * salido del producto justo en el momento en que más necesita confiar en él.
 * Ahora comparten el panel de marca, la textura y el resplandor.
 *
 * La pantalla ocupa la ventana exacta y quien desplaza, si hace falta, es la
 * columna del formulario — no la página. `m-auto` en el envoltorio centra
 * mientras sobra sitio y deja de centrar cuando no: con `items-center` lo que
 * sobresale por arriba se recortaba y no había scroll que lo devolviera.
 *
 * Lleva el único `MotionConfig` de estas pantallas: las páginas no ponen otro.
 */
export function PuertaAcceso({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <div className="relative flex h-dvh overflow-hidden bg-background">
        <div className="absolute top-4 right-4 z-20">
          <ThemeToggle />
        </div>
        <PanelMarca />

        <main className="scroll-fino relative flex flex-1 flex-col overflow-y-auto">
          {/* Empapelado diagonal sutil, eco del panel de marca */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, var(--foreground) 0 2px, transparent 2px 26px)",
            }}
            aria-hidden
          />

          {/* Resplandor dorado con flotación lenta */}
          <motion.div
            className="pointer-events-none absolute -top-24 right-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl"
            animate={{ y: [0, 28, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden
          />

          <div className="relative z-10 m-auto w-full max-w-md px-4 py-6 sm:px-6">{children}</div>
        </main>
      </div>
    </MotionConfig>
  )
}
