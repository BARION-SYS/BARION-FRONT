"use client"

import { ArrowRight, CalendarDays, Clock, Loader2, Scissors, User } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { cn } from "@shared/utils/cn"
import { formatDuration } from "@shared/utils/datetime"
import { resumenServicios } from "@features/citas/utils/servicios"
import {
  dineroDe,
  diaSemanaDe,
  fechaCortaDe,
  horaDe,
  sumaCentavos,
  type ContextoFormato,
} from "@features/portal/utils/formato"
import type { ServicioPortal } from "@features/portal/types/portal.types"

interface PortalResumenDetailProps {
  /** N servicios por cita: la lista completa que el cliente lleva elegida. */
  servicios: ServicioPortal[]
  /** Nombre del barbero elegido, o null con «cualquiera disponible». */
  nombreBarbero: string | null
  /** Inicio de la cita: instante UTC. */
  inicio: string | null
  /** Horas antes de la cita hasta las que el cliente puede cancelar él mismo. */
  horasCancelacion: number
  textoCta: string
  puedeContinuar: boolean
  cargando?: boolean
  formato: ContextoFormato
  onContinuar: () => void
  /** Barra inferior de móvil: solo total y CTA. */
  compacta?: boolean
  /** En los pasos con formulario el avance lo dispara el propio formulario. */
  sinCta?: boolean
}

/**
 * Resumen persistente de la reserva: el cliente ve siempre qué lleva y cuánto
 * cuesta.
 *
 * El total se suma **en centavos y como entero** (`BigInt`), no en pesos con
 * decimales: sumar dinero en coma flotante acaba enseñando un total que no cuadra
 * con la suma de sus líneas.
 *
 * Y es un total **«desde»**: el precio definitivo es el de la oferta del barbero
 * que atienda, y con «cualquiera disponible» todavía no se sabe quién es.
 */
export function PortalResumenDetail({
  servicios,
  nombreBarbero,
  inicio,
  horasCancelacion,
  textoCta,
  puedeContinuar,
  cargando,
  formato,
  onContinuar,
  compacta,
  sinCta,
}: PortalResumenDetailProps) {
  const hayServicios = servicios.length > 0
  const total = sumaCentavos(servicios.map((servicio) => servicio.precioDesdeCentavos ?? "0"))
  const duracionTotal = servicios.reduce((suma, servicio) => suma + servicio.duracionMin, 0)
  const nombresServicios = resumenServicios(servicios.map((servicio) => servicio.nombre))

  const filas = [
    { icono: Scissors, etiqueta: "Servicios", valor: hayServicios ? nombresServicios : undefined },
    {
      icono: User,
      etiqueta: "Barbero",
      valor: nombreBarbero ?? (puedeContinuar ? "Cualquiera disponible" : undefined),
    },
    {
      icono: CalendarDays,
      etiqueta: "Fecha",
      valor: inicio
        ? `${diaSemanaDe(inicio, formato)} ${fechaCortaDe(inicio, formato)} · ${horaDe(inicio, formato)}`
        : undefined,
    },
    {
      icono: Clock,
      etiqueta: "Duración",
      valor: hayServicios ? formatDuration(duracionTotal) : undefined,
    },
  ]

  const boton = (
    <Button
      type="button"
      size="lg"
      disabled={!puedeContinuar || cargando}
      onClick={onContinuar}
      className={cn("h-12 cursor-pointer text-sm font-semibold", compacta ? "shrink-0" : "w-full")}
    >
      {cargando ? (
        <Loader2 className="animate-spin" aria-hidden />
      ) : (
        <>
          {textoCta}
          <ArrowRight aria-hidden />
        </>
      )}
    </Button>
  )

  if (compacta) {
    return (
      <div className="flex items-center gap-3 border-t border-border bg-card/95 p-3 backdrop-blur-md">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted-foreground">
            {hayServicios ? nombresServicios : "Elige un servicio"}
          </p>
          <p className="text-lg font-bold text-foreground tabular-nums">
            {hayServicios ? dineroDe(total, formato) : "—"}
          </p>
        </div>
        {boton}
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-sm font-semibold text-foreground">Tu reserva</p>

      <dl className="mt-4 space-y-3">
        {filas.map(({ icono: Icono, etiqueta, valor }) => (
          <div key={etiqueta} className="flex items-start gap-2.5">
            <Icono className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            <div className="min-w-0 flex-1">
              <dt className="text-[10px] tracking-wide text-muted-foreground uppercase">
                {etiqueta}
              </dt>
              <dd
                className={cn(
                  "truncate text-sm",
                  valor ? "font-medium text-foreground" : "text-muted-foreground"
                )}
              >
                {valor ?? "Pendiente"}
              </dd>
            </div>
          </div>
        ))}
      </dl>

      <div className="mt-4 flex items-baseline justify-between border-t border-dashed border-border pt-4">
        <span className="text-xs tracking-wide text-muted-foreground uppercase">Total desde</span>
        <span className="text-xl font-bold text-primary tabular-nums">
          {hayServicios ? dineroDe(total, formato) : "—"}
        </span>
      </div>

      {!sinCta && <div className="mt-4">{boton}</div>}

      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        Se paga en la barbería. Puedes cancelar hasta {horasCancelacion} horas antes.
      </p>
    </div>
  )
}
