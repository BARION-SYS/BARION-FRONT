// Los primeros pasos NO son un dominio de la API: son una lectura transversal de
// cuatro contratos que ya existen (`/sedes`, `/sedes/:id/horarios`, `/barberos`,
// `/barberos/:id/jornadas` y `/servicios`). Aquí solo se tipa lo que esa lectura
// deja: un booleano por paso.

import type { LucideIcon } from "lucide-react"
import type { Sede } from "@features/sedes/types/sedes.types"

/** Un paso del alta. El orden de la lista es el orden en que conviene hacerlos. */
export type ClavePasoInicial = "sede" | "horario" | "personas" | "catalogo" | "oferta" | "jornada"

/**
 * Qué está hecho y qué no, indexado por la clave del paso: así el componente
 * pregunta `progreso[paso.clave]` y no hace falta un mapa de traducción que se
 * desincronice al añadir un paso.
 */
export type ProgresoInicial = Record<ClavePasoInicial, boolean>

export interface PasoInicial {
  clave: ClavePasoInicial
  titulo: string
  descripcion: string
  /** Texto del enlace que lleva a la pantalla que lo resuelve. */
  accion: string
  href: string
  icono: LucideIcon
  /**
   * Capacidades que permiten EJECUTAR el paso; basta una. Ojo: es la de
   * escribir, no la de leer — a quien no puede crear sedes no se le pide que
   * complete una.
   */
  permisos: string[]
}

/**
 * Qué puede mirar esta sesión, para no pedir lo que va a responder 403.
 *
 * La sede llega ya cargada: la trae el `Navbar` para todo el panel
 * (`store/sede.store`) y volver a pedirla aquí sería un segundo origen del mismo
 * dato. El resto sí se consulta desde este feature.
 */
export interface AlcanceProgreso {
  /**
   * TODAS las sedes de la barbería, del store. Un paso de sede se da por hecho
   * si lo está en CUALQUIERA activa: quien abre una segunda sede completa no
   * tiene por qué seguir viendo pendiente la primera que dejó a medias.
   */
  sedes: Sede[]
  /** `barberos.ver` — sin él, `GET /barberos` es un 403. */
  leeBarberos: boolean
  /** `catalogo.ver` — sin él, `GET /servicios` es un 403. */
  leeCatalogo: boolean
}
