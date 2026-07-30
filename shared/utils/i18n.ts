// Formateadores Intl memoizados por locale+opciones — nunca crear por render.
// El locale/timezone real del tenant llega por parámetro (lo carga TenantProvider al integrar).

// Fallback — el locale real siempre llega del tenant (useFormato/TenantProvider).
export const DEFAULT_LOCALE = "es-CO"

/**
 * Las zonas horarias IANA que reconoce este navegador.
 *
 * Existe porque la API acepta cualquier cadena de 3 a 64 caracteres en
 * `sedes.zonaHoraria`: un dedazo (`America/Bogotà`) se guarda igual y revienta
 * después, al formatear, en una pantalla que no tiene nada que ver con el
 * formulario que lo escribió. Elegir de una lista lo hace imposible.
 *
 * `supportedValuesOf` no está en navegadores viejos; sin él quedan las zonas de
 * las regiones donde Barion opera, que es mejor que un campo libre.
 */
let zonasCache: string[] | null = null

export function zonasHorarias(): string[] {
  if (zonasCache) return zonasCache
  const soportadas =
    typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : []
  zonasCache = soportadas.length > 0 ? [...soportadas] : [...ZONAS_MINIMAS]
  return zonasCache
}

export function esZonaHorariaValida(zona: string): boolean {
  return zonasHorarias().includes(zona)
}

const ZONAS_MINIMAS = ["America/Bogota", "America/New_York", "Europe/Madrid"] as const

const dateTimeFormats = new Map<string, Intl.DateTimeFormat>()
const numberFormats = new Map<string, Intl.NumberFormat>()
const relativeTimeFormats = new Map<string, Intl.RelativeTimeFormat>()

export function getDateTimeFormat(
  locale: string,
  options: Intl.DateTimeFormatOptions
): Intl.DateTimeFormat {
  const key = `${locale}|${JSON.stringify(options)}`
  let format = dateTimeFormats.get(key)
  if (!format) {
    format = new Intl.DateTimeFormat(locale, options)
    dateTimeFormats.set(key, format)
  }
  return format
}

export function getNumberFormat(
  locale: string,
  options: Intl.NumberFormatOptions
): Intl.NumberFormat {
  const key = `${locale}|${JSON.stringify(options)}`
  let format = numberFormats.get(key)
  if (!format) {
    format = new Intl.NumberFormat(locale, options)
    numberFormats.set(key, format)
  }
  return format
}

export function getRelativeTimeFormat(
  locale: string,
  options: Intl.RelativeTimeFormatOptions = { numeric: "auto" }
): Intl.RelativeTimeFormat {
  const key = `${locale}|${JSON.stringify(options)}`
  let format = relativeTimeFormats.get(key)
  if (!format) {
    format = new Intl.RelativeTimeFormat(locale, options)
    relativeTimeFormats.set(key, format)
  }
  return format
}
