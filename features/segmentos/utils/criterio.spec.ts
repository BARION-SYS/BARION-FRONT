import { describe, expect, it } from "vitest"
import { armarCriterio } from "@features/segmentos/utils/criterio"
import { CRITERIOS, valorDelCriterio } from "@features/segmentos/constants/criterios"
import type { DatosSegmento } from "@features/segmentos/schemas/segmentos.schema"

/**
 * La traducción del formulario al contrato, que es donde un fallo NO se ve.
 *
 * Mandar `dias` donde iba `visitas_min` produce una petición válida, un 200 y
 * una etiqueta que agrupa a quien no debía. No revienta nada, no aparece en
 * ningún log y `tsc` no lo mira: los dos son números. Se descubre semanas
 * después, cuando alguien nota que «vienen seguido» tiene a media clientela.
 */

function datos(parcial: Partial<DatosSegmento> = {}): DatosSegmento {
  return {
    nombre: "Etiqueta",
    descripcion: undefined,
    tipo: "dinamico",
    criterioTipo: "inactivos",
    criterioValor: "",
    esEtiqueta: true,
    prioridad: "0",
    ...parcial,
  }
}

describe("armarCriterio — del formulario al contrato", () => {
  it("cada regla viaja con el nombre de parámetro que declara su tabla", () => {
    // Recorre el catálogo entero en vez de fijar seis casos a mano: una regla
    // nueva queda cubierta el día que se añade, sin que nadie se acuerde.
    for (const criterio of CRITERIOS) {
      const armado = armarCriterio(datos({ criterioTipo: criterio.tipo, criterioValor: "7" }))

      expect(armado?.tipo).toBe(criterio.tipo)
      if (criterio.parametro) {
        expect(armado?.[criterio.parametro]).toBe(7)
        // Y no lleva ningún otro parámetro pegado de otra regla.
        expect(Object.keys(armado ?? {})).toEqual(["tipo", criterio.parametro])
      } else {
        expect(Object.keys(armado ?? {})).toEqual(["tipo"])
      }
    }
  })

  it("un valor vacío no viaja, porque vacío no es cero", () => {
    const armado = armarCriterio(datos({ criterioTipo: "gasto_minimo", criterioValor: "" }))

    // La api tiene un valor por defecto por regla. Mandar `0` en «gasto mínimo»
    // afirma algo distinto de «no lo he decidido», y ahí la diferencia es a quién
    // se le escribe.
    expect(armado).toEqual({ tipo: "gasto_minimo" })
  })

  it("un cero tecleado a propósito sí viaja", () => {
    const armado = armarCriterio(datos({ criterioTipo: "riesgo", criterioValor: "0" }))

    expect(armado).toEqual({ tipo: "riesgo", puntaje_max: 0 })
  })

  it("un segmento estático no manda criterio", () => {
    // Sus miembros los pone una persona. Mandarlo es un 422, y con razón.
    expect(armarCriterio(datos({ tipo: "estatico" }))).toBeUndefined()
  })

  it("una regla que este panel no conoce viaja tal cual, sin inventarle parámetro", () => {
    const armado = armarCriterio(datos({ criterioTipo: "loquesea", criterioValor: "5" }))

    expect(armado).toEqual({ tipo: "loquesea" })
  })
})

describe("valorDelCriterio — del contrato al formulario", () => {
  it("lee el parámetro por el nombre que le toca a cada regla", () => {
    expect(valorDelCriterio({ tipo: "frecuentes", visitas_min: 9 })).toBe(9)
    expect(valorDelCriterio({ tipo: "inactivos", dias: 120 })).toBe(120)
    expect(valorDelCriterio({ tipo: "gasto_minimo", centavos: 5_000_000 })).toBe(5_000_000)
  })

  it("una regla guardada sin su parámetro se precarga con el valor por defecto", () => {
    // Es lo que la api va a aplicar igualmente, así que el formulario tiene que
    // enseñar eso y no un hueco que se lea como «no hay regla».
    expect(valorDelCriterio({ tipo: "inactivos" })).toBe(60)
  })

  it("una regla desconocida no se precarga con la de otra", () => {
    // Preferimos no poder editarla a cambiársela por otra sin que nadie lo pida.
    expect(valorDelCriterio({ tipo: "loquesea", dias: 5 })).toBeUndefined()
  })

  it("cumpleaños del mes no lleva parámetro", () => {
    expect(valorDelCriterio({ tipo: "cumpleanos_mes" })).toBeUndefined()
  })
})
