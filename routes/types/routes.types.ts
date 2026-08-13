import type { LucideIcon } from "lucide-react"
import type { Diccionario } from "@shared/textos/diccionarios/es-CO"

/**
 * La clave con la que una ruta busca su nombre en el diccionario.
 *
 * Sale del propio diccionario, así que **una ruta nueva no compila hasta que
 * tiene texto** en los tres idiomas. Es la comprobación que antes no existía:
 * el nombre vivía escrito aquí en español y no había nada que obligara a
 * traducirlo.
 */
export type ClaveRuta = keyof Diccionario["navegacion"]["rutas"]

/** Igual para el rótulo de un grupo del sidebar. */
export type ClaveGrupo = keyof Diccionario["navegacion"]["grupos"]

export type SeccionRuta = "principal" | "operacion" | "finanzas" | "herramientas"

/** Estilo de entrada de la vista al navegar a la sección (TransicionVista) */
export type EntradaVista = "subir" | "bajar" | "izquierda" | "derecha" | "zoom" | "fundido"

export interface RutaApp {
  /** Con esto se busca su etiqueta, su título y su subtítulo (ver `ClaveRuta`). */
  clave: ClaveRuta
  href: string
  icono: LucideIcon
  /** Grupo del sidebar — las secciones se renderizan en este orden */
  seccion: SeccionRuta
  /** Animación de entrada de la sección — default "subir" */
  entrada?: EntradaVista
  /**
   * Capacidades que habilitan esta sección. Basta con tener UNA.
   *
   * "Alguna de" y no "todas" porque varias secciones sirven a dos actores con
   * alcances distintos: la agenda la abre quien la ve entera y también el
   * barbero que solo ve la suya, y son permisos diferentes.
   *
   * Sin la lista, la sección la ve todo el mundo. Es lo correcto para lo que no
   * discrimina —el resumen de entrada— y hay que declararlo a propósito, no por
   * olvido.
   */
  permisos?: string[]
}

/** Un grupo del sidebar: su hueco en el layout y su rótulo en el diccionario. */
export interface GrupoSidebar {
  id: SeccionRuta
  clave: ClaveGrupo
}
