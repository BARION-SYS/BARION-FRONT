"use client"

import { motion } from "motion/react"
import { Check } from "lucide-react"
import { cn } from "@shared/utils/cn"

interface RequisitosContrasenaProps {
  requisitos: { clave: string; texto: string; cumple: boolean }[]
}

/**
 * Lo que la contraseña nueva tiene que cumplir, marcándose mientras se escribe.
 *
 * Antes era una línea gris de «Mínimo 12 caracteres» y el resto se descubría al
 * pulsar guardar, con un error debajo de cada campo. Una lista que se va
 * completando dice qué falta ANTES de enviar, que es cuando todavía sirve.
 *
 * El estado no va solo en el color: el círculo se llena y lleva su marca, y la
 * lista es `aria-live` para que un lector de pantalla oiga cuando se cumple.
 */
export function RequisitosContrasena({ requisitos }: RequisitosContrasenaProps) {
  return (
    <ul className="flex flex-col gap-1.5" aria-live="polite">
      {requisitos.map(({ clave, texto, cumple }) => (
        <li
          key={clave}
          className={cn(
            "flex items-center gap-2 text-xs transition-colors duration-200",
            cumple ? "text-foreground" : "text-muted-foreground"
          )}
        >
          <span
            className={cn(
              "flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-200",
              cumple ? "border-(--exito) bg-(--exito) text-background" : "border-border"
            )}
            aria-hidden
          >
            <motion.span
              initial={false}
              animate={{ scale: cumple ? 1 : 0, opacity: cumple ? 1 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 28 }}
              className="flex"
            >
              <Check className="size-3" strokeWidth={3} />
            </motion.span>
          </span>
          {texto}
        </li>
      ))}
    </ul>
  )
}
