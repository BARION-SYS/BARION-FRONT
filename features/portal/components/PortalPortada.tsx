"use client"

import { motion } from "motion/react"
import { MapPin, Star } from "lucide-react"
import type { BarberiaPortal } from "@features/portal/types/portal.types"

interface PortalPortadaProps {
  barberia: BarberiaPortal
}

const bloque = {
  oculto: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 140, damping: 22 } },
} as const

// Encabezado del negocio: identidad y prueba social, sin competir con el flujo de reserva.
export function PortalPortada({ barberia }: PortalPortadaProps) {
  return (
    <motion.section
      className="relative"
      initial="oculto"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
      aria-labelledby="titulo-barberia"
    >
      <div
        className="pointer-events-none absolute -top-20 -left-10 h-56 w-56 rounded-full bg-primary/10 blur-3xl"
        aria-hidden
      />

      <div className="relative">
        <motion.p
          variants={bloque}
          className="text-[11px] font-semibold tracking-[0.22em] text-primary uppercase"
        >
          {barberia.eslogan}
        </motion.p>

        <motion.h1
          id="titulo-barberia"
          variants={bloque}
          className="mt-2.5 text-3xl leading-[1.15] font-bold tracking-tight text-foreground sm:text-4xl"
        >
          {barberia.nombre}
        </motion.h1>

        <motion.div
          variants={bloque}
          className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground"
        >
          <span className="flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-primary text-primary" aria-hidden />
            <span className="font-semibold text-foreground tabular-nums">
              {barberia.calificacion}
            </span>
            <span>({barberia.resenas})</span>
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" aria-hidden />
            {barberia.direccion}
          </span>
        </motion.div>
      </div>
    </motion.section>
  )
}
