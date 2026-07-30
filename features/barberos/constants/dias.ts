/** 0 domingo … 6 sábado, igual que la API. */
export const NOMBRE_DIA = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

export const NOMBRE_DIA_CORTO = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

/**
 * Los siete días empezando por lunes.
 *
 * El barbero no tiene un primer día de semana propio: el que manda es el de su
 * sede, y mientras el selector de sede no exista se asume lunes, que es lo que
 * usan Colombia y España. Cuando llegue, este helper recibe el valor de la sede.
 */
export function diasOrdenados(inicioSemana = 1): number[] {
  const primero = inicioSemana === 0 ? 0 : 1
  return Array.from({ length: 7 }, (_, i) => (primero + i) % 7)
}

/** Tope por día. Mañana, tarde y un turno extra cubren cualquier caso real. */
export const MAX_TRAMOS_POR_DIA = 3
