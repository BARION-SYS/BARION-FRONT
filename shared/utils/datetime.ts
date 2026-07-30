import { DEFAULT_LOCALE, getDateTimeFormat, getRelativeTimeFormat } from "@shared/utils/i18n"

// Formateo de fechas/horas — SIEMPRE en la timezone de la sede (parámetro),
// nunca la del navegador. La API entrega timestamps UTC (ISO 8601).

export function formatTime(
  value: string | Date,
  timeZone: string,
  locale = DEFAULT_LOCALE
): string {
  return getDateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
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
