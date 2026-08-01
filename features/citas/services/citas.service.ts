import { api } from "@lib/http/instances"
import { omitEmpty } from "@shared/utils/params"
import {
  esquemaCita,
  esquemaEstadoCita,
  esquemaReprogramar,
  type DatosCita,
  type DatosEstadoCita,
  type DatosReprogramar,
} from "@features/citas/schemas/citas.schema"
import type {
  AsientoHistorialCita,
  Cita,
  Disponibilidad,
  FiltrosCitas,
} from "@features/citas/types/citas.types"
import type { ApiResult } from "@shared/types/api.types"

export const citasService = {
  async obtenerCitas(filtros: FiltrosCitas = {}): Promise<ApiResult<Cita[]>> {
    return api.get<Cita[]>("/citas", { params: omitEmpty({ ...filtros }) })
  },

  async obtenerCita(id: string): Promise<ApiResult<Cita>> {
    return api.get<Cita>(`/citas/${id}`)
  },

  async obtenerHistorial(id: string): Promise<ApiResult<AsientoHistorialCita[]>> {
    return api.get<AsientoHistorialCita[]>(`/citas/${id}/historial`)
  },

  /**
   * Qué huecos hay. **Propone, no garantiza**: entre esta consulta y la reserva
   * cabe otra, así que un 409 al crear significa que alguien se adelantó y hay
   * que volver a pedir disponibilidad.
   */
  async obtenerDisponibilidad(params: {
    sedeId: string
    ofertaIds: string[]
    desde: string
    barberoId?: string
    dias?: number
  }): Promise<ApiResult<Disponibilidad>> {
    return api.get<Disponibilidad>("/agenda/disponibilidad", {
      params: omitEmpty({ ...params }),
    })
  },

  async crearCita(payload: DatosCita): Promise<ApiResult<Cita>> {
    const validos = esquemaCita.parse(payload)
    return api.post<Cita>("/citas", omitEmpty({ ...validos }))
  },

  async reprogramarCita(id: string, payload: DatosReprogramar): Promise<ApiResult<Cita>> {
    const validos = esquemaReprogramar.parse(payload)
    return api.patch<Cita>(`/citas/${id}/reprogramar`, omitEmpty({ ...validos }))
  },

  /** Se envía el estado DESTINO; la api valida si el salto es legal. */
  async cambiarEstadoCita(id: string, payload: DatosEstadoCita): Promise<ApiResult<Cita>> {
    const validos = esquemaEstadoCita.parse(payload)
    return api.post<Cita>(`/citas/${id}/estado`, omitEmpty({ ...validos }))
  },
}
