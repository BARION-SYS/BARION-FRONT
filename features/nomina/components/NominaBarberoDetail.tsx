"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import { ChartTooltip } from "@shared/components/charts/ChartTooltip"
import { Button } from "@shared/components/ui/button"
import { Card } from "@shared/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@shared/components/ui/table"
import type { NominaBarbero } from "@features/nomina/types/nomina.types"
import { formatNumber } from "@shared/utils/numbers"

interface Props {
  barbero: NominaBarbero
  etiquetaPeriodo: string
}

export function NominaBarberoDetail({ barbero, etiquetaPeriodo }: Props) {
  const desglose = [
    { concepto: "Producción", detalle: "100% ventas", monto: barbero.produccion },
    {
      concepto: `Comisión (${barbero.porcentajeComision}%)`,
      detalle: "A pagar",
      monto: barbero.comision,
    },
    { concepto: "Propinas", detalle: "Acumuladas", monto: barbero.propinas },
  ]

  return (
    <Card className="gap-5 py-5">
      <div className="flex items-center gap-3 px-5">
        <InitialsAvatar iniciales={barbero.iniciales} color={barbero.color} tamano="md" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{barbero.nombre}</p>
          <p className="text-xs text-muted-foreground">Producción diaria — {etiquetaPeriodo}</p>
        </div>
      </div>

      <div className="px-5">
        <ResponsiveContainer width="100%" height={160}>
          <BarChart
            data={barbero.produccionDiaria}
            margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            barSize={28}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="dia"
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              cursor={{ fill: "var(--border)", opacity: 0.35 }}
              content={
                <ChartTooltip formatear={(e) => `Producción: $${formatNumber(Number(e.value))}`} />
              }
            />
            <Bar
              dataKey="produccion"
              fill={barbero.color}
              radius={[6, 6, 0, 0]}
              name="produccion"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="border-t border-border px-5 pt-5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Concepto</TableHead>
              <TableHead>Detalle</TableHead>
              <TableHead className="text-right">Monto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {desglose.map((fila) => (
              <TableRow key={fila.concepto}>
                <TableCell className="font-medium">{fila.concepto}</TableCell>
                <TableCell className="text-muted-foreground">{fila.detalle}</TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  ${formatNumber(fila.monto)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mx-5 flex items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/10 p-4">
        <div>
          <p className="text-xs text-muted-foreground">
            Total a pagar a {barbero.nombre.split(" ")[0]}
          </p>
          <p className="mt-0.5 text-2xl font-bold text-primary tabular-nums">
            ${formatNumber(barbero.total)}
          </p>
        </div>
        <Button size="lg" className="cursor-pointer">
          Marcar como pagado
        </Button>
      </div>
    </Card>
  )
}
