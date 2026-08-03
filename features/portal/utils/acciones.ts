import { getErrorMessage, motivoDeError } from "@shared/utils/error"
import type { MotivoError } from "@shared/types/api.types"

/**
 * El enlace de un correo no dice para qué es.
 *
 * La api **no publica forma de preguntarle el propósito a un token** sin gastarlo
 * —no hay `GET` de inspección—, y no la publica a propósito: un endpoint que
 * contara qué es cada token sería un oráculo de enlaces ajenos.
 *
 * De ahí la única forma de resolverlo: **ejecutar y escuchar**. De los cinco
 * propósitos, tres se completan con el cuerpo vacío; los otros dos —calificar y
 * cancelar— los rechaza la api **sin gastar el enlace** (marca el token como
 * usado DESPUÉS de aplicar el efecto) y ese rechazo es la señal de qué pedir.
 *
 * Lo que distingue un rechazo de otro es `error.motivo`, un catálogo cerrado, y
 * NO el texto del mensaje: comparar prosa convierte una frase de copy en
 * contrato, y el día que alguien la mejore los enlaces de calificar dejan de
 * pedir la nota.
 */

/**
 * Frase con la que la api pedía el puntaje **antes** de publicar `motivo`.
 *
 * El cotejo es contra la frase COMPLETA a propósito: «Solo se califica una cita
 * que ya se atendió» también habla de calificar y es un fallo definitivo, no una
 * petición de dato.
 *
 * @deprecated RETIRAR —junto con `normalizar` y su rama en `motivoDeAccion`— en
 * cuanto la api que emite `motivo` esté desplegada. Vive solo para que un front
 * por delante del despliegue de la api siga comportándose como hoy.
 */
const FALTA_PUNTAJE = "falta la calificacion"

/** Sin tildes y en minúsculas: la comparación no depende de cómo se acentúe. */
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

/**
 * Por qué la api rechazó el enlace, cuando el rechazo **no** es el final.
 *
 * `undefined` = fallo terminal (o motivo que este front no conoce): se pinta el
 * desenlace y no se reintenta.
 *
 * Aguanta que el campo no llegue: la api puede ir por detrás del despliegue del
 * front, y sin `motivo` el comportamiento es el de antes —solo se detecta la
 * petición de puntaje, por la frase—. Una cancelación contra una api antigua se
 * ejecuta al abrir, exactamente como hacía.
 */
export function motivoDeAccion(err: unknown): MotivoError | undefined {
  const motivo = motivoDeError(err)
  if (motivo) return motivo

  // Último recurso mientras la api no emita `motivo`. Se retira con FALTA_PUNTAJE.
  if (normalizar(getErrorMessage(err)).startsWith(FALTA_PUNTAJE)) return "falta_puntaje"

  return undefined
}
