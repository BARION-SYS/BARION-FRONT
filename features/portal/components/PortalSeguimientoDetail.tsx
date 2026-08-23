"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { CalendarCheck, CalendarX, MapPin } from "lucide-react"
import {
  ESTADOS_NO_CANCELABLES,
  configEstadoCita,
  textoEstadoCita,
} from "@features/citas/utils/estadoCita"
import { resumenServicios } from "@features/citas/utils/servicios"
import { direccionLegible } from "@features/portal/utils/horarios"
import {
  dineroDe,
  fechaCortaDe,
  diaSemanaDe,
  horaDe,
  type ContextoFormato,
} from "@features/portal/utils/formato"
import type { SedePortal, SeguimientoPortal } from "@features/portal/types/portal.types"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import { Button } from "@shared/components/ui/button"
import { formatDuration } from "@shared/utils/datetime"
import { useTextos } from "@shared/textos/useTextos"

interface PortalSeguimientoDetailProps {
  cita: SeguimientoPortal
  sede: SedePortal | null
  formato: ContextoFormato
  /** A dónde se manda a quien quiere cancelar: allí se identifica primero. */
  hrefCitas: string
}

/**
 * La cita que abre el botón «Ver mi cita» de los correos.
 *
 * **Se lee sin sesión, pero no se cambia nada desde aquí.** El código viaja en un
 * correo que se reenvía y se ve en pantallas compartidas, así que tenerlo no
 * demuestra ser el cliente: cancelar exige identificarse antes, y a eso lleva el
 * botón —a «Mis citas», donde escribe su correo y recibe un código—.
 *
 * Es la diferencia con `/b/{slug}/accion/{token}`, que sí actúa directo: aquel
 * token es de un solo uso y lo emitió la barbería para esa cita concreta; este
 * código es permanente y sirve para consultarla las veces que haga falta.
 *
 * Por eso tampoco aparecen el teléfono ni las notas: la api ya recorta la
 * respuesta por el mismo motivo, y esta pantalla no añade nada que ella no dé.
 */
export function PortalSeguimientoDetail({
  cita,
  sede,
  formato,
  hrefCitas,
}: PortalSeguimientoDetailProps) {
  const tCita = useTextos("portal.cita")
  const estado = configEstadoCita[cita.estado]
  const tEstados = useTextos("citas.estados")
  const duracionTotal = cita.servicios.reduce((suma, linea) => suma + linea.duracionMin, 0)
  // Ya pasó, está pasando o se canceló: no hay nada que ofrecer.
  const puedeCancelarse = !ESTADOS_NO_CANCELABLES.includes(cita.estado)
  const { calle, ciudad } = direccionLegible(sede?.direccion ?? null)
  const ubicacion = [calle, ciudad].filter(Boolean).join(", ")

  return (
    <motion.section
      className="overflow-hidden rounded-2xl border border-border bg-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 140, damping: 22 }}
      aria-labelledby="titulo-seguimiento"
    >
      <div className="cinta-barberia h-1.5 w-full" aria-hidden />

      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 id="titulo-seguimiento" className="text-2xl font-bold text-foreground">
              {cita.cliente ? tCita("tuCitaCon", { nombre: cita.cliente.nombre }) : tCita("tuCita")}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Código{" "}
              <span className="font-semibold tracking-widest text-foreground tabular-nums">
                {cita.codigoSeguimiento}
              </span>
            </p>
          </div>
          {/* Con ícono además del color: el estado nunca va solo por color */}
          <StatusBadge
            etiqueta={textoEstadoCita(tEstados, cita.estado)}
            tono={estado.tono}
            icono={estado.icono}
          />
        </div>

        {cita.canceladaEn && (
          <p
            role="status"
            className="mt-5 rounded-xl bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
          >
            Esta cita se canceló el {fechaCortaDe(cita.canceladaEn, formato)}. Si quieres otra hora,
            reserva de nuevo desde el portal.
          </p>
        )}

        <dl className="mt-6 space-y-3 rounded-xl bg-secondary/50 p-4">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-xs text-muted-foreground">{tCita("cuando")}</dt>
            <dd className="text-right text-sm font-semibold text-foreground">
              {diaSemanaDe(cita.iniciaEn, formato)} {fechaCortaDe(cita.iniciaEn, formato)} ·{" "}
              {horaDe(cita.iniciaEn, formato)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-xs text-muted-foreground">{tCita("servicios")}</dt>
            <dd className="text-right text-sm font-medium text-foreground">
              {resumenServicios(cita.servicios.map((linea) => linea.nombre))} ·{" "}
              {formatDuration(duracionTotal)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-xs text-muted-foreground">{tCita("barbero")}</dt>
            <dd className="text-right text-sm font-medium text-foreground">
              {cita.barbero?.nombrePublico ?? tCita("porAsignar")}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-t border-dashed border-border pt-3">
            <dt className="text-xs text-muted-foreground">{tCita("totalEnLaBarberia")}</dt>
            <dd className="text-right text-base font-bold text-primary tabular-nums">
              {dineroDe(cita.precioCentavos, formato)}
            </dd>
          </div>
        </dl>

        {ubicacion && (
          <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {ubicacion}
          </p>
        )}

        {/* Acción, no texto pasivo: quien abre esto desde el correo suele venir a
            cancelar, y decirle dónde hacerlo sin llevarle es dejarlo buscando.

            **Pero el enlace no cancela: lleva a identificarse.** Este código
            viaja en un correo que se reenvía y se ve en pantallas compartidas,
            así que tenerlo no demuestra ser el cliente. En «Mis citas» escribe su
            correo, recibe su código y ahí sí cancela — y de paso queda con sesión
            de 30 días. Tampoco se prellena el correo: la api no lo devuelve aquí,
            y hace bien, porque sería enseñárselo a quien tenga el reenvío. */}
        {puedeCancelarse ? (
          <div className="mt-6 space-y-2">
            <Button
              render={<Link href={hrefCitas} />}
              variant="outline"
              size="lg"
              className="h-12 w-full text-sm font-semibold"
            >
              <CalendarX aria-hidden />
              Cancelar o cambiar la hora
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Te pediremos tu correo y te enviaremos un código, para asegurarnos de que la cita es
              tuya.
            </p>
          </div>
        ) : (
          <p className="mt-6 flex items-start gap-2 rounded-xl bg-secondary/40 p-3 text-xs text-muted-foreground">
            <CalendarCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            Esta cita ya no admite cambios. Puedes reservar otra desde el portal.
          </p>
        )}
      </div>
    </motion.section>
  )
}
