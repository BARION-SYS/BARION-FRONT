"use client"

import { motion } from "motion/react"
import { Check, MapPin } from "lucide-react"
import { direccionLegible } from "@features/portal/utils/horarios"
import type { BarberiaPortal, SedePortal } from "@features/portal/types/portal.types"

interface PortalPortadaProps {
  barberia: BarberiaPortal
  /** La sede elegida: la dirección que se pinta es de ella, no de la barbería. */
  sede: SedePortal | null
}

const bloque = {
  oculto: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 140, damping: 22 } },
} as const

/**
 * Encabezado del negocio: identidad y lo que ofrece, sin competir con el flujo de
 * reserva.
 *
 * **No hay calificación de la barbería**, y es deliberado: la api califica
 * BARBEROS, no negocios. Un promedio a nivel de barbería sería un número que nadie
 * puede reconciliar con las reseñas que sí existen.
 */
export function PortalPortada({ barberia, sede }: PortalPortadaProps) {
  const { calle, ciudad } = direccionLegible(sede?.direccion ?? null)
  const ventajas = barberia.ficha.ventajas.slice(0, 3)
  const ubicacion = [calle, ciudad].filter(Boolean).join(", ")

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
        {barberia.ficha.eslogan && (
          <motion.p
            variants={bloque}
            className="text-[11px] font-semibold tracking-[0.22em] text-primary uppercase"
          >
            {barberia.ficha.eslogan}
          </motion.p>
        )}

        <motion.h1
          id="titulo-barberia"
          variants={bloque}
          className="mt-2.5 text-3xl leading-[1.15] font-bold tracking-tight text-foreground sm:text-4xl"
        >
          {barberia.nombreComercial}
        </motion.h1>

        {barberia.ficha.descripcion && (
          <motion.p
            variants={bloque}
            className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground"
          >
            {barberia.ficha.descripcion}
          </motion.p>
        )}

        {ubicacion && (
          <motion.p
            variants={bloque}
            className="mt-3 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground"
          >
            <MapPin className="h-4 w-4 shrink-0" aria-hidden />
            {ubicacion}
          </motion.p>
        )}

        {ventajas.length > 0 && (
          <motion.ul variants={bloque} className="mt-4 flex flex-wrap gap-2">
            {ventajas.map((ventaja) => (
              <li
                key={ventaja}
                className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
              >
                <Check className="h-3 w-3 text-primary" aria-hidden />
                {ventaja}
              </li>
            ))}
          </motion.ul>
        )}
      </div>
    </motion.section>
  )
}
