import { beforeEach, describe, expect, it } from "vitest"
import { IDIOMA_POR_REGION } from "@shared/textos/config"
import { REGION_DEFAULT, regionDePais } from "@config/regiones"
import { usePortalStore } from "@store/portal.store"

/**
 * De dónde sale el idioma del ESCAPARATE, que es distinto del panel.
 *
 * En el panel lo elige quien lo usa. En el portal no hay «quien lo usa» con
 * preferencia guardada —hay un cliente que entró por un enlace—, así que sale
 * del país de la barbería, que la api manda en su ficha.
 *
 * Lo que se prueba aquí es la cadena entera de esa decisión: que el país de la
 * api se traduzca a una región, que la región dé el idioma correcto, y que el
 * store se limpie al salir del portal. Es el fallo que no se ve probando en una
 * sola barbería: todo funciona hasta que existe la segunda, de otro país.
 */
describe("el idioma del escaparate sale de la barbería", () => {
  beforeEach(() => usePortalStore.getState().setRegion(null))

  it("cada país abierto lleva a su idioma", () => {
    expect(IDIOMA_POR_REGION[regionDePais("CO")!]).toBe("es-CO")
    expect(IDIOMA_POR_REGION[regionDePais("ES")!]).toBe("es-ES")
    expect(IDIOMA_POR_REGION[regionDePais("US")!]).toBe("en-US")
  })

  it("el país llega de la api y puede venir en minúsculas", () => {
    // Es un dato de fuera: se normaliza en vez de confiar en cómo llegue.
    expect(regionDePais("co")).toBe("CO")
  })

  it("un país que este panel no sabe pintar cae al respaldo, no revienta", () => {
    // Preferimos el escaparate en el idioma base a una pantalla en blanco.
    expect(regionDePais("FR")).toBeUndefined()
    expect(IDIOMA_POR_REGION[regionDePais("FR") ?? REGION_DEFAULT]).toBe("es-CO")
  })

  it("fuera del portal la región es nula, para que el panel no se vea afectado", () => {
    expect(usePortalStore.getState().region).toBeNull()
  })

  it("no se guarda entre visitas: la siguiente barbería no hereda el país de la anterior", () => {
    usePortalStore.getState().setRegion("ES")
    expect(usePortalStore.getState().region).toBe("ES")

    // Lo que escribe cada página al montar.
    usePortalStore.getState().setRegion("CO")
    expect(usePortalStore.getState().region).toBe("CO")

    // Y la comprobación que de verdad protege: este store NO lleva `persist`, a
    // diferencia de `idioma.store` y `marca.store`. Si lo llevara, el escaparate
    // de una barbería colombiana arrancaría en español de España por haber
    // visitado antes el de una madrileña — y eso no se ve probando con una sola.
    expect("persist" in usePortalStore).toBe(false)
  })
})
