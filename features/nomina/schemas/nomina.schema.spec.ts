import { describe, expect, it } from "vitest"
import { esquemaAjuste } from "@features/nomina/schemas/nomina.schema"

/**
 * Lo que se exige antes de tocar la nómina de alguien.
 *
 * El asiento es inmutable: una vez escrito, el único arreglo es otro asiento. Lo
 * que esta validación evita es justamente lo que después no se puede deshacer —
 * un ajuste sin motivo, que meses después es un número que nadie sabe defender,
 * y un cero, que no corrige nada y ensucia el histórico.
 */
const valido = {
  barberoId: "0b1f5a2c-3d4e-4f60-8a9b-0c1d2e3f4a5b",
  monto: "-15000",
  motivo: "Propina cargada de más en el corte BRN-4F2A9C",
}

describe("un ajuste de nómina", () => {
  it("acepta el caso normal: descontar con su explicación", () => {
    expect(esquemaAjuste.safeParse(valido).success).toBe(true)
  })

  it("acepta también sumar", () => {
    expect(esquemaAjuste.safeParse({ ...valido, monto: "20000" }).success).toBe(true)
  })

  it("rechaza el cero, que no corrige nada", () => {
    expect(esquemaAjuste.safeParse({ ...valido, monto: "0" }).success).toBe(false)
  })

  it("rechaza lo que no es un número", () => {
    // Llegaría al `Number()` de la pantalla y se convertiría en un `NaN`
    // centavos que la api rechaza con un 422 sin decir dónde.
    expect(esquemaAjuste.safeParse({ ...valido, monto: "mil" }).success).toBe(false)
  })

  it("exige el motivo, y con algo escrito", () => {
    expect(esquemaAjuste.safeParse({ ...valido, motivo: "" }).success).toBe(false)
    expect(esquemaAjuste.safeParse({ ...valido, motivo: "ok" }).success).toBe(false)
  })

  it("exige a quién se le ajusta, y que sea un identificador de verdad", () => {
    expect(esquemaAjuste.safeParse({ ...valido, barberoId: "el-de-siempre" }).success).toBe(false)
  })

  it("la fecha es opcional, y vacía significa hoy", () => {
    // Vacía no viaja: la api la resuelve. Mandarla como cadena vacía sería un
    // 422 en el borde por un campo que nadie rellenó a propósito.
    const sinFecha = esquemaAjuste.safeParse({ ...valido, ganadoEn: "" })
    expect(sinFecha.success).toBe(true)
    expect(sinFecha.data?.ganadoEn).toBeUndefined()
  })

  it("acepta una fecha pasada, que es para lo que existe", () => {
    // Una corrección de la quincena pasada tiene que caer en la quincena
    // pasada, o aquel resumen sigue dando el número equivocado.
    const conFecha = esquemaAjuste.safeParse({ ...valido, ganadoEn: "2026-07-31" })
    expect(conFecha.success).toBe(true)
    expect(conFecha.data?.ganadoEn).toBe("2026-07-31")
  })
})
