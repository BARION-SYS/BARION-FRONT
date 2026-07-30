export type TipoNotificacion = "cita" | "cliente" | "sistema"

export interface Notificacion {
  id: number
  titulo: string
  detalle: string
  /** Instante UTC ISO-8601. El "hace X" es del cliente (`useFormato().relativo`). */
  creadaEn: string
  leida: boolean
  tipo: TipoNotificacion
}
