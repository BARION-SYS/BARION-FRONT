import { api } from "@lib/http/instances"
import { omitEmpty } from "@shared/utils/params"
import type {
  FiltrosNotificaciones,
  Notificacion,
} from "@features/notificaciones/types/notificaciones.types"
import type { ApiResult } from "@shared/types/api.types"

/**
 * La bandeja in-app. **Solo llega `canal = inapp`**: los envíos externos
 * (WhatsApp, SMS, email, push) son del worker y no se leen desde el panel.
 *
 * No hay ruta para crear una: las escribe el worker al consumir el evento del
 * outbox. Mientras ese consumidor no exista, la bandeja llega vacía — y eso no
 * es un error que haya que distinguir de "no hay nada nuevo".
 */
export const notificacionesService = {
  async obtenerNotificaciones(
    filtros: FiltrosNotificaciones = {}
  ): Promise<ApiResult<Notificacion[]>> {
    return api.get<Notificacion[]>("/notificaciones", { params: omitEmpty({ ...filtros }) })
  },

  /** Lo que necesita el punto de la campana, sin traerse la lista. */
  async obtenerNoLeidas(): Promise<ApiResult<{ noLeidas: number }>> {
    return api.get<{ noLeidas: number }>("/notificaciones/no-leidas")
  },

  async marcarLeida(id: string): Promise<ApiResult<Notificacion>> {
    return api.post<Notificacion>(`/notificaciones/${id}/leer`)
  },

  async marcarTodasLeidas(): Promise<ApiResult<{ marcadas: number }>> {
    return api.post<{ marcadas: number }>("/notificaciones/leer-todas")
  },
}
