import { DEFAULT_LOCALE, getDateTimeFormat } from "@shared/utils/i18n"

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

// Duración en minutos → "45 min" | "1 h" | "1 h 05 min"
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest === 0 ? `${hours} h` : `${hours} h ${String(rest).padStart(2, "0")} min`
}
