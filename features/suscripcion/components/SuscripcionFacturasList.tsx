import { Download, Eye } from "lucide-react"
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
import { ESTADO_FACTURA } from "@features/suscripcion/utils/facturas"
import type { Factura } from "@features/suscripcion/types/suscripcion.types"
import { useTextos } from "@shared/textos/useTextos"

interface SuscripcionFacturasListProps {
  facturas: Factura[]
  cargando: boolean
  onVer: (factura: Factura) => void
}

/** Lo que Barion le ha cobrado a la barbería. Solo lectura: no se emiten aquí. */
export function SuscripcionFacturasList({
  facturas,
  cargando,
  onVer,
}: SuscripcionFacturasListProps) {
  const t = useTextos("suscripcion.facturas")
  const { dineroEn, fecha } = useFormato()

  return (
    <SectionCard titulo={t("titulo")} subtitulo={t("subtitulo")}>
      <Loadable
        loading={cargando}
        variant="table"
        isEmpty={facturas.length === 0}
        emptyState={<SinDatos titulo={t("sinDatos")} detalle={t("sinDatosDetalle")} alto={140} />}
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("numero")}</TableHead>
                <TableHead>{t("emitida")}</TableHead>
                <TableHead>{t("estado")}</TableHead>
                <TableHead className="text-right">{t("total")}</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {facturas.map((factura) => {
                const estado = ESTADO_FACTURA[factura.estado]
                return (
                  <TableRow key={factura.id}>
                    <TableCell className="font-medium tabular-nums">{factura.numero}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {fecha(factura.emitidaEn)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge etiqueta={estado.etiqueta} tono={estado.tono} />
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {dineroEn(Number(factura.totalCentavos), factura.moneda)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {/* El desglose no viaja en el listado: se abre por factura. */}
                        <Button variant="ghost" size="sm" onClick={() => onVer(factura)}>
                          <Eye aria-hidden />
                          <span className="sr-only">Ver la factura {factura.numero}</span>
                        </Button>

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
                      </div>
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
