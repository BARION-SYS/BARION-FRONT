import type { LucideIcon } from "lucide-react"

export type SeccionRuta = "principal" | "operacion" | "finanzas" | "herramientas"

export interface RutaApp {
  clave: string
  href: string
  etiqueta: string
  titulo: string
  subtitulo: string
  icono: LucideIcon
  /** Grupo del sidebar — las secciones se renderizan en este orden */
  seccion: SeccionRuta
}
