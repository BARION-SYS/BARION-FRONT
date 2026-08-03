import { ETIQUETA_FUNCION, ETIQUETA_LIMITE } from "@features/plataforma/constants/planes.copy"
import type { PlanPlataforma, PrecioPlan } from "@features/plataforma/types/plataforma.types"

/** Una línea de la ficha del plan: «Sedes · 5» o «Barberos · Sin límite». */
export interface LimitePlan {
  clave: string
  etiqueta: string
  /** `null` = sin techo. Quien lo pinta decide cómo se dice. */
  valor: number | null
}

export function etiquetaFuncion(clave: string): string {
  return ETIQUETA_FUNCION[clave] ?? clave
}

/**
 * Los límites del plan, en orden estable.
 *
 * `limites` es un jsonb libre: una clave nueva aparece sin que nadie toque el
 * front, con su nombre crudo. Esconder lo desconocido dejaría planes contando
 * media verdad.
 */
export function limitesDePlan(plan: PlanPlataforma): LimitePlan[] {
  return Object.entries(plan.limites).map(([clave, valor]) => ({
    clave,
    etiqueta: ETIQUETA_LIMITE[clave] ?? clave,
    valor: typeof valor === "number" ? valor : null,
  }))
}

/**
 * El precio de un plan en un país concreto.
 *
 * Sin precio activo ahí no se inventa una conversión: se devuelve `undefined` y
 * quien lo pinta dice que hay que consultarlo. Un precio inventado en un alta se
 * convierte en una promesa comercial que nadie hizo.
 */
export function precioDelPais(
  plan: PlanPlataforma,
  codigoPais: string,
  periodo = "mensual"
): PrecioPlan | undefined {
  return plan.precios.find((p) => p.codigoPais === codigoPais && p.periodo === periodo)
}
