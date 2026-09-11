"use client"

import { FileDown, Receipt } from "lucide-react"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { Loadable } from "@shared/components/feedback/Loadable"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import { Button } from "@shared/components/ui/button"
import { useFormato } from "@shared/hooks/useFormato"
import type { FacturacionBarberia } from "@features/plataforma/types/plataforma.types"
import type { TonoEstado } from "@shared/types/ui.types"

interface PlataformaFacturasListProps {
  facturacion: FacturacionBarberia | null
  loading: boolean
  /** El instante de la pantalla, fijado por el padre: decide qué está vencido. */
  ahora: Date
}

/** Los estados que admite `facturas_estado_check`. Uno nuevo sale crudo y neutro. */
const ESTADO_FACTURA: Record<string, { etiqueta: string; tono: TonoEstado }> = {
  abierta: { etiqueta: "Abierta", tono: "info" },
  pagada: { etiqueta: "Pagada", tono: "exito" },
  anulada: { etiqueta: "Anulada", tono: "neutro" },
  incobrable: { etiqueta: "Incobrable", tono: "peligro" },
}

/**
 * Lo que Barion le ha facturado a esta barbería: el resumen por moneda y las
 * últimas facturas, con número y fecha — lo que soporte necesita para contestar
 * «ya pagué» sin abrir la pasarela.
 *
 * Una factura abierta con el vencimiento pasado se marca «vencida» aunque su
 * estado siga siendo `abierta`: el estado lo escribe el cobro, la fecha la ve
 * cualquiera.
 */
export function PlataformaFacturasList({
  facturacion,
  loading,
  ahora,
}: PlataformaFacturasListProps) {
  const { dineroEn, numero, diaUTC } = useFormato()
  const ultimas = facturacion?.ultimas ?? []

  return (
    <SectionCard titulo="Facturación" subtitulo="Lo que Barion le ha facturado">
      <Loadable
        loading={loading || !facturacion}
        variant="list"
        count={3}
        isEmpty={ultimas.length === 0 && (facturacion?.resumen.length ?? 0) === 0}
        emptyState={
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <Receipt className="size-5 text-muted-foreground" aria-hidden />
            <p className="text-sm text-muted-foreground">
              Todavía no se le ha emitido ninguna factura.
            </p>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          {facturacion?.resumen.map((fila) => (
            <dl
              key={fila.moneda}
              className="grid grid-cols-3 gap-2 rounded-lg bg-secondary/40 px-3 py-2.5"
            >
              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">Cobrado</dt>
                <dd className="truncate text-sm font-semibold tabular-nums">
                  {dineroEn(Number(fila.cobradoCentavos), fila.moneda)}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">Pendiente</dt>
                <dd className="truncate text-sm font-semibold tabular-nums">
                  {dineroEn(Number(fila.pendienteCentavos), fila.moneda)}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">Vencidas</dt>
                <dd
                  className={
                    fila.vencidas > 0
                      ? "text-sm font-semibold text-(--advertencia) tabular-nums"
                      : "text-sm font-semibold tabular-nums"
                  }
                >
                  {numero(fila.vencidas)}
                </dd>
              </div>
            </dl>
          ))}

          <ul className="flex flex-col divide-y divide-border">
            {ultimas.map((factura) => {
              const vencida =
                factura.estado === "abierta" &&
                factura.venceEn !== null &&
                new Date(factura.venceEn).getTime() < ahora.getTime()
              const estado = vencida
                ? { etiqueta: "Vencida", tono: "advertencia" as const }
                : (ESTADO_FACTURA[factura.estado] ?? {
                    etiqueta: factura.estado,
                    tono: "neutro" as const,
                  })
              return (
                <li key={factura.id} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-sm">{factura.numero}</p>
                    <p className="text-xs text-muted-foreground">
                      Emitida el {diaUTC(factura.emitidaEn)}
                      {factura.pagadaEn && ` · pagada el ${diaUTC(factura.pagadaEn)}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-sm font-semibold tabular-nums">
                      {dineroEn(Number(factura.totalCentavos), factura.moneda)}
                    </span>
                    <StatusBadge {...estado} />
                  </div>
                  {factura.pdfUrl && (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Descargar la factura ${factura.numero}`}
                      render={<a href={factura.pdfUrl} target="_blank" rel="noopener noreferrer" />}
                    >
                      <FileDown aria-hidden />
                    </Button>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </Loadable>
    </SectionCard>
  )
}
