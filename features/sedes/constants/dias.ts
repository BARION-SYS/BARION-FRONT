/** 0 domingo … 6 sábado, igual que la API. */
export const NOMBRE_DIA = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

/**
 * Los siete días en el orden en que los lee esta sede. Colombia y España
 * arrancan el lunes; EE. UU. el domingo, y verlo al revés desorienta a quien
 * configura su semana.
 */
export function diasOrdenados(inicioSemana: number): number[] {
  const primero = inicioSemana === 0 ? 0 : 1
  return Array.from({ length: 7 }, (_, i) => (primero + i) % 7)
}

/** Tope por día. Mañana, tarde y un turno extra cubren cualquier caso real. */
export const MAX_TRAMOS_POR_DIA = 3
