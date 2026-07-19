import { DEFAULT_LOCALE, getNumberFormat } from "@shared/utils/i18n"

// Formateo de números sin moneda (conteos, porcentajes, abreviados).

export function formatNumber(value: number, locale = DEFAULT_LOCALE): string {
  return getNumberFormat(locale, {}).format(value)
}

// value en escala 0–100 → "35 %"
export function formatPercent(value: number, locale = DEFAULT_LOCALE): string {
  return getNumberFormat(locale, { style: "percent", maximumFractionDigits: 1 }).format(value / 100)
}

// 21000 → "21 k" (ejes de gráficas, KPIs compactos)
export function formatCompact(value: number, locale = DEFAULT_LOCALE): string {
  return getNumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(value)
}
