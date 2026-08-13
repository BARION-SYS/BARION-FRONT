import { afterEach, describe, expect, it, vi } from "vitest"
import { pasaLuhn, soloDigitos, tarjetaVencida } from "@features/pagos/utils/tarjeta"

/**
 * Lo que se comprueba de una tarjeta ANTES de mandarla a la pasarela.
 *
 * No es seguridad —la pasarela valida igual—: es que un token es de un solo uso,
 * así que un dedazo detectado aquí se corrige junto al campo y detectado allá
 * obliga a teclearlo todo otra vez.
 *
 * Lo que se prueba es lo que decide **rechazar**: un falso positivo aquí le dice
 * a alguien que su tarjeta buena no sirve, y esa persona no vuelve a intentarlo.
 */
describe("el número tecleado", () => {
  it("es el mismo con espacios, guiones o pegado del gestor", () => {
    expect(soloDigitos("4242 4242 4242 4242")).toBe("4242424242424242")
    expect(soloDigitos("4242-4242-4242-4242")).toBe("4242424242424242")
  })
})

describe("el dígito de control", () => {
  it("acepta números válidos de las marcas que se usan", () => {
    expect(pasaLuhn("4242424242424242")).toBe(true) // Visa de prueba
    expect(pasaLuhn("5031755734530604")).toBe(true) // Mastercard de prueba
  })

  it("caza el dedazo de un dígito, que es el error real", () => {
    expect(pasaLuhn("4242424242424243")).toBe(false)
  })

  it("un campo vacío no pasa", () => {
    // Sin el guarda de longitud la suma daría 0 y el módulo lo daría por bueno:
    // el formulario vacío se mandaría a la pasarela.
    expect(pasaLuhn("")).toBe(false)
  })
})

describe("la fecha de vencimiento", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  const enAgostoDe2026 = () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-08-13T12:00:00.000Z"))
  }

  it("el propio mes de expiración todavía sirve", () => {
    // Una tarjeta vence al TERMINAR su mes. Rechazarla el día 1 sería negarle
    // un mes de uso a una tarjeta buena.
    enAgostoDe2026()
    expect(tarjetaVencida("08", "26")).toBe(false)
  })

  it("el mes anterior ya no", () => {
    enAgostoDe2026()
    expect(tarjetaVencida("07", "26")).toBe(true)
  })

  it("el año anterior tampoco, aunque el mes sea posterior", () => {
    // El fallo de comparar solo el mes: 12/25 es pasado en agosto de 2026.
    enAgostoDe2026()
    expect(tarjetaVencida("12", "25")).toBe(true)
  })

  it("lo que no es un número no se declara vencido", () => {
    // A medio teclear no hay nada que decidir: quien avisa de un campo
    // incompleto es la validación del formulario, no esta función.
    enAgostoDe2026()
    expect(tarjetaVencida("ab", "cd")).toBe(false)
  })

  it("el campo vacío lo corta el schema antes, no esta función", () => {
    // Queda escrito porque sorprende: `Number("")` es 0, así que sola diría
    // «venció en el año 2000». No llega a decirlo — el regex de `expiraMes`
    // falla primero y la comprobación de objeto ni se ejecuta—, y por eso el
    // mensaje que se lee es «Mes en dos dígitos», que es el útil.
    enAgostoDe2026()
    expect(tarjetaVencida("", "")).toBe(true)
  })
})
