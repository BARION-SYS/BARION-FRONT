/**
 * El identificador público NO se le pregunta a nadie: sale del nombre de la
 * barbería.
 *
 * Pedirlo es pedir una decisión técnica a quien vino a montar una barbería —y
 * la mitad de las veces acaba en algo con espacios, tildes o mayúsculas que hay
 * que rechazar. Se genera, se comprueba que esté libre y se enseña ya resuelto.
 *
 * **Las variantes de un nombre ya tomado (`-2`, `-3`…) las busca la API**, no
 * este archivo: probarlas desde aquí costaba una petición por intento contra un
 * cupo por IP de veinte por minuto, así que la comprobación se agotaba sola y el
 * formulario acababa sin identificador que enseñar.
 */

/** Máximo que acepta la api (`@Length(2, 60)` en su DTO). */
const LARGO_MAXIMO = 60

/**
 * «Barbería El Corte» → «barberia-el-corte».
 *
 * Se quitan las tildes descomponiendo (NFD) y borrando los diacríticos: la ñ
 * cae a n, que es lo correcto en una dirección web. Lo que no sea letra o
 * número se vuelve guion, y los guiones no se repiten ni sobran en los bordes
 * —el patrón de la api rechaza `--` y los guiones al principio o al final.
 */
export function slugDesdeNombre(nombre: string): string {
  return nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, LARGO_MAXIMO)
    .replace(/-+$/g, "")
}

/** Si el nombre no deja ni dos caracteres útiles, no hay identificador válido. */
export function esSlugUtilizable(slug: string): boolean {
  return slug.length >= 2
}
