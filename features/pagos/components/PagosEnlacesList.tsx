"use client"

import { Check, Copy, ExternalLink, Link2, Plus } from "lucide-react"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { Loadable } from "@shared/components/feedback/Loadable"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import { Button } from "@shared/components/ui/button"
import { useFormato } from "@shared/hooks/useFormato"
import type { TonoEstado } from "@shared/types/ui.types"
import type { EnlacePago, EstadoCobro } from "@features/pagos/types/pagos.types"

interface PagosEnlacesListProps {
  enlaces: EnlacePago[]
  cargando: boolean
  cargandoAction: boolean
  soloLectura: boolean
  /** Cuál se acaba de copiar, para confirmarlo sin un toast por cada clic. */
  copiadoId: string | null
  onGenerar: () => void
  onCopiar: (enlace: EnlacePago) => void
}

const presentacion: Record<EstadoCobro, { etiqueta: string; tono: TonoEstado }> = {
  pendiente: { etiqueta: "Sin pagar", tono: "advertencia" },
  procesando: { etiqueta: "En curso", tono: "info" },
  aprobado: { etiqueta: "Pagado", tono: "exito" },
  rechazado: { etiqueta: "Rechazado", tono: "peligro" },
  error: { etiqueta: "Sin confirmar", tono: "peligro" },
  anulado: { etiqueta: "Anulado", tono: "neutro" },
}

/**
 * Los enlaces de pago que la barbería generó para mandárselos a quien vaya a
 * pagar.
 *
 * Presentacional puro: generar y copiar viven en el padre, que es quien tiene la
 * mutación.
 */
export function PagosEnlacesList({
  enlaces,
  cargando,
  cargandoAction,
  soloLectura,
  copiadoId,
  onGenerar,
  onCopiar,
}: PagosEnlacesListProps) {
  const { dineroEn, fechaHora } = useFormato()

  return (
    <SectionCard
      titulo="Enlaces de pago"
      subtitulo="Genera una dirección y mándasela a quien vaya a pagar. Caduca en 24 horas."
      accion={
        !soloLectura && (
          <Button size="sm" className="min-h-11" disabled={cargandoAction} onClick={onGenerar}>
            <Plus aria-hidden />
            Generar enlace
          </Button>
        )
      }
    >
      <Loadable
        loading={cargando}
        variant="list"
        count={3}
        isEmpty={enlaces.length === 0}
        emptyState={
          <p className="py-6 text-center text-sm text-muted-foreground">
            Todavía no has generado ninguno. Un enlace sirve para que pague alguien que no
            administra el sistema: un socio, el contador.
          </p>
        }
      >
        <ul className="space-y-3">
          {enlaces.map((enlace) => {
            // Caducado se pinta como su propio estado y no como «sin pagar»: la
            // diferencia es que uno todavía se puede pagar y el otro no.
            const estado = enlace.vencido
              ? { etiqueta: "Caducado", tono: "neutro" as TonoEstado }
              : presentacion[enlace.estado]
            const copiado = copiadoId === enlace.id

            return (
              <li
                key={enlace.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary">
                  <Link2 className="h-5 w-5 text-secondary-foreground" aria-hidden />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground tabular-nums">
                    {dineroEn(Number(enlace.montoCentavos), enlace.moneda)}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {fechaHora(enlace.creadoEn)}
                    {enlace.creadoPor && ` · ${enlace.creadoPor}`}
                  </p>
                  {/* La referencia es lo que hay que buscar al conciliar, así que
                      se enseña aunque sea fea. */}
                  <p className="truncate font-mono text-[11px] text-muted-foreground">
                    {enlace.referencia}
                  </p>
                </div>

                <StatusBadge etiqueta={estado.etiqueta} tono={estado.tono} />

                {/* Copiar y abrir solo en lo que todavía sirve: ofrecerlos en uno
                    caducado manda a alguien a una dirección que no cobra. */}
                {enlace.estado === "pendiente" && !enlace.vencido && (
                  <div className="flex shrink-0 items-center gap-2">
                    <Button variant="outline" className="min-h-11" onClick={() => onCopiar(enlace)}>
                      {copiado ? <Check aria-hidden /> : <Copy aria-hidden />}
                      {copiado ? "Copiado" : "Copiar"}
                    </Button>
                    {/*
                      Copiar sirve para MANDARLO; abrir, para pagarlo uno mismo —y
                      es el caso más frecuente cuando la barbería genera el enlace
                      para pagar su propia suscripción—. Sin esto había que pegar
                      la dirección en otra pestaña a mano.

                      Pestaña nueva a propósito: el panel se queda donde estaba,
                      así que al volver del checkout no se pierde nada de lo que
                      había abierto.
                    */}
                    <Button
                      variant="default"
                      className="min-h-11"
                      render={
                        <a href={enlace.url} target="_blank" rel="noreferrer">
                          <ExternalLink aria-hidden />
                          Pagar
                        </a>
                      }
                    />
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </Loadable>
    </SectionCard>
  )
}
