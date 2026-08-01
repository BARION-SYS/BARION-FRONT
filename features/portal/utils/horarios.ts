import type { TramoHorario } from "@features/portal/types/portal.types"

export interface RangoHorario {
  /** Días agrupados, ej. "Lun – Vie" */
  dias: string
  /** Horario legible, ej. "09:00 – 20:00" o "Cerrado" */
  horario: string
}

/**
 * La api entrega el horario como TRAMOS por día de la semana (0 domingo … 6
 * sábado), y un día puede tener dos —mañana y tarde—. Aquí se pasa a lo que la
 * ficha pinta: una fila por rango de días seguidos con el mismo horario.
 *
 * La semana arranca en LUNES aunque la api numere desde el domingo: la ficha se
 * lee de arriba abajo, y empezar en domingo desordena la semana de quien la mira.
 */
const DIAS_CORTOS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"] as const
const ORDEN_SEMANA = [1, 2, 3, 4, 5, 6, 0] as const

export function agruparHorarios(tramos: TramoHorario[]): RangoHorario[] {
  // Un día puede abrir dos veces: sus tramos se unen en un solo texto.
  const porDia = new Map<number, string>(
    ORDEN_SEMANA.map((dia) => [dia, horarioDeHoy(tramos, dia)])
  )

  const grupos: RangoHorario[] = []
  let inicio = 0

  ORDEN_SEMANA.forEach((dia, indice) => {
    const siguiente = ORDEN_SEMANA[indice + 1]
    if (siguiente !== undefined && porDia.get(siguiente) === porDia.get(dia)) return

    const desde = ORDEN_SEMANA[inicio]
    grupos.push({
      dias: inicio === indice ? DIAS_CORTOS[desde] : `${DIAS_CORTOS[desde]} – ${DIAS_CORTOS[dia]}`,
      horario: porDia.get(dia) ?? "Cerrado",
    })
    inicio = indice + 1
  })

  return grupos
}

/** El horario de un día concreto, para la barra superior. */
export function horarioDeHoy(tramos: TramoHorario[], diaSemana: number): string {
  const delDia = tramos
    .filter((tramo) => tramo.diaSemana === diaSemana)
    .sort((uno, otro) => uno.abre.localeCompare(otro.abre))
  return delDia.length > 0
    ? delDia.map((tramo) => `${tramo.abre} – ${tramo.cierra}`).join(" · ")
    : "Cerrado"
}

/** La dirección la entrega la api como objeto libre: aquí se acota lo que se pinta. */
export function direccionLegible(direccion: Record<string, unknown> | null): {
  calle: string | null
  ciudad: string | null
} {
  const texto = (valor: unknown): string | null =>
    typeof valor === "string" && valor.trim() ? valor.trim() : null
  return { calle: texto(direccion?.calle), ciudad: texto(direccion?.ciudad) }
}
