"use client"

import { CalendarX2, Hourglass } from "lucide-react"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import { useFormato } from "@shared/hooks/useFormato"
import { NOMBRE_PERIODO } from "@features/plataforma/constants/planes.copy"
import { configEstadoSuscripcion } from "@features/plataforma/utils/suscripciones"
import type {
  BarberiaFicha,
  PeriodoTarifa,
  PlanPlataforma,
} from "@features/plataforma/types/plataforma.types"

interface PlataformaSuscripcionCardProps {
  ficha: BarberiaFicha
  /** El plan contratado según el catálogo, de donde salen sus límites. */
  plan: PlanPlataforma | null
}

/**
 * Qué tiene contratado y cuánto de eso usa.
 *
 * Los límites se cruzan con el catálogo del plan: una barbería con cinco
 * barberos en un plan de tres es la conversación comercial más fácil que tiene
 * Barion, y sin ponerlos juntos no se ve.
 *
 * Las fechas de facturación se leen en UTC —son medianoche UTC en la api—; en
 * la hora de la sede correrían un día cada vencimiento.
 */
export function PlataformaSuscripcionCard({ ficha, plan }: PlataformaSuscripcionCardProps) {
  const { numero, diaUTC, relativo } = useFormato()
  const suscripcion = ficha.suscripcion

  if (!suscripcion) {
    return (
      <SectionCard titulo="Suscripción" subtitulo="Qué tiene contratado">
        <p className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
          Sin suscripción: nunca se le ha cobrado. Se crea con el alta o al contratar un plan.
        </p>
      </SectionCard>
    )
  }

  const estado = configEstadoSuscripcion(suscripcion.estado)
  const enPrueba = suscripcion.estado === "prueba"
  const vence = enPrueba ? ficha.pruebaTerminaEn : suscripcion.periodoActualHasta
  const periodo = suscripcion.periodo as PeriodoTarifa | null

  const limites = [
    { etiqueta: "Sedes activas", uso: ficha.sedesActivas, techo: plan?.limites.sedes },
    { etiqueta: "Barberos activos", uso: ficha.barberosActivos, techo: plan?.limites.barberos },
  ]

  return (
    <SectionCard titulo="Suscripción" subtitulo="Qué tiene contratado y cuánto usa">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">
              {suscripcion.planNombre ?? suscripcion.planCodigo ?? "Sin plan"}
            </p>
            <p className="text-xs text-muted-foreground">
              {periodo && periodo in NOMBRE_PERIODO
                ? `Cobro ${NOMBRE_PERIODO[periodo].toLowerCase()}`
                : "Sin período"}
            </p>
          </div>
          <StatusBadge {...estado} />
        </div>

        <dl className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-secondary/40 px-3 py-2.5">
            <dt className="text-xs text-muted-foreground">
              {enPrueba ? "Prueba termina" : "Período hasta"}
            </dt>
            <dd className="mt-0.5 text-sm font-semibold">{vence ? diaUTC(vence) : "—"}</dd>
            {vence && <dd className="text-xs text-muted-foreground">{relativo(vence)}</dd>}
          </div>
          <div className="rounded-lg bg-secondary/40 px-3 py-2.5">
            <dt className="text-xs text-muted-foreground">Gracia por impago</dt>
            <dd className="mt-0.5 text-sm font-semibold">
              {suscripcion.graciaHasta ? diaUTC(suscripcion.graciaHasta) : "No aplica"}
            </dd>
            {suscripcion.graciaHasta && (
              <dd className="text-xs text-muted-foreground">{relativo(suscripcion.graciaHasta)}</dd>
            )}
          </div>
        </dl>

        {suscripcion.cancelaAlFinPeriodo && (
          <p className="flex items-center gap-2 rounded-lg bg-[color-mix(in_srgb,var(--advertencia)_10%,transparent)] px-3 py-2 text-xs text-foreground">
            <CalendarX2 className="size-4 shrink-0 text-(--advertencia)" aria-hidden />
            Pidió la baja: se va al terminar el período.
          </p>
        )}
        {suscripcion.graciaHasta && (
          <p className="flex items-center gap-2 rounded-lg bg-[color-mix(in_srgb,var(--advertencia)_10%,transparent)] px-3 py-2 text-xs text-foreground">
            <Hourglass className="size-4 shrink-0 text-(--advertencia)" aria-hidden />
            Tiene un impago con la cortesía corriendo.
          </p>
        )}

        <div className="flex flex-col gap-3 border-t border-border pt-4">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Uso del plan
          </p>
          {limites.map((limite) => {
            // `null` o ausente en el catálogo = sin techo.
            const techo = typeof limite.techo === "number" ? limite.techo : null
            const excede = techo !== null && limite.uso > techo
            return (
              <div key={limite.etiqueta} className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">{limite.etiqueta}</span>
                  <span
                    className={
                      excede
                        ? "font-semibold text-(--advertencia) tabular-nums"
                        : "font-semibold tabular-nums"
                    }
                  >
                    {numero(limite.uso)}
                    <span className="font-normal text-muted-foreground">
                      {" "}
                      / {techo === null ? "sin límite" : numero(techo)}
                    </span>
                  </span>
                </div>
                {techo !== null && (
                  <div
                    className="h-1.5 overflow-hidden rounded-full bg-secondary"
                    style={
                      {
                        "--parte": `${Math.min((limite.uso / Math.max(techo, 1)) * 100, 100)}%`,
                        "--tono": excede ? "var(--advertencia)" : "var(--primary)",
                      } as React.CSSProperties
                    }
                    aria-hidden
                  >
                    <div className="h-full w-(--parte) rounded-full bg-(--tono)" />
                  </div>
                )}
              </div>
            )
          })}
          {!plan && (
            <p className="text-xs text-muted-foreground">
              El plan ya no está en el catálogo público: sus límites no se pueden cruzar.
            </p>
          )}
        </div>
      </div>
    </SectionCard>
  )
}
