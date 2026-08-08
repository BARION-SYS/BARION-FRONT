import { describe, expect, it } from "vitest"
import { formatMoney, toMajorUnits, toMinorUnits } from "@shared/utils/currency"

/**
 * El dinero, que es donde un fallo se paga en dinero.
 *
 * **Estas pruebas existen por un caso concreto que ya ocurrió**: se usaba
 * «cuántos decimales se ENSEÑAN» como si fuera «en qué unidad se GUARDA». Como
 * el peso colombiano se enseña sin decimales, el importe no se dividía nunca y
 * todo el panel leía cien veces más grande — un corte de $35.000 salía
 * «$ 3.500.000»—; y al revés, guardar un plan de $89.000 lo habría escrito como
 * $890. `tsc --noEmit` no puede ver nada de eso: los dos son `number`.
 *
 * Por eso el primer bloque es la separación de las dos tablas, y no el formato.
 */
describe("la escala y los decimales son dos cosas distintas", () => {
  it("divide el peso colombiano aunque se enseñe sin decimales", () => {
    // El caso exacto del fallo: 0 decimales visibles, escala 2.
    expect(toMajorUnits(8_900_000, "COP")).toBe(89_000)
    expect(toMajorUnits(3_500_000, "COP")).toBe(35_000)
  })

  it("divide igual las monedas que sí enseñan decimales", () => {
    expect(toMajorUnits(8_900_000, "USD")).toBe(89_000)
    expect(toMajorUnits(1_50, "EUR")).toBe(1.5)
  })

  it("escala una moneda desconocida como la mayoría en vez de reventar", () => {
    // Un mercado nuevo puede llegar del catálogo antes que su entrada en la
    // tabla. Lo peor que puede pasar es que se lea raro un día.
    expect(toMajorUnits(1_00, "MXN")).toBe(1)
    expect(() => toMajorUnits(1_00, "MXN")).not.toThrow()
  })
})

describe("volver a la unidad menor", () => {
  it("convierte lo que se teclea en pesos a lo que acepta la API", () => {
    expect(toMinorUnits(89_000, "COP")).toBe(8_900_000)
  })

  it("redondea en vez de arrastrar el error del binario", () => {
    // 19.99 * 100 da 1998.9999999999998 en coma flotante: sin redondear
    // llegaría a la base un centavo de menos.
    expect(toMinorUnits(19.99, "USD")).toBe(1_999)
    expect(toMinorUnits(0.1 + 0.2, "USD")).toBe(30)
  })

  it("es la inversa exacta de bajar a unidad mayor", () => {
    for (const centavos of [0, 1, 99, 8_900_000, 123_456_789]) {
      expect(toMinorUnits(toMajorUnits(centavos, "COP"), "COP")).toBe(centavos)
    }
  })
})

describe("el importe que se lee", () => {
  it("enseña el peso colombiano sin decimales y con su símbolo", () => {
    const leido = formatMoney(8_900_000, "COP", "es-CO")
    expect(leido).toContain("89.000")
    expect(leido).not.toContain(",00")
  })

  it("enseña el dólar con dos decimales", () => {
    expect(formatMoney(1_999, "USD", "en-US")).toBe("$19.99")
  })

  it("no depende de los datos de moneda del entorno", () => {
    // El motivo por el que los decimales se declaran en el repo y se le imponen
    // al formateador: cada versión de ICU trae los suyos, y servidor y navegador
    // no comparten versión. Un texto distinto en cada lado descarta la
    // hidratación y repinta el árbol entero.
    expect(formatMoney(1_280_000_00, "COP", "es-CO")).not.toContain(",00")
  })

  it("formatea el cero, que es un importe legítimo", () => {
    expect(formatMoney(0, "COP", "es-CO")).toContain("0")
  })

  it("formatea una moneda que este front todavía no opera", () => {
    expect(() => formatMoney(1_00, "MXN", "es-CO")).not.toThrow()
  })
})
