import { Download } from "lucide-react"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { SinDatos } from "@shared/components/feedback/SinDatos"
import { Loadable } from "@shared/components/feedback/Loadable"
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
import type { TonoEstado } from "@shared/types/ui.types"
import type { EstadoFactura, Factura } from "@features/suscripcion/types/suscripcion.types"

interface SuscripcionFacturasListProps {
  facturas: Factura[]
  cargando: boolean
}

const TONO_POR_ESTADO: Record<EstadoFactura, { etiqueta: string; tono: TonoEstado }> = {
  borrador: { etiqueta: "Borrador", tono: "neutro" },
  abierta: { etiqueta: "Pendiente", tono: "advertencia" },
  pagada: { etiqueta: "Pagada", tono: "exito" },
  anulada: { etiqueta: "Anulada", tono: "neutro" },
  incobrable: { etiqueta: "Incobrable", tono: "peligro" },
}

/** Lo que Barion le ha cobrado a la barbería. Solo lectura: no se emiten aquí. */
export function SuscripcionFacturasList({ facturas, cargando }: SuscripcionFacturasListProps) {
  const { dineroEn, fecha } = useFormato()

  return (
    <SectionCard titulo="Facturas" subtitulo="Los cobros de tu suscripción a Barion">
      <Loadable
        loading={cargando}
        variant="table"
        isEmpty={facturas.length === 0}
        emptyState={
          <SinDatos
            titulo="Todavía no hay facturas"
            detalle="Aparecerán aquí en cuanto se emita el primer cobro de tu plan."
            alto={140}
          />
        }
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Emitida</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {facturas.map((factura) => {
                const estado = TONO_POR_ESTADO[factura.estado]
                return (
                  <TableRow key={factura.id}>
                    <TableCell className="font-medium">{factura.numero}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {fecha(factura.emitidaEn)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge etiqueta={estado.etiqueta} tono={estado.tono} />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {dineroEn(Number(factura.totalCentavos), factura.moneda)}
                    </TableCell>
                    <TableCell className="text-right">
                      {/*
                        El PDF lo publica la pasarela: mientras no exista, no hay
                        botón. Uno deshabilitado prometería un documento que nadie
                        ha emitido.
                      */}
                      {factura.pdfUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          render={
                            <a href={factura.pdfUrl} target="_blank" rel="noreferrer">
                              <Download aria-hidden />
                              <span className="sr-only">Descargar {factura.numero}</span>
                            </a>
                          }
                        />
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </Loadable>
    </SectionCard>
  )
}
