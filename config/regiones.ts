// Regiones donde opera Trimly. Agregar un país = agregar una entrada aquí.
// La config real de cada tenant llega de la API; esto define los valores por región.

export type CodigoRegion = "CO" | "US" | "ES"
export type CodigoMoneda = "COP" | "USD" | "EUR"

export interface ConfigRegional {
  moneda: CodigoMoneda
  locale: string
  timezone: string
}

export const regiones: Record<CodigoRegion, ConfigRegional> = {
  CO: { moneda: "COP", locale: "es-CO", timezone: "America/Bogota" },
  US: { moneda: "USD", locale: "en-US", timezone: "America/New_York" },
  ES: { moneda: "EUR", locale: "es-ES", timezone: "Europe/Madrid" },
}

// Región base del producto (Colombia).
export const REGION_DEFAULT: CodigoRegion = "CO"
