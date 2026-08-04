import { getErrorMessage } from "@shared/utils/error"
import type { AceptacionesPasarela } from "@features/pagos/types/pagos.types"

/**
 * El error de la pasarela en palabras legibles.
 *
 * Hace falta porque Wompi **no** responde con el sobre de errores de Barion
 * (`{ error: { message } }`) sino con el suyo
 * (`{ error: { type, messages: { number: ["..."] } } }`), y el cliente HTTP, que
 * normaliza el de la api, ahí solo puede dejar el mensaje genérico de axios
 * («Request failed with status code 422»). Eso, junto a un formulario de
 * tarjeta, no le dice a nadie qué campo corregir.
 *
 * Lo que se muestra son **las palabras del proveedor**, sin traducir ni
 * reinterpretar: igual que `ultimoError`. Todo lo que no sea un error de Wompi
 * —incluidos los de Barion— sigue saliendo por `getErrorMessage`.
 */
export function mensajeDeErrorPasarela(err: unknown): string {
  const mensajes = mensajesDeValidacion(err)
  if (mensajes.length > 0) return mensajes.join(" ")
  return getErrorMessage(err)
}

/**
 * Las aceptaciones en el ORDEN que fija el contrato: posición 0 los términos y
 * condiciones, posición 1 la autorización de datos personales.
 *
 * Se arma en un solo sitio porque la posición **es** el contrato: la api las
 * transporta como lista opaca para no meter el vocabulario de Wompi en ella, y
 * un intercambio de posiciones no fallaría aquí, sino en la pasarela.
 */
export function aceptacionesEnOrden(
  aceptaciones: AceptacionesPasarela | null
): string[] | undefined {
  if (!aceptaciones) return undefined
  return [aceptaciones.terminos.token, aceptaciones.datosPersonales.token]
}

/** `{ error: { messages: { campo: ["motivo"] } } }` → `["motivo"]`. */
function mensajesDeValidacion(err: unknown): string[] {
  const cuerpo = detalleDeError(err)
  const sobre = propiedad(cuerpo, "error")
  const campos = propiedad(sobre, "messages")
  if (typeof campos !== "object" || campos === null) return []

  return Object.values(campos)
    .flatMap((motivos) => (Array.isArray(motivos) ? motivos : [motivos]))
    .filter((motivo): motivo is string => typeof motivo === "string")
}

function detalleDeError(err: unknown): unknown {
  return propiedad(err, "detail")
}

function propiedad(valor: unknown, clave: string): unknown {
  if (typeof valor !== "object" || valor === null) return undefined
  return (valor as Record<string, unknown>)[clave]
}
