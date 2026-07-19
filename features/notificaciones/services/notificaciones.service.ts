import datos from "@features/notificaciones/constants/notificaciones.json"
import type { ApiResult } from "@shared/types/api.types"
import type { Notificacion } from "@features/notificaciones/types/notificaciones.types"

// Copia en memoria — al integrar la API se reemplaza por api de @lib/http/instances.
let notificaciones = [...(datos.notificaciones as Notificacion[])]

function ok<T>(data: T, message = "ok"): ApiResult<T> {
  return { data, status: 200, message, pagination: null }
}

export const notificacionesService = {
  async obtenerNotificaciones(): Promise<ApiResult<Notificacion[]>> {
    return ok([...notificaciones])
  },

  async marcarLeida(id: number): Promise<ApiResult<null>> {
    notificaciones = notificaciones.map((n) => (n.id === id ? { ...n, leida: true } : n))
    return ok(null, "Notificación leída")
  },

  async marcarTodasLeidas(): Promise<ApiResult<null>> {
    notificaciones = notificaciones.map((n) => ({ ...n, leida: true }))
    return ok(null, "Notificaciones al día")
  },
}
