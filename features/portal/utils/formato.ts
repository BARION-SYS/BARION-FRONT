/**
 * Formateo del portal, atado a la **zona horaria de la sede** y a la moneda de la
 * barbería.
 *
 * `useFormato()` no sirve aquí: resuelve la timezone desde la sede ACTIVA del
 * panel, y en el escaparate no hay sesión ni store de sede — hay una barbería que
 * puede tener locales en dos husos, y cada uno pinta sus horas en el suyo. Estas
 * funciones delegan en los formateadores puros de `shared/utils`, que siguen
 * siendo el único sitio donde vive `Intl`.
 */
import { monedas, type CodigoMoneda } from "@config/regiones"
import { formatMoney } from "@shared/utils/currency"
import { fechaClave, formatShortDate, formatTime, formatWeekdayShort } from "@shared/utils/datetime"

/** Locale de referencia mientras la ficha no diga otro. */
const LOCALE_POR_DEFECTO = "es-CO"
const MONEDA_POR_DEFECTO: CodigoMoneda = "COP"

export interface ContextoFormato {
  /** Zona de la SEDE, no del navegador. */
  zonaHoraria: string
  moneda: string
  locale?: string
}

/** Centavos como cadena → importe legible. Nunca se parsea a número antes. */
export function dineroDe(centavos: string | null, contexto: ContextoFormato): string {
  if (centavos === null) return "—"
  return formatMoney(
    Number(centavos),
    monedaConocida(contexto.moneda),
    contexto.locale ?? LOCALE_POR_DEFECTO
  )
}

/**
 * Suma de líneas en centavos. **Con `BigInt`, no con números**: en COP el total de
 * una cita se acerca al techo del entero seguro de JavaScript, y sumar dinero en
 * coma flotante acaba enseñando un total que no cuadra con sus líneas.
 */
export function sumaCentavos(valores: string[]): string {
  return valores.reduce((total, valor) => total + BigInt(valor), BigInt(0)).toString()
}

/**
 * La api acepta cualquier ISO 4217; este front solo sabe formatear las de
 * `config/regiones.ts`. Una moneda fuera de esa lista cae al peso en vez de
 * reventar `Intl.NumberFormat` en mitad del escaparate.
 */
function monedaConocida(moneda: string): CodigoMoneda {
  return (monedas as readonly string[]).includes(moneda)
    ? (moneda as CodigoMoneda)
    : MONEDA_POR_DEFECTO
}

/**
 * **En reloj de 12 horas, y esto es del portal, no del panel.**
 *
 * Quien lee aquí es el cliente final, no un barbero mirando su columna del día:
 * un «10:00» a secas no se lee como las diez de la mañana, se lee como una duda
 * —y quien la tiene acaba llamando a la barbería a preguntar—. El panel se queda
 * en 24 h a propósito, que es donde una agenda densa lo agradece.
 */
export function horaDe(instante: string, contexto: ContextoFormato): string {
  return formatTime(instante, contexto.zonaHoraria, contexto.locale ?? LOCALE_POR_DEFECTO, true)
}

export function fechaCortaDe(instante: string, contexto: ContextoFormato): string {
  return formatShortDate(instante, contexto.zonaHoraria, contexto.locale ?? LOCALE_POR_DEFECTO)
}

export function diaSemanaDe(instante: string, contexto: ContextoFormato): string {
  return formatWeekdayShort(
    instante,
    contexto.zonaHoraria,
    contexto.locale ?? LOCALE_POR_DEFECTO
  ).replace(".", "")
}

/** `YYYY-MM-DD` en hora de la sede: la clave con la que se agrupa la agenda. */
export function claveDeDia(instante: string, contexto: ContextoFormato): string {
  return fechaClave(instante, contexto.zonaHoraria)
}

/**
 * Un día de agenda **NO es un instante**: la api lo entrega como `YYYY-MM-DD` en
 * hora local de la sede. Formatearlo como instante lo correría un día en cuanto la
 * sede esté al oeste de UTC —"2026-08-03" leído como medianoche UTC es el 2 de
 * agosto en Bogotá—, y la tira de días enseñaría fechas equivocadas.
 *
 * Se ancla al mediodía y se formatea EN UTC: así ninguna zona lo mueve de día.
 */
function comoMediodia(fecha: string): string {
  return `${fecha}T12:00:00.000Z`
}

export function diaCortoDeFecha(fecha: string, locale = LOCALE_POR_DEFECTO): string {
  return formatShortDate(comoMediodia(fecha), "UTC", locale)
}

export function diaSemanaDeFecha(fecha: string, locale = LOCALE_POR_DEFECTO): string {
  return formatWeekdayShort(comoMediodia(fecha), "UTC", locale).replace(".", "")
}

/** Iniciales para el avatar. El portal no recibe avatares de todo el mundo. */
export function inicialesDe(nombre: string): string {
  const partes = nombre.trim().split(/\s+/)
  return `${partes[0]?.[0] ?? ""}${partes[1]?.[0] ?? ""}`.toUpperCase()
}
