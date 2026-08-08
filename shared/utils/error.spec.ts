import { describe, expect, it } from "vitest"
import { esMotivoConocido, getErrorMessage, motivoDeError } from "@shared/utils/error"

/**
 * El sobre de error de la api, que es contrato.
 *
 * `motivo` existe para que ninguna pantalla vuelva a distinguir dos casos
 * **comparando una frase en español** — un texto de copy convertido en contrato
 * por accidente deja de funcionar en cuanto alguien mejora el mensaje. Lo que se
 * prueba aquí es que la lista de motivos que este front sabe interpretar y la
 * que declara su tipo **no se separen**, porque el día que lo hagan una pantalla
 * dejará de ramificar sin que nada falle.
 */
const httpError = (extra: Record<string, unknown> = {}) => ({
  status: 401,
  message: "Tu verificación con Google caducó",
  ...extra,
})

describe("el mensaje que se enseña", () => {
  it("sale del sobre de la api cuando lo hay", () => {
    expect(getErrorMessage(httpError())).toBe("Tu verificación con Google caducó")
  })

  it("aguanta lo que no es un error de la api", () => {
    expect(getErrorMessage(new Error("se rompió"))).toBe("se rompió")
    expect(getErrorMessage("texto suelto")).toBe("texto suelto")
    expect(getErrorMessage(undefined)).toBe("Ocurrió un error inesperado")
  })
})

describe("el motivo por el que se ramifica", () => {
  it("lo devuelve cuando la api lo manda", () => {
    expect(motivoDeError(httpError({ motivo: "preregistro_invalido" }))).toBe(
      "preregistro_invalido"
    )
  })

  it("«no lo dijo» no es lo mismo que «no hay»", () => {
    // La api puede ir por detrás del despliegue del front, así que quien
    // ramifique con esto tiene que tener camino para cuando falte.
    expect(motivoDeError(httpError())).toBeUndefined()
    expect(motivoDeError(new Error("x"))).toBeUndefined()
  })

  it("descarta un motivo que esta versión no entiende", () => {
    // El catálogo crece con el sistema, y ramificar por un valor desconocido
    // haría algo peor que no ramificar.
    expect(esMotivoConocido("motivo_del_futuro")).toBe(false)
    expect(esMotivoConocido(42)).toBe(false)
  })

  it("reconoce los cuatro que hoy consume alguna pantalla", () => {
    for (const motivo of [
      "falta_puntaje",
      "requiere_confirmacion",
      "token_invalido",
      "preregistro_invalido",
    ]) {
      expect(esMotivoConocido(motivo)).toBe(true)
    }
  })
})
