import type { CodigoRegion } from "@config/regiones"

/**
 * Los idiomas de la aplicación.
 *
 * Son **locales completos y no idiomas sueltos** (`es-CO`, no `es`) por lo mismo
 * que `config/regiones.ts` guarda uno por país: el texto y el formato tienen que
 * decidirse con el mismo dato. Con `es` a secas habría que elegir después entre
 * `es-CO` y `es-ES` para formatear una fecha, y esa segunda elección es
 * exactamente donde se cuela la incoherencia.
 *
 * Que Colombia y España compartan lengua no los hace el mismo diccionario: el
 * teléfono es «celular» en uno y «móvil» en el otro, y una pantalla que dice la
 * palabra de otro país se lee como traducida a medias.
 */
export const IDIOMAS = ["es-CO", "es-ES", "en-US"] as const

export type Idioma = (typeof IDIOMAS)[number]

/**
 * El idioma que le corresponde a cada mercado.
 *
 * Es el DEFAULT, no una imposición: encima va la preferencia de la persona
 * (`store/idioma.store.ts`). Y es el mismo criterio que la moneda o la zona
 * horaria — se deduce de dónde opera el negocio, no de qué trae el navegador,
 * porque el navegador es de quien mira y el panel es de la barbería.
 */
export const IDIOMA_POR_REGION: Record<CodigoRegion, Idioma> = {
  CO: "es-CO",
  ES: "es-ES",
  US: "en-US",
}

/**
 * Cómo se llama cada idioma **en ese idioma**.
 *
 * Nunca traducido al idioma activo: quien tiene el panel en un idioma que no
 * entiende necesita reconocer el suyo en la lista, y «Spanish (Colombia)» no lo
 * ayuda a encontrarlo.
 */
export const ETIQUETA_IDIOMA: Record<Idioma, string> = {
  "es-CO": "Español (Colombia)",
  "es-ES": "Español (España)",
  "en-US": "English (US)",
}
