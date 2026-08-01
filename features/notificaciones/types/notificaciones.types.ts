/** Espejo del contrato de `docs/frontend/api-barion/notificaciones/`. */

/** De qué habla. Lo deriva la api del evento que la originó. */
export type GrupoNotificacion = "cita" | "cliente" | "equipo" | "sistema"

export interface Notificacion {
  id: string
  grupo: GrupoNotificacion
  /** El nombre del evento, por si hace falta el detalle fino. */
  tipo: string
  titulo: string | null
  detalle: string | null
  /**
   * A qué apunta. Con los dos se arma el enlace: **la api no manda URL** porque
   * las rutas del panel son de este repo.
   */
  entidad: string | null
  entidadId: string | null
  leida: boolean
  leidaEn: string | null
  /** Instante UTC ISO-8601. El "hace X" es del cliente (`useFormato().relativo`). */
  creadaEn: string
}

export interface FiltrosNotificaciones {
  soloNoLeidas?: boolean
  paginar?: boolean
  page?: number
  limit?: number
}
