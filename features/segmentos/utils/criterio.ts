import { definicionDe } from "@features/segmentos/constants/criterios"
import type { DatosSegmento } from "@features/segmentos/schemas/segmentos.schema"

/**
 * Del formulario al contrato.
 *
 * En el formulario el criterio son dos campos —cuál y cuánto—; en el contrato es
 * un objeto cuya forma depende del tipo (`dias`, `visitas_min`, `centavos`…).
 * Esta es la traducción, y vive aparte del service porque es donde un fallo no
 * se ve: mandar `dias` donde iba `visitas_min` produce una petición válida, una
 * respuesta 200 y una etiqueta que agrupa a quien no debía.
 *
 * El nombre del parámetro sale de la tabla de criterios, nunca escrito otra vez
 * aquí: dos listas de nombres son dos listas que se separan.
 */
export function armarCriterio(datos: DatosSegmento): Record<string, unknown> | undefined {
  // Un estático no lleva criterio, y mandárselo es un 422: sus miembros los pone
  // una persona, no una regla.
  if (datos.tipo !== "dinamico" || !datos.criterioTipo) return undefined

  const definicion = definicionDe(datos.criterioTipo)
  // Un tipo que este panel no conoce viaja tal cual: si la api sabe calcularlo,
  // funciona; si no, responde 422 y lo dice. Inventarle un parámetro sería peor.
  if (!definicion) return { tipo: datos.criterioTipo }

  if (!definicion.parametro || !datos.criterioValor) return { tipo: definicion.tipo }

  return { tipo: definicion.tipo, [definicion.parametro]: Number(datos.criterioValor) }
}
