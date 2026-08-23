"use client"

import { Plus } from "lucide-react"

import { Button } from "@shared/components/ui/button"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import { Card } from "@shared/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@shared/components/ui/table"
import { Loadable } from "@shared/components/feedback/Loadable"
import { tokenDeColor } from "@shared/utils/color"
import { inicialesDe } from "@shared/utils/iniciales"
import type { Ganancia, ResumenNomina } from "@features/nomina/types/nomina.types"
import { comisionEfectiva } from "@features/nomina/utils/periodo"
import { useFormato } from "@shared/hooks/useFormato"
import { useTextos } from "@shared/textos/useTextos"

interface NominaBarberoDetailProps {
  fila: ResumenNomina
  /** Los asientos del MISMO rango que el resumen. */
  asientos: Ganancia[]
  loadingAsientos: boolean
  etiquetaPeriodo: string
  /** `ganancias.ajustar`: capacidad propia, no viene con ver la nómina. */
  puedeAjustar: boolean
  onAjustar: () => void
}

export function NominaBarberoDetail({
  fila,
  asientos,
  loadingAsientos,
  etiquetaPeriodo,
  puedeAjustar,
  onAjustar,
}: NominaBarberoDetailProps) {
  const t = useTextos("nomina.detalle")
  const tNomina = useTextos("nomina")
  const { dinero, fechaHora, porcentaje } = useFormato()

  const nombre = fila.barbero?.nombrePublico ?? tNomina("retirado")
  const color = tokenDeColor(fila.barbero?.indiceColor ?? 0)
  const comision = comisionEfectiva(fila.produccionCentavos, fila.comisionCentavos)

  const desglose = [
    {
      concepto: t("produccion"),
      detalle: t("produccionDetalle"),
      centavos: fila.produccionCentavos,
    },
    {
      concepto:
        comision === null ? t("comision") : t("comisionCon", { porcentaje: porcentaje(comision) }),
      detalle: t("comisionDetalle"),
      centavos: fila.comisionCentavos,
    },
    { concepto: t("propinas"), detalle: t("propinasDetalle"), centavos: fila.propinasCentavos },
    // Solo si las hay: una fila en cero invita a preguntar qué se corrigió.
    ...(fila.ajustesCentavos !== "0"
      ? [{ concepto: t("ajustes"), detalle: t("ajustesDetalle"), centavos: fila.ajustesCentavos }]
      : []),
  ]

  return (
    <Card className="gap-5 py-5">
      <div className="flex items-center gap-3 px-5">
        <InitialsAvatar iniciales={inicialesDe(nombre)} color={color} tamano="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{nombre}</p>
          <p className="text-xs text-muted-foreground">{etiquetaPeriodo}</p>
        </div>
        {/* La única escritura de esta pantalla, y va aquí porque es donde se ve
            la cifra que hay que corregir. Sin `ganancias.ajustar` ni aparece:
            mirar la nómina lo hace cualquiera que administre, escribir en ella
            deja una fila que nadie puede borrar. */}
        {puedeAjustar && (
          <Button type="button" variant="outline" size="sm" onClick={onAjustar}>
            <Plus className="size-4" aria-hidden />
            Ajustar
          </Button>
        )}
      </div>

      <div className="px-5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("concepto")}</TableHead>
              <TableHead className="hidden sm:table-cell">{t("detalle")}</TableHead>
              <TableHead className="text-right">{t("monto")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {desglose.map((linea) => (
              <TableRow key={linea.concepto}>
                <TableCell className="font-medium">{linea.concepto}</TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">
                  {linea.detalle}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {dinero(Number(linea.centavos))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="border-t border-border px-5 pt-5">
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          Asientos del periodo
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            lo que sostiene cada cifra
          </span>
        </h3>
        <Loadable
          loading={loadingAsientos}
          isEmpty={asientos.length === 0}
          variant="table"
          emptyState={
            <p className="py-8 text-center text-sm text-muted-foreground">
              Este barbero no cerró ninguna cita en el periodo.
            </p>
          }
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("cuando")}</TableHead>
                  <TableHead>Qué</TableHead>
                  <TableHead className="hidden sm:table-cell">{t("cobrado")}</TableHead>
                  <TableHead className="text-right">{t("paraEl")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {asientos.map((asiento) => (
                  <TableRow key={asiento.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {fechaHora(asiento.ganadoEn)}
                    </TableCell>
                    <TableCell>
                      {asiento.descripcionCongelada ?? t(`tipos.${asiento.tipo}`)}
                    </TableCell>
                    <TableCell className="hidden tabular-nums sm:table-cell">
                      {dinero(Number(asiento.brutoCentavos))}
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {dinero(Number(asiento.montoCentavos))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Loadable>
      </div>

      <div className="mx-5 flex items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/10 p-4">
        <div>
          <p className="text-xs text-muted-foreground">Total a pagar a {nombre.split(" ")[0]}</p>
          <p className="mt-0.5 text-2xl font-bold text-primary tabular-nums">
            {dinero(Number(fila.totalCentavos))}
          </p>
        </div>
        {/* El pago es en efectivo y en persona: Barion no lo procesa ni lo
            concilia, así que aquí no hay botón que marque nada. */}
        <p className="max-w-40 text-right text-[11px] text-muted-foreground">
          Se paga en efectivo y en persona
        </p>
      </div>
    </Card>
  )
}
