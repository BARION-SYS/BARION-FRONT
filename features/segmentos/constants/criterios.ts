/**
 * Las seis formas de llenar un segmento dinámico, y son las únicas.
 *
 * La lista la impone la api: un `criterio.tipo` fuera de ella responde 422, y
 * con razón — un criterio que nadie sabe calcular deja el segmento vacío para
 * siempre y aun así se pinta junto al cliente, como si significara algo.
 *
 * ── Aquí está la ESTRUCTURA; el TEXTO vive en el diccionario ────────────────
 * Cómo se llama cada regla y cómo se le explica a una persona cambia con el
 * idioma; cómo se llama su parámetro en el contrato, no. Mezclarlos obligaría a
 * repetir `dias` y `visitas_min` en los tres diccionarios, y el día que alguien
 * corrigiera uno solo se enviaría un parámetro distinto según el idioma del
 * panel — un fallo que ninguna prueba de traducción buscaría.
 *
 * Lo que sí se queda: el nombre del parámetro, su valor por defecto y si es
 * dinero. Los tres son contrato, no copy.
 *
 * No existe «VIP» ni nada que dependa de un juicio que el sistema no puede
 * derivar de las citas. Para eso está el segmento estático, que se llena a mano.
 */

export type TipoCriterio =
  "inactivos" | "frecuentes" | "nuevos" | "cumpleanos_mes" | "gasto_minimo" | "riesgo"

export interface DefinicionCriterio {
  tipo: TipoCriterio
  /**
   * Cómo se llama el parámetro EN EL CONTRATO. `null` = el criterio no lleva
   * ninguno.
   */
  parametro: "dias" | "visitas_min" | "centavos" | "puntaje_max" | null
  /** Lo que la api asume si el parámetro no viaja. */
  porDefecto: number
  /**
   * El único que se teclea en unidad mayor y viaja en la menor. Va marcado y no
   * deducido del nombre: confundir las dos unidades es el fallo que ya enseñó
   * todo el panel multiplicado por cien.
   */
  esDinero?: boolean
}

export const CRITERIOS: readonly DefinicionCriterio[] = [
  { tipo: "inactivos", parametro: "dias", porDefecto: 60 },
  { tipo: "frecuentes", parametro: "visitas_min", porDefecto: 5 },
  { tipo: "nuevos", parametro: "dias", porDefecto: 30 },
  { tipo: "cumpleanos_mes", parametro: null, porDefecto: 0 },
  { tipo: "gasto_minimo", parametro: "centavos", porDefecto: 0, esDinero: true },
  { tipo: "riesgo", parametro: "puntaje_max", porDefecto: 30 },
] as const

export function definicionDe(tipo: string): DefinicionCriterio | undefined {
  return CRITERIOS.find((criterio) => criterio.tipo === tipo)
}

/**
 * El criterio guardado → lo que se precarga en el formulario.
 *
 * Un criterio que este front no conoce devuelve `undefined` en vez de caer al
 * primero de la lista: preferimos no poder editarlo a cambiárselo por otro sin
 * que nadie lo pida.
 */
export function valorDelCriterio(criterio: Record<string, unknown>): number | undefined {
  const definicion = definicionDe(String(criterio.tipo ?? ""))
  if (!definicion?.parametro) return undefined
  const valor = criterio[definicion.parametro]
  return typeof valor === "number" ? valor : definicion.porDefecto
}
