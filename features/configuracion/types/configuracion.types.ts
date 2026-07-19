import type { LucideIcon } from "lucide-react"

export type IdSeccionConfiguracion =
  "general" | "apariencia" | "horarios" | "notificaciones" | "precios" | "seguridad"

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

export interface HorarioDia {
  dia: string
  abierto: boolean
  /** Hora local de la sede, formato HH:mm */
  apertura: string
  cierre: string
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
