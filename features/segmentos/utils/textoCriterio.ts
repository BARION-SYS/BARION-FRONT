import type { TipoCriterio } from "@features/segmentos/constants/criterios"

/**
 * Lo que este helper necesita saber del traductor, y nada más.
 *
 * Es un tipo estructural —«algo que se llama con estas claves y devuelve
 * texto»— y no el `Translator` de la librería: mantiene a esta carpeta de
 * dominio sin dependencias de la infraestructura de i18n, y una clave mal
 * escrita sigue sin compilar porque están todas enumeradas aquí.
 */
type ClaveCriterio =
  | "inactivos"
  | "inactivosAyuda"
  | "inactivosParametro"
  | "frecuentes"
  | "frecuentesAyuda"
  | "frecuentesParametro"
  | "nuevos"
  | "nuevosAyuda"
  | "nuevosParametro"
  | "cumpleanos"
  | "cumpleanosAyuda"
  | "gasto"
  | "gastoAyuda"
  | "gastoParametro"
  | "riesgo"
  | "riesgoAyuda"
  | "riesgoParametro"

type TraductorCriterios = (clave: ClaveCriterio) => string

/**
 * El texto de cada regla, sacado del catálogo por su tipo.
 *
 * Vive aquí y no dentro de la tabla de criterios porque son dos cosas que
 * cambian por razones distintas: el texto con el idioma, el nombre del
 * parámetro nunca. Y vive aquí y no en el componente porque lo usan dos —el
 * formulario para preguntarlo y la lista para explicarlo—, y una segunda copia
 * de este `switch` es una que se queda sin la regla que se añada mañana.
 *
 * Es un mapa explícito y no una clave construida (`t(tipo)`): así una regla
 * nueva **no compila** hasta que tenga su texto en los tres idiomas, que es
 * exactamente el fallo que el catálogo tipado existe para cazar.
 */
export function textoCriterio(
  t: TraductorCriterios,
  tipo: TipoCriterio
): { etiqueta: string; ayuda: string; parametro: string } {
  switch (tipo) {
    case "inactivos":
      return {
        etiqueta: t("inactivos"),
        ayuda: t("inactivosAyuda"),
        parametro: t("inactivosParametro"),
      }
    case "frecuentes":
      return {
        etiqueta: t("frecuentes"),
        ayuda: t("frecuentesAyuda"),
        parametro: t("frecuentesParametro"),
      }
    case "nuevos":
      return { etiqueta: t("nuevos"), ayuda: t("nuevosAyuda"), parametro: t("nuevosParametro") }
    case "cumpleanos_mes":
      return { etiqueta: t("cumpleanos"), ayuda: t("cumpleanosAyuda"), parametro: "" }
    case "gasto_minimo":
      return { etiqueta: t("gasto"), ayuda: t("gastoAyuda"), parametro: t("gastoParametro") }
    case "riesgo":
      return { etiqueta: t("riesgo"), ayuda: t("riesgoAyuda"), parametro: t("riesgoParametro") }
  }
}
