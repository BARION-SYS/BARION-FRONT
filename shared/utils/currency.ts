import type { CodigoMoneda } from "@config/regiones"
import { DEFAULT_LOCALE, getNumberFormat } from "@shared/utils/i18n"

// Dinero: la API SIEMPRE entrega unidad menor (centavos) + código ISO 4217.
// Nunca floats. El formateo según moneda/locale del tenant ocurre solo aquí.
// Escalable: agregar moneda = agregarla en config/regiones.config.ts.

// Monedas cuyo uso real no lleva decimales aunque ISO defina 2 (regla de producto).
const decimalesPorMoneda: Partial<Record<CodigoMoneda, number>> = {
  COP: 0,
}

function fractionDigits(currency: CodigoMoneda, locale: string): number {
  return (
    decimalesPorMoneda[currency] ??
    getNumberFormat(locale, { style: "currency", currency }).resolvedOptions()
      .maximumFractionDigits ??
    2
  )
}

// Unidad menor → unidad mayor según los decimales de la moneda.
export function toMajorUnits(
  amountMinor: number,
  currency: CodigoMoneda,
  locale = DEFAULT_LOCALE
): number {
  return amountMinor / 10 ** fractionDigits(currency, locale)
}

export function formatMoney(
  amountMinor: number,
  currency: CodigoMoneda,
  locale = DEFAULT_LOCALE
): string {
  const digits = fractionDigits(currency, locale)
  return getNumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(amountMinor / 10 ** digits)
}
