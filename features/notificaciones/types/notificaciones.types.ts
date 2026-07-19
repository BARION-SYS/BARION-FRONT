export type TipoNotificacion = "cita" | "cliente" | "sistema"

export interface Notificacion {
  id: number
  titulo: string
  detalle: string
  hace: string
  leida: boolean
  tipo: TipoNotificacion
}
