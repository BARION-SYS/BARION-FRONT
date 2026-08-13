import { describe, expect, it } from "vitest"
import { anioEnCurso, rangoDeHoy, ultimosDias } from "@features/dashboard/utils/serie"

/**
 * Los rangos de reportes van en DÍAS y la api aplica el huso de la sede. Lo que
 * se fija aquí es que este lado no vuelva a mandar instantes ni a recortar el
 * último día: las dos cosas devuelven números que parecen buenos.
 */
describe("rangos de reportes", () => {
  const BOGOTA = "America/Bogota"

  it("hoy es un solo día, no un corte entre instantes", () => {
    const rango = rangoDeHoy(BOGOTA)

    expect(rango.desde).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    // Mismo día en los dos extremos: `hasta` es inclusive y la api cierra en la
    // medianoche del siguiente. Mandar el día de mañana pediría 48 horas.
    expect(rango.hasta).toBe(rango.desde)
  })

  it("los últimos 7 días incluyen hoy y sus seis anteriores", () => {
    const { desde, hasta } = ultimosDias(BOGOTA, 7)
    const dias = (Date.parse(`${hasta}T00:00:00Z`) - Date.parse(`${desde}T00:00:00Z`)) / 86_400_000

    expect(dias).toBe(6)
    expect(hasta).toBe(rangoDeHoy(BOGOTA).hasta)
  })

  it("un solo día pedido es hoy contra hoy", () => {
    const { desde, hasta } = ultimosDias(BOGOTA, 1)

    expect(desde).toBe(hasta)
  })

  it("la granularidad viaja solo cuando se pide", () => {
    expect(ultimosDias(BOGOTA, 30).granularidad).toBeUndefined()
    expect(ultimosDias(BOGOTA, 30, "semana").granularidad).toBe("semana")
  })

  it("el año en curso empieza el 1 de enero y agrupa por mes", () => {
    const { desde, granularidad } = anioEnCurso(BOGOTA)

    expect(desde.slice(4)).toBe("-01-01")
    expect(granularidad).toBe("mes")
  })
})
