// Tipos ESPEJO del contrato de la API (`/plataforma/**` y `/publico/planes`),
// mantenidos a mano contra su Swagger — no se comparte código entre repos.

export type EstadoBarberia = "activa" | "suspendida" | "solo_lectura"

export interface SuscripcionResumen {
  estado: string
  planCodigo: string | null
}

/** Fila del inventario que ve el staff de Barion. */
export interface BarberiaInventario {
  id: string
  slug: string
  nombreComercial: string
  codigoPais: string
  estado: EstadoBarberia
  /** Instante UTC ISO-8601. El formateo es del cliente. */
  creadoEn: string
  sedesActivas: number
  barberosActivos: number
  /** `null` mientras la barbería no tenga suscripción. */
  suscripcion: SuscripcionResumen | null
}

/** La ficha añade lo que no cabe en una fila de tabla. */
export interface BarberiaFicha extends BarberiaInventario {
  monedaPorDefecto: string
  zonaHoraria: string
  membresiasActivas: number
  pruebaTerminaEn: string | null
}

export interface FiltrosInventario {
  estado?: EstadoBarberia
  busqueda?: string
  page?: number
  limit?: number
  /** `false` trae el inventario entero sin paginar — lo que necesita el resumen. */
  paginar?: boolean
}

/**
 * Un precio del plan en un país.
 *
 * `montoCentavos` viaja como CADENA porque en la base es `bigint` y en JSON no
 * cabe: se convierte en esta frontera y en ningún otro sitio. `moneda` es un ISO
 * 4217 cualquiera — la API acepta más de las tres que este front sabe formatear.
 */
export interface PrecioPlan {
  codigoPais: string
  montoCentavos: string
  moneda: string
  /** `mensual` | `anual`. */
  periodo: string
}

/**
 * Un plan del catálogo comercial.
 *
 * `funciones` son CLAVES —`["agenda","portal"]`—, no frases de venta: en la base
 * son banderas de producto y de ellas depende qué módulo está encendido. Quien
 * las pinta las traduce (`constants/planes.copy.ts` de esta feature).
 *
 * `limites` llega como el jsonb tal cual; `null` en una clave = sin techo.
 */
export interface PlanPlataforma {
  codigo: string
  nombre: string
  limites: Record<string, number | null>
  funciones: string[]
  precios: PrecioPlan[]
}

/** Lo que sale de contar el inventario — no lo calcula la API, lo deriva el front. */
export interface ResumenPlataforma {
  total: number
  porEstado: Record<EstadoBarberia, number>
  sedesActivas: number
  barberosActivos: number
  /** Barberías todavía sin suscripción: son las que nunca se han cobrado. */
  sinSuscripcion: number
  /** Las que están en prueba, según el estado de su suscripción. */
  enPrueba: number
}

/** Un corte del inventario por una dimensión (estado, país, plan). */
export interface SegmentoInventario {
  clave: string
  etiqueta: string
  total: number
}
