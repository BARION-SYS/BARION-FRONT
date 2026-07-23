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
}
