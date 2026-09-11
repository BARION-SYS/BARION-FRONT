import { DEFAULT_LOCALE, getDateTimeFormat, getRelativeTimeFormat } from "@shared/utils/i18n"

// Formateo de fechas/horas — SIEMPRE en la timezone de la sede (parámetro),
// nunca la del navegador. La API entrega timestamps UTC (ISO 8601).

/**
 * La hora de un instante, en la zona de la SEDE.
 *
 * `hora12` decide el reloj, y no es cosmético: **quien lee decide cuál sirve**.
 * En el panel manda el de 24 h —una agenda es una columna densa de horas y
 * `14:30` ocupa menos y no se confunde—; al CLIENTE hay que hablarle en el reloj
 * que usa, que en Colombia, España y EE. UU. es el de 12 h. Un «10:00» suelto en
 * un correo no se lee como las diez de la mañana: se lee como una duda, y quien
 * la tiene llama a la barbería a preguntar.
 */
export function formatTime(
  value: string | Date,
  timeZone: string,
  locale = DEFAULT_LOCALE,
  hora12 = false
): string {
  return getDateTimeFormat(locale, {
    hour: hora12 ? "numeric" : "2-digit",
    minute: "2-digit",
    hour12: hora12,
    timeZone,
  }).format(typeof value === "string" ? new Date(value) : value)
}

export function formatDate(
  value: string | Date,
  timeZone: string,
  locale = DEFAULT_LOCALE
): string {
  return getDateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone,
  }).format(typeof value === "string" ? new Date(value) : value)
}

export function formatShortDate(
  value: string | Date,
  timeZone: string,
  locale = DEFAULT_LOCALE
): string {
  return getDateTimeFormat(locale, { day: "numeric", month: "short", timeZone }).format(
    typeof value === "string" ? new Date(value) : value
  )
}

/**
 * «sept 26»: la etiqueta de un tramo mensual de una serie.
 *
 * **Siempre en UTC**, y es la excepción deliberada a «la zona de la sede»: las
 * series de la plataforma se cortan en UTC y cada punto es el instante en que
 * empieza su mes. Leído en Bogotá, el 1 de septiembre a medianoche UTC es el 31
 * de agosto, y la barra de septiembre saldría rotulada «ago».
 */
export function formatMonthYear(value: string | Date, locale = DEFAULT_LOCALE): string {
  return getDateTimeFormat(locale, { month: "short", year: "2-digit", timeZone: "UTC" }).format(
    typeof value === "string" ? new Date(value) : value
  )
}

export function formatDateTime(
  value: string | Date,
  timeZone: string,
  locale = DEFAULT_LOCALE
): string {
  return getDateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).format(typeof value === "string" ? new Date(value) : value)
}

export function formatWeekdayShort(
  value: string | Date,
  timeZone: string,
  locale = DEFAULT_LOCALE
): string {
  return getDateTimeFormat(locale, { weekday: "short", timeZone }).format(
    typeof value === "string" ? new Date(value) : value
  )
}

export function formatWeekday(
  value: string | Date,
  timeZone: string,
  locale = DEFAULT_LOCALE
): string {
  return getDateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone,
  }).format(typeof value === "string" ? new Date(value) : value)
}

const UNIDADES_RELATIVAS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["week", 60 * 60 * 24 * 7],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
]

/**
 * "hace 5 min" / "hace 3 días" / "en 2 horas". Sin timezone: es la diferencia
 * entre dos instantes, no una fecha en un lugar. Bajo el minuto redondea a
 * "hace un momento" — `Intl.RelativeTimeFormat` con 0 segundos diría "en 0
 * segundos", que no es cómo habla nadie.
 */
export function formatRelative(value: string | Date, locale = DEFAULT_LOCALE): string {
  const fecha = typeof value === "string" ? new Date(value) : value
  const diffSegundos = (fecha.getTime() - Date.now()) / 1000
  const absSegundos = Math.abs(diffSegundos)

  if (absSegundos < 60) return diffSegundos >= 0 ? "en un momento" : "hace un momento"

  for (const [unidad, segundosPorUnidad] of UNIDADES_RELATIVAS) {
    if (absSegundos >= segundosPorUnidad) {
      const valor = Math.round(diffSegundos / segundosPorUnidad)
      return getRelativeTimeFormat(locale).format(valor, unidad)
    }
  }
  return getRelativeTimeFormat(locale).format(Math.round(diffSegundos / 60), "minute")
}

// Duración en minutos → "45 min" | "1 h" | "1 h 05 min"
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest === 0 ? `${hours} h` : `${hours} h ${String(rest).padStart(2, "0")} min`
}

/**
 * Fecha LOCAL de la sede en `YYYY-MM-DD`. Es la clave con la que se agrupa una
 * agenda: dos instantes de la misma noche pueden caer en días distintos según
 * la zona, y agrupar por el día del navegador correría la semana entera.
 *
 * `en-CA` porque su formato numérico ES `YYYY-MM-DD`; no se elige por idioma.
 */
export function fechaClave(value: string | Date, timeZone: string): string {
  return getDateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone,
  }).format(new Date(value))
}

/**
 * Minutos desde medianoche en hora local de la sede. Es lo que posiciona una
 * cita dentro de la grilla: la hora del navegador pintaría la cita en la fila
 * equivocada en cuanto la sede opere en otro huso.
 */
export function minutosLocales(value: string | Date, timeZone: string): number {
  const partes = getDateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  })
    .format(new Date(value))
    .split(":")
  return (Number(partes[0]) % 24) * 60 + Number(partes[1])
}

/**
 * El instante UTC en que EMPIEZA ese día en la sede. La inversa de
 * `fechaClave`, y lo que convierte "esta semana" en el `desde`/`hasta` que la
 * API entiende.
 *
 * Tratar `YYYY-MM-DD` como si ya fuera UTC se equivoca en el borde: en Bogotá
 * (UTC-5) el 1 de agosto empieza a las 05:00Z, así que mandar `T00:00:00Z`
 * arrastraría cinco horas del día anterior a la nómina.
 *
 * El offset se calcula dos veces a propósito: el de la medianoche supuesta puede
 * no ser el del instante real cuando el cambio de horario cae esa madrugada.
 */
export function inicioDiaLocal(fecha: string, timeZone: string): string {
  const supuesto = new Date(`${fecha}T00:00:00Z`)
  const aproximado = new Date(supuesto.getTime() - offsetDe(supuesto, timeZone))
  return new Date(supuesto.getTime() - offsetDe(aproximado, timeZone)).toISOString()
}

/** Cuánto se adelanta esa zona respecto de UTC, en milisegundos, en ese instante. */
function offsetDe(instante: Date, timeZone: string): number {
  // `sv-SE` porque formatea como `YYYY-MM-DD HH:mm:ss`, que `Date.parse` acepta
  // al sustituir el espacio por `T`. No se elige por idioma.
  const local = getDateTimeFormat("sv-SE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone,
  }).format(instante)

  return Date.parse(`${local.replace(" ", "T")}Z`) - instante.getTime()
}
