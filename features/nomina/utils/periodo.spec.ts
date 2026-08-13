import { afterEach, describe, expect, it, vi } from "vitest"
import {
  comisionEfectiva,
  participacionDe,
  rangoDe,
  sumarCentavos,
  totalesDe,
} from "@features/nomina/utils/periodo"

/**
 * La nómina, que es dinero que alguien cobra.
 *
 * Dos cosas se prueban aquí y las dos ya se han roto en algún sistema:
 *
 * - **Sumar importes con `Number`.** Los centavos viajan en cadena a propósito;
 *   pasarlos por punto flotante los redondea justo donde no se puede.
 * - **Un rango que no cubre el día entero.** El `hasta` es exclusivo —el inicio
 *   del día siguiente—: uno inclusivo perdería lo que se ganó a las 23:59, y
 *   nadie lo nota hasta que un barbero reclama su último corte.
 */
describe("sumar centavos sin punto flotante", () => {
  it("suma importes que en coma flotante se irían", () => {
    // 0.1 + 0.2 en pesos: en `Number` daría 30000.000000000004.
    expect(sumarCentavos(["10000", "20000"])).toBe("30000")
  })

  it("aguanta importes por encima del entero seguro de JavaScript", () => {
    // Nueve mil billones de centavos no es un caso real, pero es la frontera
    // donde `Number` empieza a mentir en silencio. `BigInt` no.
    expect(sumarCentavos(["9007199254740993", "1"])).toBe("9007199254740994")
  })

  it("trata la cadena vacía como cero en vez de reventar", () => {
    // La api no la manda, pero una fila a medio construir en el front sí.
    expect(sumarCentavos(["", "500"])).toBe("500")
  })

  it("suma los negativos, que es lo que hace un ajuste que descuenta", () => {
    expect(sumarCentavos(["50000", "-15000"])).toBe("35000")
  })

  it("de una lista vacía sale cero, no vacío", () => {
    expect(sumarCentavos([])).toBe("0")
  })
})

describe("los totales del equipo", () => {
  it("suma columna a columna sin mezclarlas", () => {
    const filas = [
      {
        produccionCentavos: "100000",
        comisionCentavos: "50000",
        propinasCentavos: "5000",
        totalCentavos: "55000",
      },
      {
        produccionCentavos: "200000",
        comisionCentavos: "80000",
        propinasCentavos: "0",
        totalCentavos: "80000",
      },
    ]

    expect(totalesDe(filas)).toEqual({
      produccionCentavos: "300000",
      comisionesCentavos: "130000",
      propinasCentavos: "5000",
      totalCentavos: "135000",
    })
  })
})

describe("el porcentaje que se le queda al barbero", () => {
  it("sale de lo liquidado, no de su ficha", () => {
    expect(comisionEfectiva("100000", "50000")).toBe(50)
    expect(comisionEfectiva("300000", "100000")).toBe(33.33)
  })

  it("sin producción devuelve null, que NO es un cero por ciento", () => {
    // Un 0 % se lee como «a este no le pagan». Lo que hay es ausencia de dato.
    expect(comisionEfectiva("0", "0")).toBeNull()
  })
})

describe("la participación en la producción del equipo", () => {
  it("reparte sobre el total del equipo", () => {
    expect(participacionDe("25000", "100000")).toBe(25)
  })

  it("con el equipo en cero es cero, no null: es una barra que se pinta", () => {
    expect(participacionDe("0", "0")).toBe(0)
  })
})

describe("el rango de un período", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  // Un miércoles, ya de noche en Bogotá.
  const anclar = () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-08-12T20:00:00.000Z"))
  }

  it("la semana empieza el lunes de la sede y termina mañana", () => {
    anclar()
    // Bogotá es UTC-5: el lunes local arranca a las 05:00Z y el `hasta` es el
    // inicio del jueves, no el del miércoles — o se perdería el día en curso.
    expect(rangoDe("semana", "America/Bogota", 1)).toEqual({
      desde: "2026-08-10T05:00:00.000Z",
      hasta: "2026-08-13T05:00:00.000Z",
    })
  })

  it("con semana de domingo el arranque se corre, y el fin no", () => {
    anclar()
    const rango = rangoDe("semana", "America/Bogota", 0)
    expect(rango.desde).toBe("2026-08-09T05:00:00.000Z")
    expect(rango.hasta).toBe("2026-08-13T05:00:00.000Z")
  })

  it("el mes arranca en su día 1 local", () => {
    anclar()
    expect(rangoDe("mes", "America/Bogota", 1).desde).toBe("2026-08-01T05:00:00.000Z")
  })

  it("el año arranca el 1 de enero local", () => {
    anclar()
    expect(rangoDe("anio", "America/Bogota", 1).desde).toBe("2026-01-01T05:00:00.000Z")
  })

  it("el mismo instante da OTRO mes según el huso de la sede", () => {
    // 20:00Z del 12 son las 15:00 en Bogotá y las 22:00 en Madrid: mismo día.
    // Pero a las 02:00Z del 1 de septiembre, Madrid ya está en septiembre y
    // Bogotá sigue en agosto — y la nómina del mes no es la misma.
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-09-01T02:00:00.000Z"))

    expect(rangoDe("mes", "Europe/Madrid", 1).desde).toBe("2026-08-31T22:00:00.000Z")
    expect(rangoDe("mes", "America/Bogota", 1).desde).toBe("2026-08-01T05:00:00.000Z")
  })
})
