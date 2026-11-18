"use client"

import { motion, type Variants } from "motion/react"
import type { EntradaVista } from "@routes/types/routes.types"
import { CURVA_SALIDA, RESORTE } from "@shared/utils/movimiento"

// Catálogo de entradas de vista: el mismo RESORTE (shared/utils/movimiento.ts) con recorridos distintos y cortos.
// La entrada de cada sección se declara en routes/rutasDashboard.ts (campo `entrada`).
const resorte = { type: "spring", ...RESORTE } as const

const entradas: Record<EntradaVista, Variants> = {
  subir: {
    oculto: { opacity: 0, y: 12, scale: 0.995 },
    visible: { opacity: 1, y: 0, scale: 1, transition: resorte },
  },
  bajar: {
    oculto: { opacity: 0, y: -12, scale: 0.995 },
    visible: { opacity: 1, y: 0, scale: 1, transition: resorte },
  },
  izquierda: {
    oculto: { opacity: 0, x: -16 },
    visible: { opacity: 1, x: 0, transition: resorte },
  },
  derecha: {
    oculto: { opacity: 0, x: 16 },
    visible: { opacity: 1, x: 0, transition: resorte },
  },
  zoom: {
    oculto: { opacity: 0, scale: 0.96 },
    visible: { opacity: 1, scale: 1, transition: resorte },
  },
  fundido: {
    oculto: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3, ease: CURVA_SALIDA } },
  },
}

interface TransicionVistaProps {
  children: React.ReactNode
  entrada?: EntradaVista
}

// Entrada de cada vista del panel (la monta app/dashboard/template.tsx por navegación).
// Mantiene la cadena flex del layout: el <main> de cada página sigue llenando el alto.
export function TransicionVista({ children, entrada = "subir" }: TransicionVistaProps) {
  return (
    <motion.div
      className="flex min-h-0 min-w-0 flex-1 flex-col"
      variants={entradas[entrada]}
      initial="oculto"
      animate="visible"
    >
      {children}
    </motion.div>
  )
}
