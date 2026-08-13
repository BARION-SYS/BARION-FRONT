import { afterEach, describe, expect, it, vi } from "vitest"
import { hoyLocal, semanaDe, sumarDias, ventanaDe } from "@features/citas/utils/semana"

/**
 * Los días de la agenda.
 *
 * Aquí no hay instantes: son fechas locales de la SEDE. Un fallo en esta
 * aritmética no se ve como un error, se ve como citas que aparecen en el día
 * equivocado — y quien lo mira culpa a la agenda, no a esta función.
 *
 * Los dos sitios donde una fecha se rompe de verdad son los bordes: el cambio de
 * mes y el de año. Están abajo con nombre propio.
 */
describe("sumar días a una fecha local", () => {
  it("cruza el fin de mes", () => {
    expect(sumarDias("2026-01-31", 1)).toBe("2026-02-01")
  })

  it("cuenta el 29 de febrero en un año bisiesto", () => {
    // 2028 lo es; 2026 no. Si la aritmética fuera «mes + 1» el bisiesto se
    // perdería y la agenda saltaría un día entero de citas.
    expect(sumarDias("2028-02-28", 1)).toBe("2028-02-29")
    expect(sumarDias("2026-02-28", 1)).toBe("2026-03-01")
  })

  it("cruza el fin de año en los dos sentidos", () => {
    expect(sumarDias("2026-12-31", 1)).toBe("2027-01-01")
    expect(sumarDias("2026-01-01", -1)).toBe("2025-12-31")
  })
})

describe("la semana que se pinta empieza donde la sede la empieza", () => {
  it("con lunes como primer día, un miércoles arranca en su lunes", () => {
    // 2026-08-12 es miércoles.
    expect(semanaDe("2026-08-12", 1)).toEqual([
      "2026-08-10",
      "2026-08-11",
      "2026-08-12",
      "2026-08-13",
      "2026-08-14",
      "2026-08-15",
      "2026-08-16",
    ])
  })

  it("con domingo como primer día, la MISMA fecha cae en otra semana", () => {
    // El caso que justifica que `inicioSemana` venga de la sede: en EE. UU. la
    // semana del mismo miércoles empieza dos días antes.
    expect(semanaDe("2026-08-12", 0)[0]).toBe("2026-08-09")
  })

  it("un domingo con semana de lunes es el ÚLTIMO día, no el primero", () => {
    // El error clásico del `% 7`: sin el `+7` el domingo se coloca al principio
    // y la semana entera se corre siete días.
    const semana = semanaDe("2026-08-16", 1)
    expect(semana[6]).toBe("2026-08-16")
    expect(semana[0]).toBe("2026-08-10")
  })

  it("siempre devuelve siete días consecutivos, aunque cruce el año", () => {
    const semana = semanaDe("2027-01-01", 1)
    expect(semana).toHaveLength(7)
    expect(semana[0]).toBe("2026-12-28")
    expect(semana[6]).toBe("2027-01-03")
  })
})

describe("la ventana que se le pide a la api", () => {
  it("pide un día antes y dos después de lo que se va a pintar", () => {
    // La holgura no es un lujo: la ventana se calcula sin saber el huso de la
    // sede, y sin ella se perderían las citas de los bordes. Lo que sobra se
    // descarta al pintar.
    expect(ventanaDe(["2026-08-10", "2026-08-16"])).toEqual({
      desde: "2026-08-09T00:00:00.000Z",
      hasta: "2026-08-18T00:00:00.000Z",
    })
  })
})

describe("el día de hoy es el de la sede, no el del navegador", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("las 3 de la mañana en Madrid son todavía el día anterior en Bogotá", () => {
    // El caso que rompe la agenda de una barbería colombiana mirada desde
    // España: son dos fechas distintas en el mismo instante.
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-08-13T01:00:00.000Z"))

    expect(hoyLocal("Europe/Madrid")).toBe("2026-08-13")
    expect(hoyLocal("America/Bogota")).toBe("2026-08-12")
  })
})
