import { describe, expect, it } from "vitest"
import { regionDePais, regiones, REGION_DEFAULT } from "@config/regiones"

/**
 * Traducir el país que devuelve la api a una región que este repo conoce.
 *
 * Es una función de tres líneas y se prueba porque **su caso interesante es el
 * que devuelve `undefined`**: `barberias.codigo_pais` es un `char(2)` sin lista
 * cerrada, así que la api puede devolver un país que aquí no está declarado. De
 * eso depende el indicativo telefónico que se le sugiere a alguien, y un
 * indicativo sugerido MAL se acepta sin mirar y deja un teléfono al que nadie
 * contesta — mientras que uno en blanco se elige de la lista en un gesto.
 */
describe("el país de la api traducido a región", () => {
  it("reconoce los países que Barion opera", () => {
    expect(regionDePais("CO")).toBe("CO")
    expect(regionDePais("ES")).toBe("ES")
    expect(regionDePais("US")).toBe("US")
  })

  it("acepta el código en minúscula", () => {
    expect(regionDePais("co")).toBe("CO")
  })

  it("NO cae a Colombia con un país que no se declara", () => {
    // El caso que justifica la función: preferimos no sugerir indicativo a
    // sugerir el equivocado.
    expect(regionDePais("MX")).toBeUndefined()
    expect(regionDePais("FR")).toBeUndefined()
  })

  it("trata la ausencia como país desconocido", () => {
    expect(regionDePais(null)).toBeUndefined()
    expect(regionDePais(undefined)).toBeUndefined()
    expect(regionDePais("")).toBeUndefined()
  })

  it("cada región declara su indicativo, y son distintos entre sí", () => {
    const prefijos = Object.values(regiones).map((r) => r.prefijoTelefonico)
    expect(prefijos.every((p) => p.startsWith("+"))).toBe(true)
    expect(new Set(prefijos).size).toBe(prefijos.length)
  })

  it("la región base está declarada", () => {
    expect(regiones[REGION_DEFAULT]).toBeDefined()
  })
})
