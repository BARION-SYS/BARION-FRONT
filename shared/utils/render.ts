import { isValidElement, type ReactNode } from "react"

/**
 * Si el `render` de un primitivo de base-ui produce un `<button>` nativo.
 *
 * Base UI asume que sí (`nativeButton` por defecto `true`) y avisa por consola
 * cuando no es cierto, porque entonces tiene que poner él el `role`, el
 * `tabIndex` y los handlers de teclado. Componer un botón con `<Link>` o `<a>`
 * es lo normal aquí, así que se deduce del elemento en vez de repetir la
 * bandera en cada llamada.
 *
 * Sin `render` es un `<button>` de verdad. Con un `render` que es función no se
 * puede saber qué devuelve: se deja el default de base-ui y quien lo use pasa
 * `nativeButton` a mano si hace falta.
 */
export function esBotonNativo(render: ReactNode | unknown): boolean {
  if (!isValidElement(render)) return true
  return render.type === "button"
}
