"use client"

import { Download } from "lucide-react"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import { Button } from "@shared/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@shared/components/ui/table"
import { useFormato } from "@shared/hooks/useFormato"
import { ESTADO_FACTURA, lineasDeFactura } from "@features/suscripcion/utils/facturas"
import type { FacturaDetalle } from "@features/suscripcion/types/suscripcion.types"

interface SuscripcionFacturaDetailProps {
  factura: FacturaDetalle | null
  cargando: boolean
}

/**
 * Un cobro de Barion, con su desglose. Solo lectura: aquí no se emite ni se
 * corrige nada —una factura emitida es inmutable— y lo único accionable es
 * descargarla cuando existe el documento.
 */
export function SuscripcionFacturaDetail({ factura, cargando }: SuscripcionFacturaDetailProps) {
  const { dineroEn, fecha, numero } = useFormato()

  if (cargando || !factura) return <DataSkeleton variant="form" count={4} />

  const estado = ESTADO_FACTURA[factura.estado]
  const { lineas, ilegibles } = lineasDeFactura(factura.lineas)
  const importe = (centavos: string) => dineroEn(Number(centavos), factura.moneda)

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-base font-semibold tabular-nums">{factura.numero}</p>
        <StatusBadge etiqueta={estado.etiqueta} tono={estado.tono} />
      </header>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Dato etiqueta="Emitida" valor={fecha(factura.emitidaEn)} />
        {/* Sin fecha se dice que no la hay: un guion, nunca la de hoy. */}
        <Dato etiqueta="Vence" valor={factura.venceEn ? fecha(factura.venceEn) : "—"} />
        <Dato etiqueta="Pagada" valor={factura.pagadaEn ? fecha(factura.pagadaEn) : "—"} />
      </dl>

      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">Desglose</h3>

        {lineas.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Esta factura se emitió sin desglose: lo que la explica es el total.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Concepto</TableHead>
                  <TableHead className="text-right">Cant.</TableHead>
                  <TableHead className="text-right">Importe</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineas.map((linea, indice) => (
                  // Las líneas no traen id propio: son parte del documento, no filas.
                  <TableRow key={`${linea.concepto}-${indice}`}>
                    <TableCell>{linea.concepto}</TableCell>
                    <TableCell className="text-right text-muted-foreground tabular-nums">
                      {linea.cantidad === undefined ? "—" : numero(linea.cantidad)}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {importe(linea.montoCentavos)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {ilegibles > 0 && (
          <p className="text-xs text-(--advertencia)">
            {ilegibles === 1
              ? "Una línea llegó en un formato que no se pudo mostrar."
              : `${numero(ilegibles)} líneas llegaron en un formato que no se pudo mostrar.`}{" "}
            El total sigue siendo el del documento.
          </p>
        )}
      </section>

      <dl className="flex flex-col gap-2 border-t border-border pt-4">
        <Total etiqueta="Subtotal" valor={importe(factura.subtotalCentavos)} />
        <Total etiqueta="Impuestos" valor={importe(factura.impuestoCentavos)} />
        <Total etiqueta="Total" valor={importe(factura.totalCentavos)} destacado />
      </dl>

      {/* El PDF lo publica la pasarela: sin documento no hay botón, ni siquiera
          deshabilitado — prometería algo que nadie ha emitido. */}
      {factura.pdfUrl && (
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          render={
            <a href={factura.pdfUrl} target="_blank" rel="noreferrer">
              <Download aria-hidden />
              Descargar factura {factura.numero}
            </a>
          }
        />
      )}
    </div>
  )
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{etiqueta}</dt>
      <dd className="text-sm font-medium">{valor}</dd>
    </div>
  )
}

function Total({
  etiqueta,
  valor,
  destacado,
}: {
  etiqueta: string
  valor: string
  destacado?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className={destacado ? "text-sm font-medium" : "text-sm text-muted-foreground"}>
        {etiqueta}
      </dt>
      <dd className={destacado ? "text-base font-semibold tabular-nums" : "text-sm tabular-nums"}>
        {valor}
      </dd>
    </div>
  )
}
