import { ETIQUETA_SUSCRIPCION, TONO_SUSCRIPCION } from "@features/plataforma/constants/planes.copy"
import { fechaClave, inicioDiaLocal } from "@shared/utils/datetime"
import type { TonoEstado } from "@shared/types/ui.types"

/**
 * Cómo se pinta un estado de suscripción. Uno que la base estrene sin que nadie
 * lo redacte se enseña con su código crudo y en neutro: visible y feo antes que
 * invisible.
 */
export function configEstadoSuscripcion(estado: string): { tono: TonoEstado; etiqueta: string } {
  return {
    tono: TONO_SUSCRIPCION[estado] ?? "neutro",
    etiqueta: ETIQUETA_SUSCRIPCION[estado] ?? estado,
  }
}

/**
 * El día de un instante de facturación, para precargarlo en un `<input
 * type="date">`.
 *
 * **En UTC y no en la zona de la barbería**, a propósito: los límites de período
 * que devuelve la API son medianoche UTC, y leerlos en hora local correría un
 * día entero cada vencimiento de una barbería al oeste de Greenwich. La
 * facturación no es la agenda: aquella sí vive en la hora de la sede.
 */
export function diaDeFacturacion(instante: string | null): string {
  return instante ? fechaClave(instante, "UTC") : ""
}

/** La inversa: el día elegido como el instante UTC que la API espera. */
export function instanteDeFacturacion(dia: string): string | undefined {
  return dia === "" ? undefined : inicioDiaLocal(dia, "UTC")
}
