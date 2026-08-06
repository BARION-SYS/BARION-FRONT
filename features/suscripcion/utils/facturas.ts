import type { TonoEstado } from "@shared/types/ui.types"
import type { EstadoFactura, LineaFactura } from "@features/suscripcion/types/suscripcion.types"

/** Cómo se enseña cada estado del documento. Lo comparten la tabla y el detalle. */
export const ESTADO_FACTURA: Record<EstadoFactura, { etiqueta: string; tono: TonoEstado }> = {
  borrador: { etiqueta: "Borrador", tono: "neutro" },
  abierta: { etiqueta: "Pendiente", tono: "advertencia" },
  pagada: { etiqueta: "Pagada", tono: "exito" },
  anulada: { etiqueta: "Anulada", tono: "neutro" },
  incobrable: { etiqueta: "Incobrable", tono: "peligro" },
}

export interface DesgloseFactura {
  lineas: LineaFactura[]
  /**
   * Cuántas entradas no se pudieron leer. Se cuentan y se dicen en pantalla en
   * vez de descartarlas en silencio: una línea de dinero que desaparece sin
   * aviso deja al total sin explicación.
   */
  ilegibles: number
}

/**
 * El desglose llega como lo guardó quien emitió la factura, así que se
 * comprueba en vez de afirmarse: una aserción dejaría pasar cualquier forma
 * hasta que reventara al pintarla.
 */
export function lineasDeFactura(valor: unknown): DesgloseFactura {
  if (!Array.isArray(valor)) return { lineas: [], ilegibles: 0 }

  const lineas = valor.filter(esLinea)
  return { lineas, ilegibles: valor.length - lineas.length }
}

function esLinea(valor: unknown): valor is LineaFactura {
  if (typeof valor !== "object" || valor === null) return false

  const linea = valor as Record<string, unknown>
  return (
    typeof linea.concepto === "string" &&
    typeof linea.montoCentavos === "string" &&
    (linea.cantidad === undefined || typeof linea.cantidad === "number")
  )
}
