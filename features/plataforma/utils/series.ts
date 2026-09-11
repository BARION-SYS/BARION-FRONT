import type {
  CitasPorEstado,
  FacturacionPlataforma,
  MesFacturacion,
} from "@features/plataforma/types/plataforma.types"

/**
 * Las series de la plataforma llegan cortadas en UTC: cada punto es el instante
 * en que empieza su mes o su semana. Todo lo de aquí razona en UTC por eso — en
 * la hora de Bogotá, el 1 de septiembre a medianoche UTC es todavía agosto.
 */

/** Clave estable de un mes: `2026-09`. */
export function claveMes(instante: string): string {
  return instante.slice(0, 7)
}

/** Los `n` meses hasta el de `ahora`, incluido, como instantes UTC del día 1. */
export function mesesHasta(ahora: Date, n: number): string[] {
  const anio = ahora.getUTCFullYear()
  const mes = ahora.getUTCMonth()
  return Array.from({ length: n }, (_, i) =>
    new Date(Date.UTC(anio, mes - (n - 1 - i), 1)).toISOString()
  )
}

/**
 * Cuántas barberías había al CIERRE de cada mes, reconstruido hacia atrás desde
 * el total de hoy: lo que había al final de un mes es el total menos todo lo que
 * entró después. Devuelve una cifra por mes, en el mismo orden.
 *
 * Solo sirve para la tendencia: las altas cuentan todas, también las que hoy
 * están suspendidas, que es lo que se quiere al preguntar cuánto se ha vendido.
 */
export function inventarioAlCierre(totalHoy: number, altasPorMes: number[]): number[] {
  const alCierre: number[] = []
  let posteriores = 0
  for (let i = altasPorMes.length - 1; i >= 0; i--) {
    alCierre.unshift(totalHoy - posteriores)
    posteriores += altasPorMes[i]
  }
  return alCierre
}

export interface PuntoFacturacion {
  mes: string
  emitido: number
  cobrado: number
  facturas: number
}

/**
 * La serie de UNA moneda, con los meses sin movimiento en cero.
 *
 * La api solo manda los meses con facturas en esa moneda —rellenar cada moneda
 * posible inventaría monedas—; aquí, dentro de una moneda que sí existe, un mes
 * sin facturas es un cero de verdad y se pinta.
 */
export function serieDeMoneda(
  filas: MesFacturacion[],
  moneda: string,
  meses: string[]
): PuntoFacturacion[] {
  const porMes = new Map(
    filas.filter((fila) => fila.moneda === moneda).map((fila) => [claveMes(fila.mes), fila])
  )
  return meses.map((mes) => {
    const fila = porMes.get(claveMes(mes))
    return {
      mes,
      // Frontera del bigint: la api los manda como cadena y aquí se vuelven
      // número. Cabe de sobra: 2^53 centavos son noventa billones de pesos.
      emitido: fila ? Number(fila.emitidoCentavos) : 0,
      cobrado: fila ? Number(fila.cobradoCentavos) : 0,
      facturas: fila?.facturas ?? 0,
    }
  })
}

/**
 * Las monedas con algo que enseñar, ordenadas por lo facturado. La primera es
 * la que se abre por defecto: la del mercado principal.
 */
export function monedasFacturadas(facturacion: FacturacionPlataforma): string[] {
  const peso = new Map<string, number>()
  for (const fila of facturacion.serie) {
    peso.set(fila.moneda, (peso.get(fila.moneda) ?? 0) + Number(fila.emitidoCentavos))
  }
  for (const fila of facturacion.cartera) {
    if (!peso.has(fila.moneda)) peso.set(fila.moneda, 0)
  }
  return [...peso.entries()].sort((a, b) => b[1] - a[1]).map(([moneda]) => moneda)
}

// ── En qué terminaron las citas ──────────────────────────────────────────────

/**
 * Cuatro desenlaces y no los ocho estados de la cita: lo que importa es si se
 * atendió, si se cayó, si no vino nadie —o si nadie la cerró—.
 *
 * `sin_cerrar` son citas que ya pasaron y siguen como reservadas o confirmadas.
 * No es un fallo de la api: es una barbería que agenda en Barion pero no marca
 * lo que pasó, y eso deja sin sentido la nómina y las estadísticas.
 */
export type Desenlace = "atendidas" | "canceladas" | "no_asistio" | "sin_cerrar"

const DESENLACE_DE_ESTADO: Record<string, Desenlace> = {
  completada: "atendidas",
  cancelada: "canceladas",
  no_asistio: "no_asistio",
}

export interface ResumenDesenlace {
  total: number
  partes: Record<Desenlace, number>
}

export function resumirDesenlaces(estados: CitasPorEstado[]): ResumenDesenlace {
  const partes: Record<Desenlace, number> = {
    atendidas: 0,
    canceladas: 0,
    no_asistio: 0,
    sin_cerrar: 0,
  }
  let total = 0
  for (const { estado, total: cuantas } of estados) {
    partes[DESENLACE_DE_ESTADO[estado] ?? "sin_cerrar"] += cuantas
    total += cuantas
  }
  return { total, partes }
}
