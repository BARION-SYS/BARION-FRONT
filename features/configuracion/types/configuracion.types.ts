import type { LucideIcon } from "lucide-react"

/**
 * Sin `horarios`: el horario comercial es de la SEDE, no de la barbería, y vive
 * en `/dashboard/sedes`. Una cadena que abre en dos ciudades tiene dos semanas
 * distintas y no caben en un único formulario de configuración.
 */
export type IdSeccionConfiguracion =
  "general" | "apariencia" | "notificaciones" | "precios" | "seguridad"

export interface SeccionConfiguracion {
  id: IdSeccionConfiguracion
  etiqueta: string
  icono: LucideIcon
}

/**
 * Tipos ESPEJO del contrato de la API (`/barberias/mi`).
 *
 * Ni teléfono, ni correo, ni dirección: no son de la barbería. El contacto y la
 * dirección son de la SEDE —una cadena tiene varias— y se editan en
 * `/dashboard/sedes`.
 */
export interface FichaBarberia {
  /** Una línea, la cabecera del portal. */
  eslogan: string | null
  descripcion: string | null
  /** Viñetas de venta. El orden se respeta tal como llega. */
  ventajas: string[]
}

export interface MarcaBarberia {
  colorMarca: string | null
  colorFondo: string | null
  logoUrl: string | null
}

export type EstadoBarberia = "activa" | "suspendida" | "solo_lectura"

export type ModoImpuesto = "incluido" | "agregado"

export interface Barberia {
  id: string
  /** Su dirección pública: `/b/{slug}`. No se edita desde aquí. */
  slug: string
  nombreComercial: string
  razonSocial: string | null
  pais: string
  monedaPorDefecto: string
  localePorDefecto: string
  zonaHorariaPorDefecto: string
  modoImpuesto: ModoImpuesto
  /** Basis points: 1900 = 19 %. */
  tasaImpuestoBps: number | null
  ficha: FichaBarberia
  marca: MarcaBarberia
  estado: EstadoBarberia
}

export interface Servicio {
  id: number
  nombre: string
  precio: number
  duracionMin: number
}

export type CanalNotificacion = "whatsapp" | "sms" | "correo" | "interno"

export type CanalesNotificacion = Record<CanalNotificacion, boolean>

export interface InfoCanalNotificacion {
  canal: CanalNotificacion
  etiqueta: string
  descripcion: string
  /** Token de color, ej. `var(--chart-2)` */
  color: string
  activo: boolean
}
