/**
 * Un período de nómina **es un filtro de fechas**, no una entidad: la api no
 * tiene liquidaciones que abrir ni que cerrar, así que "esta semana" se traduce
 * aquí a un `desde`/`hasta` y se manda.
 *
 * El corte es por el día LOCAL de la sede, no el del navegador: quien mira desde
 * Madrid la nómina de una barbería en Bogotá tiene que ver el mismo lunes que
 * ve el dueño. El `hasta` es **exclusivo** —el inicio del día siguiente— o se
 * perdería lo que se ganó a las 23:59.
 */
import { hoyLocal, sumarDias } from "@features/citas/utils/semana"
import type {
  OpcionPeriodoNomina,
  PeriodoNomina,
  TotalesNomina,
} from "@features/nomina/types/nomina.types"
import { inicioDiaLocal } from "@shared/utils/datetime"

export const PERIODOS_NOMINA: OpcionPeriodoNomina[] = [
  { valor: "semana", etiqueta: "Esta semana" },
  { valor: "mes", etiqueta: "Este mes" },
  { valor: "anio", etiqueta: "Este año" },
]

export interface RangoNomina {
  desde: string
  hasta: string
}

/**
 * `inicioSemana` sale de la sede (1 lunes, 0 domingo). El mes y el año arrancan
 * donde arrancan; solo la semana depende de la costumbre del país.
 */
export function rangoDe(
  periodo: PeriodoNomina,
  timezone: string,
  inicioSemana: number
): RangoNomina {
  const hoy = hoyLocal(timezone)
  const manana = sumarDias(hoy, 1)

  const hasta = inicioDiaLocal(manana, timezone)

  if (periodo === "semana") {
    const diaSemana = new Date(`${hoy}T00:00:00Z`).getUTCDay()
    const desplazamiento = (diaSemana - inicioSemana + 7) % 7
    return { desde: inicioDiaLocal(sumarDias(hoy, -desplazamiento), timezone), hasta }
  }

  if (periodo === "mes") {
    return { desde: inicioDiaLocal(`${hoy.slice(0, 7)}-01`, timezone), hasta }
  }

  return { desde: inicioDiaLocal(`${hoy.slice(0, 4)}-01-01`, timezone), hasta }
}

/**
 * Suma en `BigInt` y devuelve centavos como cadena, igual que la api.
 *
 * Los importes viajan en string a propósito y sumarlos con `Number` los
 * convertiría en punto flotante justo donde no se puede: es dinero que alguien
 * cobra.
 */
export function sumarCentavos(valores: string[]): string {
  return valores.reduce((total, valor) => total + aCentavos(valor), CERO).toString()
}

export function totalesDe(
  filas: {
    produccionCentavos: string
    comisionCentavos: string
    propinasCentavos: string
    totalCentavos: string
  }[]
): TotalesNomina {
  return {
    produccionCentavos: sumarCentavos(filas.map((fila) => fila.produccionCentavos)),
    comisionesCentavos: sumarCentavos(filas.map((fila) => fila.comisionCentavos)),
    propinasCentavos: sumarCentavos(filas.map((fila) => fila.propinasCentavos)),
    totalCentavos: sumarCentavos(filas.map((fila) => fila.totalCentavos)),
  }
}

/**
 * El porcentaje que se le queda al barbero, DERIVADO de lo que ya se liquidó.
 *
 * No se pide a la api ni se lee de su ficha: el asiento congela el porcentaje de
 * cada cita, así que el de hoy no describe lo que se cobró el mes pasado. `null`
 * cuando no hubo producción — un 0 % se leería como "no le pagan".
 */
export function comisionEfectiva(
  produccionCentavos: string,
  comisionCentavos: string
): number | null {
  return proporcionDe(comisionCentavos, produccionCentavos)
}

/** Participación en la producción del equipo, 0–100. */
export function participacionDe(propia: string, total: string): number {
  return proporcionDe(propia, total) ?? 0
}

// `BigInt(0)` y no `0n`: el target de TypeScript de este repo es ES6 y los
// literales de bigint exigen ES2020. El tipo sí existe.
const CERO = BigInt(0)
const BASE = BigInt(10_000)

function aCentavos(valor: string): bigint {
  return BigInt(valor || "0")
}

/**
 * `parte / entero` en porcentaje (0–100), en aritmética entera. `null` cuando el
 * entero es cero: un 0 % se leería como un dato, y lo que hay es ausencia de él.
 */
function proporcionDe(parte: string, entero: string): number | null {
  const total = aCentavos(entero)
  if (total === CERO) return null
  return Number((aCentavos(parte) * BASE) / total) / 100
}
