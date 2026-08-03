"use client"

import Link from "next/link"
import { motion } from "motion/react"
import {
  BellOff,
  CalendarCheck,
  CalendarX,
  CheckCircle2,
  LinkIcon,
  Star,
  Store,
} from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { copiaPorResultado } from "@features/portal/constants/acciones"
import type { ResultadoAccion } from "@features/portal/types/portal.types"

const iconoPorResultado = {
  confirmada: CheckCircle2,
  cancelada: CalendarX,
  reservada: CalendarCheck,
  calificada: Star,
  baja: BellOff,
}

interface PortalAccionDetailProps {
  /** Lo que la api dice que pasó. `null` = el enlace no se pudo ejecutar. */
  resultado: ResultadoAccion | null
  /** El `message` de la api: el titular no se reescribe en el front. */
  mensaje: string
  nombreBarberia: string
  hrefPortal: string
  /** `null` cuando no hay cita detrás (la baja de comunicaciones). */
  hrefCitas: string | null
}

/**
 * El desenlace del enlace de un correo. Presentacional puro: quién llamó a la api
 * y qué pasó lo decide la página.
 *
 * **Los tres fallos se pintan igual** —el enlace no existe, ya se usó o caducó—
 * porque la api responde lo mismo para los tres, y esta pantalla no añade ni una
 * pista de cuál fue: distinguirlos la convertiría en un oráculo de qué enlaces
 * ajenos siguen vivos.
 */
export function PortalAccionDetail({
  resultado,
  mensaje,
  nombreBarberia,
  hrefPortal,
  hrefCitas,
}: PortalAccionDetailProps) {
  const copia = resultado ? copiaPorResultado[resultado] : null
  const Icono = resultado ? iconoPorResultado[resultado] : LinkIcon
  const exito = copia?.tono === "exito"

  return (
    <motion.section
      className="overflow-hidden rounded-2xl border border-border bg-card"
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 140, damping: 22 }}
      aria-labelledby="titulo-accion"
    >
      <div className="cinta-barberia h-1.5 w-full" aria-hidden />

      <div className="p-6 text-center sm:p-8">
        <span
          className={
            exito
              ? "mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--exito)_15%,transparent)]"
              : "mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary"
          }
          aria-hidden
        >
          <Icono className={exito ? "h-7 w-7 text-(--exito)" : "h-7 w-7 text-muted-foreground"} />
        </span>

        <h1
          id="titulo-accion"
          className="mt-4 text-xl font-bold tracking-tight text-foreground sm:text-2xl"
        >
          {resultado ? mensaje : "No pudimos abrir este enlace"}
        </h1>

        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground" role="status">
          {copia ? copia.detalle : mensaje}
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button
            render={<Link href={hrefPortal} />}
            size="lg"
            variant={hrefCitas ? "outline" : "default"}
            className="h-12 flex-1 text-sm font-semibold"
          >
            <Store aria-hidden />
            Volver a {nombreBarberia}
          </Button>

          {hrefCitas && (
            <Button
              render={<Link href={hrefCitas} />}
              size="lg"
              className="h-12 flex-1 text-sm font-semibold"
            >
              <CalendarCheck aria-hidden />
              Ver mis citas
            </Button>
          )}
        </div>
      </div>
    </motion.section>
  )
}
