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

export interface Barberia {
  nombre: string
  telefono: string
  correo: string
  direccion: string
  descripcion: string
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
