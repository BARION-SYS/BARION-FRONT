import { describe, expect, it } from "vitest"
import {
  inventarioAlCierre,
  mesesHasta,
  monedasFacturadas,
  resumirDesenlaces,
  serieDeMoneda,
} from "@features/plataforma/utils/series"

describe("los meses de una serie", () => {
  it("cuenta hacia atrás en UTC e incluye el mes en curso", () => {
    // Medianoche UTC del 1 de septiembre: en Bogotá todavía es agosto, y la
    // serie tiene que decir septiembre igual.
    expect(mesesHasta(new Date("2026-09-01T00:00:00.000Z"), 3)).toEqual([
      "2026-07-01T00:00:00.000Z",
      "2026-08-01T00:00:00.000Z",
      "2026-09-01T00:00:00.000Z",
    ])
  })

  it("cruza el cambio de año", () => {
    expect(mesesHasta(new Date("2026-01-15T00:00:00.000Z"), 2)).toEqual([
      "2025-12-01T00:00:00.000Z",
      "2026-01-01T00:00:00.000Z",
    ])
  })
})

describe("el inventario al cierre de cada mes", () => {
  it("resta hacia atrás lo que entró después", () => {
    // Hoy hay 10; este mes entraron 2 y el anterior 3.
    expect(inventarioAlCierre(10, [1, 3, 2])).toEqual([5, 8, 10])
  })
})

describe("la facturación por moneda", () => {
  const facturacion = {
    serie: [
      {
        mes: "2026-08-01T00:00:00.000Z",
        moneda: "COP",
        facturas: 2,
        emitidoCentavos: "17800000",
        cobradoCentavos: "8900000",
      },
      {
        mes: "2026-08-01T00:00:00.000Z",
        moneda: "EUR",
        facturas: 1,
        emitidoCentavos: "2900",
        cobradoCentavos: "0",
      },
    ],
    cartera: [
      {
        moneda: "USD",
        facturas: 1,
        pendienteCentavos: "4900",
        vencidas: 0,
        vencidoCentavos: "0",
      },
    ],
  }

  it("rellena con ceros los meses sin movimiento dentro de la moneda", () => {
    const serie = serieDeMoneda(facturacion.serie, "COP", [
      "2026-07-01T00:00:00.000Z",
      "2026-08-01T00:00:00.000Z",
    ])
    expect(serie).toEqual([
      { mes: "2026-07-01T00:00:00.000Z", emitido: 0, cobrado: 0, facturas: 0 },
      { mes: "2026-08-01T00:00:00.000Z", emitido: 17_800_000, cobrado: 8_900_000, facturas: 2 },
    ])
  })

  it("ordena las monedas por lo facturado e incluye las que solo tienen cartera", () => {
    expect(monedasFacturadas(facturacion)).toEqual(["COP", "EUR", "USD"])
  })
})

describe("en qué terminaron las citas", () => {
  it("agrupa los estados abiertos como citas sin cerrar", () => {
    const resumen = resumirDesenlaces([
      { estado: "completada", total: 80 },
      { estado: "cancelada", total: 10 },
      { estado: "no_asistio", total: 4 },
      { estado: "reservada", total: 5 },
      { estado: "confirmada", total: 1 },
    ])
    expect(resumen).toEqual({
      total: 100,
      partes: { atendidas: 80, canceladas: 10, no_asistio: 4, sin_cerrar: 6 },
    })
  })
})
