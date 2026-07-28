import type { LucideIcon } from "lucide-react"

export type SeccionRuta = "principal" | "operacion" | "finanzas" | "herramientas"

/** Estilo de entrada de la vista al navegar a la sección (TransicionVista) */
export type EntradaVista = "subir" | "bajar" | "izquierda" | "derecha" | "zoom" | "fundido"

export interface RutaApp {
  clave: string
  href: string
  etiqueta: string
  titulo: string
  subtitulo: string
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
