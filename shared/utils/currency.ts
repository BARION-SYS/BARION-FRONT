import { DEFAULT_LOCALE, getNumberFormat } from "@shared/utils/i18n"

// Dinero: la API SIEMPRE entrega unidad menor (centavos) + código ISO 4217.
// Nunca floats. El formateo según moneda/locale del tenant ocurre solo aquí.

/**
 * Cuántos ceros separan lo que guarda la API de lo que se lee: el exponente de
 * la unidad menor según ISO 4217. Para las monedas de Barion es 2 — el peso, el
 * dólar y el euro se guardan en centavos.
 *
 * **Esto NO son los decimales que se pintan**, y confundirlos cuesta un factor
 * cien. El peso colombiano se enseña sin decimales pero su unidad menor sigue
 * siendo de dos: `8900000` son $ 89.000, no $ 8.900.000. Los decimales visibles
 * son `decimalesPorMoneda`; la escala, esta tabla y solo esta.
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

/**
 * Cuántos decimales se PINTAN. Otra tabla, otra cosa.
 *
 * Son los valores de CLDR —el peso colombiano no lleva, el dólar y el euro sí—
 * pero se declaran aquí en vez de dejárselos al formateador, y no por gusto:
 * **`Intl` no da el mismo resultado en el servidor que en el navegador**. Cada
 * uno trae su versión de ICU y sus datos de moneda cambian entre versiones; el
 * mismo importe salía `$ 1.280.000` en Node 22 (ICU 78) y `$ 1.280.000,00` en el
 * navegador. Todo lo que se sirva renderizado y se hidrate después revienta con
 * eso: React ve dos textos distintos y repinta el árbol entero en el cliente.
 *
 * Hoy este front pide sus datos DESPUÉS de montar —el HTML del servidor lleva
 * skeletons, no importes— así que el fallo no está a la vista. Depende de un
 * detalle que puede cambiar el día que una pantalla renderice un precio en el
 * servidor, y entonces el síntoma no señalaría a este archivo.
 */
const decimalesPorMoneda: Record<string, number> = {
  COP: 0,
  USD: 2,
  EUR: 2,
}

/**
 * Como la escala: la mayoría de monedas ISO 4217 se enseñan con dos decimales.
 * Una moneda que este front todavía no opera se lee con el criterio de la
 * mayoría —a lo sumo raro un día, nunca una pantalla que no carga— y **igual en
 * los dos lados**, que es lo único que no se puede negociar aquí.
 */
const DECIMALES_POR_DEFECTO = 2

function decimalesDe(currency: string): number {
  return decimalesPorMoneda[currency] ?? DECIMALES_POR_DEFECTO
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
 * El importe para leer. Los decimales salen de `decimalesPorMoneda` y **se le
 * imponen al formateador**, para que el texto no dependa de qué ICU tenga
 * delante.
 *
 * Que se fijen aquí no reabre el error del factor cien: los que se pintan y los
 * que dividen son dos tablas distintas, y quien divide es `toMajorUnits` con
 * `escalaPorMoneda`. Lo que multiplicaba el precio por cien era usar LA MISMA
 * para las dos cosas.
 */
export function formatMoney(
  amountMinor: number,
  currency: string,
  locale = DEFAULT_LOCALE
): string {
  const decimales = decimalesDe(currency)
  return getNumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(toMajorUnits(amountMinor, currency))
}

/**
 * «$ 2,5 M»: el importe abreviado, para los ejes de una gráfica y las cifras
 * que se leen de un vistazo. La cifra exacta sigue siendo `formatMoney`, que es
 * la que va en el tooltip.
 */
export function formatMoneyCompact(
  amountMinor: number,
  currency: string,
  locale = DEFAULT_LOCALE
): string {
  return getNumberFormat(locale, {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(toMajorUnits(amountMinor, currency))
}
