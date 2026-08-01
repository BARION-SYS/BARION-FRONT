"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { CalendarCheck, CheckCircle2, MapPin, RotateCcw } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { formatDuration } from "@shared/utils/datetime"
import { resumenServicios } from "@features/citas/utils/servicios"
import { direccionLegible } from "@features/portal/utils/horarios"
import {
  dineroDe,
  fechaCortaDe,
  diaSemanaDe,
  horaDe,
  type ContextoFormato,
} from "@features/portal/utils/formato"
import type { Cita, SedePortal } from "@features/portal/types/portal.types"

interface PortalConfirmacionProps {
  /** La cita tal como la devolvió la api: el comprobante no se reconstruye. */
  cita: Cita
  sede: SedePortal | null
  hrefCitas: string
  formato: ContextoFormato
  onReservarOtra: () => void
}

/**
 * Cierre del flujo: el comprobante con el **código de seguimiento**, que es lo que
 * el cliente usa para volver a su cita sin identificarse.
 *
 * Los importes y la duración salen de la cita, ya congelados: no se recalculan
 * desde el catálogo, porque lo que se cobra es lo que quedó guardado.
 */
export function PortalConfirmacion({
  cita,
  sede,
  hrefCitas,
  formato,
  onReservarOtra,
}: PortalConfirmacionProps) {
  const duracionTotal = cita.servicios.reduce((suma, linea) => suma + linea.duracionMin, 0)
  const { calle, ciudad } = direccionLegible(sede?.direccion ?? null)
  const ubicacion = [calle, ciudad].filter(Boolean).join(", ")

  return (
    <motion.section
      className="overflow-hidden rounded-2xl border border-border bg-card"
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 140, damping: 22 }}
      aria-labelledby="titulo-confirmacion"
    >
      <div className="cinta-barberia h-1.5 w-full" aria-hidden />

      <div className="p-6 text-center sm:p-8">
        <span
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--exito)_15%,transparent)]"
          aria-hidden
        >
          <CheckCircle2 className="h-7 w-7 text-(--exito)" />
        </span>

        <h2 id="titulo-confirmacion" className="mt-4 text-2xl font-bold text-foreground">
          ¡Cita confirmada{cita.cliente ? `, ${cita.cliente.nombre}` : ""}!
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Guarda este código: con él puedes seguir tu cita sin iniciar sesión.
        </p>

        <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-sm font-bold tracking-widest text-secondary-foreground tabular-nums">
          {cita.codigoSeguimiento}
        </p>

        <dl className="mt-6 space-y-3 rounded-xl bg-secondary/50 p-4 text-left">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-xs text-muted-foreground">Cuándo</dt>
            <dd className="text-right text-sm font-semibold text-foreground">
              {diaSemanaDe(cita.iniciaEn, formato)} {fechaCortaDe(cita.iniciaEn, formato)} ·{" "}
              {horaDe(cita.iniciaEn, formato)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-xs text-muted-foreground">Servicios</dt>
            <dd className="text-right text-sm font-medium text-foreground">
              {resumenServicios(cita.servicios.map((linea) => linea.nombre))} ·{" "}
              {formatDuration(duracionTotal)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-xs text-muted-foreground">Barbero</dt>
            <dd className="text-right text-sm font-medium text-foreground">
              {cita.barbero?.nombrePublico ?? "Por asignar"}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-t border-dashed border-border pt-3">
            <dt className="text-xs text-muted-foreground">Total a pagar en la barbería</dt>
            <dd className="text-right text-base font-bold text-primary tabular-nums">
              {dineroDe(cita.precioCentavos, formato)}
            </dd>
          </div>
        </dl>

        {ubicacion && (
          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            {ubicacion}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button
            render={<Link href={hrefCitas} />}
            size="lg"
            className="h-12 flex-1 text-sm font-semibold"
          >
            <CalendarCheck aria-hidden />
            Ver mis citas
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onReservarOtra}
            className="h-12 flex-1 cursor-pointer text-sm font-semibold"
          >
            <RotateCcw aria-hidden />
            Reservar otra
          </Button>
        </div>
      </div>
    </motion.section>
  )
}
