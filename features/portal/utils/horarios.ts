import type { HorarioPortal } from "@features/portal/types/portal.types"

export interface RangoHorario {
  /** Días agrupados, ej. "Lun – Vie" */
  dias: string
  /** Horario legible, ej. "09:00 – 20:00" o "Cerrado" */
  horario: string
}

const corto = (dia: string) => `${dia.slice(0, 3)}`

// Días seguidos con el mismo horario se muestran juntos: la ficha pasa de 7 filas a 2 o 3.
export function agruparHorarios(horarios: HorarioPortal[]): RangoHorario[] {
  const grupos: RangoHorario[] = []
  let inicio = 0

  horarios.forEach((horario, indice) => {
    const siguiente = horarios[indice + 1]
    const igualAlSiguiente =
      siguiente &&
      siguiente.abierto === horario.abierto &&
      siguiente.apertura === horario.apertura &&
      siguiente.cierre === horario.cierre
    if (igualAlSiguiente) return

    const desde = horarios[inicio]
    grupos.push({
      dias: inicio === indice ? corto(desde.dia) : `${corto(desde.dia)} – ${corto(horario.dia)}`,
      horario: horario.abierto ? `${horario.apertura} – ${horario.cierre}` : "Cerrado",
    })
    inicio = indice + 1
  })

  return grupos
}
