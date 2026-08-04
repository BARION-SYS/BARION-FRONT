import { DEFAULT_LOCALE, getNumberFormat } from "@shared/utils/i18n"

// Dinero: la API SIEMPRE entrega unidad menor (centavos) + código ISO 4217.
// Nunca floats. El formateo según moneda/locale del tenant ocurre solo aquí.

/**
 * Cuántos ceros separan lo que guarda la API de lo que se lee: el exponente de
 * la unidad menor según ISO 4217. Para las monedas de Barion es 2 — el peso, el
 * dólar y el euro se guardan en centavos.
 *
 * **Esto NO son los decimales que se pintan**, y confundirlos cuesta un factor
 * cien. El peso colombiano se enseña sin decimales —CLDR dice 0 y por eso
 * `Intl` los quita solo— pero su unidad menor sigue siendo de dos: `8900000`
 * son $ 89.000, no $ 8.900.000. Los decimales visibles los decide el
 * formateador; la escala, esta tabla y solo esta.
 *
 * Indexado por código y no por `CodigoMoneda`: la API cotiza por país —el
 * catálogo de planes trae una moneda por mercado— y una moneda que este front
 * todavía no opera se tiene que poder leer.
 */
const escalaPorMoneda: Record<string, number> = {
  COP: 2,
  USD: 2,
  EUR: 2,
}

/**
 * Casi toda moneda ISO 4217 tiene unidad menor de dos; las que no (JPY, CLP)
 * son la excepción. Una moneda sin entrada arriba se escala como la mayoría en
 * vez de reventar: lo peor que puede pasar con un mercado nuevo es que su
 * precio se lea raro un día, no que la pantalla no cargue.
 */
const ESCALA_POR_DEFECTO = 2

function escalaDe(currency: string): number {
  return escalaPorMoneda[currency] ?? ESCALA_POR_DEFECTO
}

/** Unidad menor → unidad mayor. El único sitio donde se divide. */
export function toMajorUnits(amountMinor: number, currency: string): number {
  return amountMinor / 10 ** escalaDe(currency)
}

/**
 * Unidad mayor → unidad menor. Es la que necesita todo formulario que pide un
 * precio: quien lo escribe piensa en pesos, la API solo acepta centavos.
 * `Math.round` cierra el paso al 0.1+0.2 del binario, que llegaría a la base
 * como un centavo de menos.
 */
export function toMinorUnits(amountMajor: number, currency: string): number {
  return Math.round(amountMajor * 10 ** escalaDe(currency))
}

/**
 * El importe para leer. Los decimales visibles los pone el formateador según
 * moneda y locale —CLDR ya sabe que el peso colombiano no los lleva y el euro
 * sí—, así que aquí no se fuerzan: forzarlos con la escala fue exactamente lo
 * que multiplicaba el precio por cien.
 */
export function formatMoney(
  amountMinor: number,
  currency: string,
  locale = DEFAULT_LOCALE
): string {
  return getNumberFormat(locale, { style: "currency", currency }).format(
    toMajorUnits(amountMinor, currency)
  )
}
