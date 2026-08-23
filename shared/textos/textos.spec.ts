import { describe, expect, it } from "vitest"
import { createTranslator } from "next-intl"
import { ETIQUETA_IDIOMA, IDIOMAS, IDIOMA_POR_REGION } from "@shared/textos/config"
import { regiones } from "@config/regiones"
import { mensajesEnUS, mensajesEsCO, mensajesEsES } from "@shared/textos/completitud"
import { fusionar } from "@shared/textos/fusionar"

/**
 * El idioma, que falla de una forma muy concreta: **no revienta**.
 *
 * Una clave sin traducir enseña la frase en español a quien no lo habla, y eso
 * no aparece en ningún log. Que a `en-US.json` no le falte ninguna clave ya lo
 * impide `tsc` —`completitud.ts` lo declara con el tipo del base—, así que lo
 * que se prueba aquí es lo que el compilador NO puede ver: que las listas no se
 * separen, que la fusión del español de España no borre nada, y que los
 * mensajes con datos adentro **se rendericen de verdad**.
 *
 * Eso último dejó de ser gratis al pasar a ICU: antes una frase con dato era una
 * función de TypeScript y el compilador la comprobaba entera; ahora es una
 * cadena que interpreta una librería en ejecución, y una llave mal cerrada no
 * falla al compilar — falla al pintarla.
 */
const CATALOGO = { "es-CO": mensajesEsCO, "es-ES": mensajesEsES, "en-US": mensajesEnUS }

/**
 * El espacio se pasa en bruto y el traductor sale sin tipar, a propósito: estas
 * pruebas recorren el catálogo ENTERO, así que aquí no hay una clave conocida
 * que tipar — y ese es justo el punto de tenerlas. Los tipos protegen el código
 * de pantalla; esto protege el catálogo de sí mismo.
 */
const traductor = (idioma: keyof typeof CATALOGO, espacio: string) =>
  createTranslator({
    locale: idioma,
    messages: CATALOGO[idioma],
    namespace: espacio as never,
  }) as unknown as (clave: string, valores?: Record<string, unknown>) => string

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

describe("los tres idiomas tienen la misma forma", () => {
  const rutasDe = (m: typeof mensajesEsCO) => Object.keys(m.navegacion.rutas).sort()

  it("ninguno se queda sin una entrada de navegación", () => {
    expect(rutasDe(mensajesEnUS)).toEqual(rutasDe(mensajesEsCO))
    expect(rutasDe(mensajesEsES)).toEqual(rutasDe(mensajesEsCO))
  })

  it("el inglés no arrastra frases en español", () => {
    // El caso que se cuela al añadir una clave: copiar el bloque del base y
    // traducir solo la mitad.
    expect(mensajesEnUS.navbar.miPerfil).not.toBe(mensajesEsCO.navbar.miPerfil)
    expect(mensajesEnUS.navegacion.rutas.clientes.subtitulo).not.toBe(
      mensajesEsCO.navegacion.rutas.clientes.subtitulo
    )
  })
})

describe("los mensajes ICU se renderizan", () => {
  it("colocan el dato donde le toca a cada idioma", () => {
    expect(traductor("es-CO", "navbar")("sedeActiva", { nombre: "Centro" })).toBe(
      "Sede activa: Centro"
    )
    expect(traductor("en-US", "navbar")("sedeActiva", { nombre: "Downtown" })).toBe(
      "Current location: Downtown"
    )
  })

  it("el plural elige la forma, y no lo decide un `if` nuestro", () => {
    const es = traductor("es-CO", "dashboard.citasHoy")
    expect(es("total", { cuantas: 1 })).toBe("cita total")
    expect(es("total", { cuantas: 4 })).toBe("citas totales")

    const en = traductor("en-US", "dashboard.citasHoy")
    expect(en("total", { cuantas: 1 })).toBe("appointment total")
    expect(en("total", { cuantas: 4 })).toBe("appointments total")
  })

  it("un mensaje con varios datos los coloca todos", () => {
    expect(traductor("es-CO", "navbar")("menuUsuario", { nombre: "Ana", rol: "propietario" })).toBe(
      "Menú de usuario: Ana, propietario"
    )
  })

  it("ningún mensaje del catálogo revienta al renderizarse", () => {
    // La red que compensa lo que se perdió al salir de TypeScript: una llave sin
    // cerrar o un plural mal escrito no falla al compilar, falla al pintarlo. Se
    // recorren TODOS los mensajes de los tres idiomas con datos de relleno.
    for (const idioma of Object.keys(CATALOGO) as (keyof typeof CATALOGO)[]) {
      const mensajes = CATALOGO[idioma]
      for (const { espacio, clave, texto } of recorrer(mensajes)) {
        const t = traductor(idioma, espacio)
        const valores = Object.fromEntries(
          [...texto.matchAll(/\{(\w+)/g)].map((coincidencia) => [coincidencia[1], 1])
        )
        expect(() => t(clave, valores)).not.toThrow()
      }
    }
  })
})

describe("España se escribe como diferencias, no como copia", () => {
  it("cambia lo que allí se dice de otra forma", () => {
    expect(mensajesEsES.navegacion.rutas.sedes.etiqueta).toBe("Locales")
    expect(traductor("es-ES", "navbar")("sedeActiva", { nombre: "Gran Vía" })).toBe(
      "Local activo: Gran Vía"
    )
  })

  it("hereda TODO lo que no toca", () => {
    // Esto es lo que hace que corregir una frase la corrija en los dos
    // mercados. Sin ello, el archivo que menos se abre se queda viejo.
    expect(mensajesEsES.navbar.miPerfil).toBe(mensajesEsCO.navbar.miPerfil)
    expect(mensajesEsES.navegacion.rutas.nomina.subtitulo).toBe(
      mensajesEsCO.navegacion.rutas.nomina.subtitulo
    )
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
})

/** Cada mensaje del catálogo, con el espacio y la clave que lo alcanzan. */
function recorrer(
  objeto: Record<string, unknown>,
  espacio = ""
): { espacio: string; clave: string; texto: string }[] {
  return Object.entries(objeto).flatMap(([clave, valor]) => {
    if (typeof valor === "string") return [{ espacio: espacio || "comun", clave, texto: valor }]
    if (valor && typeof valor === "object") {
      return recorrer(valor as Record<string, unknown>, espacio ? `${espacio}.${clave}` : clave)
    }
    return []
  })
}
