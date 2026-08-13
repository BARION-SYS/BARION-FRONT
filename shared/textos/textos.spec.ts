import { describe, expect, it } from "vitest"
import { ETIQUETA_IDIOMA, IDIOMAS, IDIOMA_POR_REGION } from "@shared/textos/config"
import { regiones } from "@config/regiones"
import { esCO } from "@shared/textos/diccionarios/es-CO"
import { esES } from "@shared/textos/diccionarios/es-ES"
import { enUS } from "@shared/textos/diccionarios/en-US"
import { fusionar } from "@shared/textos/fusionar"

/**
 * El idioma, que falla de una forma muy concreta: **no revienta**.
 *
 * Una clave sin traducir enseña la frase en español a quien no lo habla, y eso
 * no aparece en ningún log. `tsc` ya impide que a `en-US` le falte una clave
 * —está declarado con el tipo del base—, así que lo que se prueba aquí es lo que
 * el compilador NO puede ver: que las listas no se separen y que la fusión del
 * español de España no borre nada por el camino.
 */
describe("las listas que se pueden separar", () => {
  it("cada mercado abierto tiene idioma", () => {
    // Añadir un país en `config/regiones.ts` y olvidar su idioma dejaría el
    // panel de ese mercado sin diccionario que elegir.
    for (const region of Object.keys(regiones)) {
      expect(IDIOMA_POR_REGION[region as keyof typeof regiones]).toBeDefined()
    }
  })

  it("cada idioma tiene nombre en el selector", () => {
    for (const idioma of IDIOMAS) {
      expect(ETIQUETA_IDIOMA[idioma]).toBeTruthy()
    }
  })

  it("el nombre de cada idioma está escrito EN ese idioma", () => {
    // No se traduce al idioma activo a propósito: quien tiene el panel en uno
    // que no entiende reconoce el suyo por cómo se escribe.
    expect(ETIQUETA_IDIOMA["en-US"]).toBe("English (US)")
    expect(ETIQUETA_IDIOMA["es-CO"]).toContain("Español")
  })
})

describe("los tres diccionarios tienen la misma forma", () => {
  const rutasDe = (d: typeof esCO) => Object.keys(d.navegacion.rutas).sort()

  it("ninguno se queda sin una entrada de navegación", () => {
    expect(rutasDe(enUS)).toEqual(rutasDe(esCO))
    expect(rutasDe(esES)).toEqual(rutasDe(esCO))
  })

  it("el inglés no arrastra frases en español", () => {
    // El caso que se cuela al añadir una clave: copiar el bloque del base y
    // traducir solo la mitad.
    expect(enUS.navbar.miPerfil).not.toBe(esCO.navbar.miPerfil)
    expect(enUS.navegacion.rutas.clientes.subtitulo).not.toBe(
      esCO.navegacion.rutas.clientes.subtitulo
    )
  })

  it("las frases con dato adentro lo colocan donde toca en cada idioma", () => {
    expect(esCO.navbar.sedeActiva("Centro")).toBe("Sede activa: Centro")
    expect(enUS.navbar.sedeActiva("Downtown")).toBe("Current location: Downtown")
  })

  it("el singular y el plural no se escriben igual", () => {
    expect(esCO.navbar.sinLeer(1)).toBe("Notificaciones, 1 sin leer")
    expect(esCO.navbar.sinLeer(4)).toBe("Notificaciones, 4 sin leer")
    expect(enUS.navbar.sinLeer(1)).toBe("Notifications, 1 unread")
  })
})

describe("España se escribe como diferencias, no como copia", () => {
  it("cambia lo que allí se dice de otra forma", () => {
    expect(esES.navegacion.rutas.sedes.etiqueta).toBe("Locales")
    expect(esES.navbar.sedeActiva("Gran Vía")).toBe("Local activo: Gran Vía")
  })

  it("hereda TODO lo que no toca", () => {
    // Esto es lo que hace que corregir una frase la corrija en los dos
    // mercados. Sin ello, el archivo que menos se abre se queda viejo.
    expect(esES.navbar.miPerfil).toBe(esCO.navbar.miPerfil)
    expect(esES.navegacion.rutas.nomina.subtitulo).toBe(esCO.navegacion.rutas.nomina.subtitulo)
  })
})

describe("la fusión", () => {
  it("entra en los objetos en vez de reemplazarlos enteros", () => {
    const base = { a: { uno: "1", dos: "2" }, b: "b" }
    expect(fusionar(base, { a: { dos: "DOS" } })).toEqual({ a: { uno: "1", dos: "DOS" }, b: "b" })
  })

  it("no toca el original", () => {
    const base = { a: { uno: "1" } }
    fusionar(base, { a: { uno: "otro" } })
    expect(base.a.uno).toBe("1")
  })

  it("sustituye una función entera: media frase traducida no significa nada", () => {
    const base = { saludo: (n: string) => `Hola ${n}` }
    expect(fusionar(base, { saludo: (n: string) => `Hey ${n}` }).saludo("Ana")).toBe("Hey Ana")
  })
})
