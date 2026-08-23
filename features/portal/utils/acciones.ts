import { motivoDeError } from "@shared/utils/error"
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
 * Por qué la api rechazó el enlace, cuando el rechazo **no** es el final.
 *
 * `undefined` = fallo terminal, o un motivo que este front no conoce: se pinta
 * el desenlace y no se reintenta.
 *
 * ── Por qué sigue existiendo esta función si hoy solo reenvía ────────────────
 * Porque nombra una pregunta del portal —«¿este rechazo pide un dato o es el
 * final?»— que no es la misma que «¿qué motivo trae este error?». Si mañana un
 * propósito nuevo del enlace necesita otro motivo, se decide aquí y no en la
 * pantalla. La alternativa era que la página importara `motivoDeError` y el
 * razonamiento de arriba se quedara sin sitio donde vivir.
 *
 * Hasta el 23 de agosto de 2026 hacía algo más: si la api no mandaba `motivo`,
 * deducía la petición de puntaje **comparando la frase del mensaje**. Eso se
 * retiró al confirmarse que la api lo emite (`falta_puntaje` sale de
 * `portal-accion-command.service.ts`). Se anota porque el respaldo tenía fecha
 * de caducidad desde que se escribió, y este es el día: mantener viva una
 * comparación de prosa es mantener viva la posibilidad de que un cambio de copy
 * rompa un enlace.
 */
export function motivoDeAccion(err: unknown): MotivoError | undefined {
  return motivoDeError(err)
}
