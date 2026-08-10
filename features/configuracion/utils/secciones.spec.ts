/**
 * El apartado activo se lee del CAMINO, así que lo que se fija aquí es que un
 * camino que este repo no conoce **caiga en el apartado por defecto** en vez de
 * dejar el menú sin nada marcado.
 *
 * Y que la dirección que se construye sea la que la api usa para devolver a quien
 * acaba de pagar: si las dos se separan, el retorno del checkout aterriza en el
 * apartado equivocado y nada falla — solo queda raro.
 */
import { describe, expect, it } from "vitest"
import { rutaDeSeccion, seccionDesdePathname } from "@features/configuracion/utils/secciones"

describe("seccionDesdePathname", () => {
  it("respeta un apartado que existe", () => {
    expect(seccionDesdePathname("/dashboard/configuracion/plan")).toBe("plan")
    expect(seccionDesdePathname("/dashboard/configuracion/seguridad")).toBe("seguridad")
  })

  it("la ruta padre marca el apartado por el que se entra", () => {
    // Es a donde redirige, así que enseñarlo marcado es lo que va a pasar.
    expect(seccionDesdePathname("/dashboard/configuracion")).toBe("general")
  })

  it("la barra final no cambia el apartado", () => {
    expect(seccionDesdePathname("/dashboard/configuracion/")).toBe("general")
    expect(seccionDesdePathname("/dashboard/configuracion/plan/")).toBe("plan")
  })

  it("un apartado inventado no deja el menú sin nada marcado", () => {
    expect(seccionDesdePathname("/dashboard/configuracion/facturacion")).toBe("general")
  })

  it("distingue mayúsculas: el identificador es el de la lista, no una etiqueta", () => {
    expect(seccionDesdePathname("/dashboard/configuracion/Plan")).toBe("general")
  })

  it("una ruta de otra pantalla no se interpreta como un apartado", () => {
    expect(seccionDesdePathname("/dashboard/citas")).toBe("general")
  })
})

describe("rutaDeSeccion", () => {
  it("es la dirección a la que la api devuelve tras pagar", () => {
    // La api construye `…/dashboard/configuracion/plan?pago=<referencia>`.
    // Este es su lado del contrato: el apartado va en el camino.
    expect(rutaDeSeccion("plan")).toBe("/dashboard/configuracion/plan")
  })

  it("lo que construye es lo que se sabe leer", () => {
    expect(seccionDesdePathname(rutaDeSeccion("notificaciones"))).toBe("notificaciones")
  })
})
