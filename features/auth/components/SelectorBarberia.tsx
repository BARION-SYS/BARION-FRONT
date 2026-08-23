"use client"

import { motion, type Variants } from "motion/react"
import { ArrowRight, Store } from "lucide-react"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import { inicialesDe } from "@shared/utils/iniciales"
import { Button } from "@shared/components/ui/button"
import { LogoBarion } from "@shared/components/brand/LogoBarion"
import { useTextos } from "@shared/textos/useTextos"
import type { BarberiaParaElegir } from "@features/auth/types/auth.types"

interface SelectorBarberiaProps {
  barberias: BarberiaParaElegir[]
  cargando: boolean
  onElegir: (slug: string) => void
}

const bloque: Variants = {
  oculto: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 140, damping: 22 } },
}

/**
 * Paso extra de la puerta global: la persona trabaja en varias barberías y tiene
 * que decir en cuál entra.
 *
 * No es una pantalla de error — las credenciales ya eran correctas. Y no hay
 * nada que escribir: son botones con SUS barberías, nunca un campo donde teclear
 * un identificador.
 */
export function SelectorBarberia({ barberias, cargando, onElegir }: SelectorBarberiaProps) {
  const t = useTextos()

  return (
    <motion.div
      className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg"
      variants={bloque}
      initial="oculto"
      animate="visible"
    >
      <LogoBarion variante="icono" priority className="mb-6" />

      <h1 className="text-lg font-semibold">{t("auth.selectorBarberia.titulo")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("auth.selectorBarberia.descripcion")}</p>

      <ul className="mt-6 flex flex-col gap-2">
        {barberias.map((barberia) => (
          <li key={barberia.id}>
            <Button
              variant="outline"
              className="h-auto w-full justify-start gap-3 px-3 py-3 text-left"
              disabled={cargando}
              onClick={() => onElegir(barberia.slug)}
            >
              <InitialsAvatar iniciales={inicialesDe(barberia.nombreComercial)} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">{barberia.nombreComercial}</span>
                <span className="truncate text-xs text-muted-foreground">/{barberia.slug}</span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            </Button>
          </li>
        ))}
      </ul>

      <p className="mt-6 flex items-start gap-2 text-xs text-muted-foreground">
        <Store className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        {t("auth.selectorBarberia.atajo")}
      </p>
    </motion.div>
  )
}
