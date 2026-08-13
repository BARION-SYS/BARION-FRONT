import { api } from "@lib/http/instances"
import { omitEmpty } from "@shared/utils/params"
import {
  esquemaAsignacionServicio,
  esquemaOferta,
  esquemaServicio,
  type DatosAsignacionServicio,
  type DatosOferta,
  type DatosServicio,
} from "@features/servicios/schemas/servicios.schema"
import type {
  FiltrosServicios,
  LineaOferta,
  Servicio,
} from "@features/servicios/types/servicios.types"
import type { ApiResult } from "@shared/types/api.types"

export const serviciosService = {
  async obtenerServicios(filtros: FiltrosServicios = {}): Promise<ApiResult<Servicio[]>> {
    return api.get<Servicio[]>("/servicios", { params: omitEmpty({ ...filtros }) })
  },

  async crearServicio(payload: DatosServicio): Promise<ApiResult<Servicio>> {
    const validos = esquemaServicio.parse(payload)
    // Los opcionales vacíos no viajan: la API decide su valor por defecto y
    // mandarlos en blanco la obligaría a distinguir "" de ausente.
    return api.post<Servicio>("/servicios", omitEmpty({ ...validos }))
  },

  async actualizarServicio(id: string, payload: DatosServicio): Promise<ApiResult<Servicio>> {
    const validos = esquemaServicio.parse(payload)
    return api.patch<Servicio>(`/servicios/${id}`, omitEmpty({ ...validos }))
  },

  /** Soft delete: las citas ya atendidas siguen apuntando a este servicio. */
  async desactivarServicio(id: string): Promise<ApiResult<Servicio>> {
    return api.delete<Servicio>(`/servicios/${id}`)
  },

  /** Reactivar, y también APROBAR la propuesta de un barbero: misma ruta. */
  async activarServicio(id: string): Promise<ApiResult<Servicio>> {
    return api.post<Servicio>(`/servicios/${id}/activar`, {})
  },

  async obtenerOferta(barberoId: string, soloActivas = false): Promise<ApiResult<LineaOferta[]>> {
    return api.get<LineaOferta[]>(`/barberos/${barberoId}/servicios`, {
      params: omitEmpty({ soloActivas }),
    })
  },

  /** Sustituye la oferta entera: es lo que permite quitar un servicio. */
  async reemplazarOferta(
    barberoId: string,
    payload: DatosOferta
  ): Promise<ApiResult<LineaOferta[]>> {
    const validos = esquemaOferta.parse(payload)
    return api.put<LineaOferta[]>(`/barberos/${barberoId}/servicios`, validos)
  },

  /** La misma oferta, preguntada desde el servicio: quién lo hace. */
  async obtenerBarberosDelServicio(
    servicioId: string,
    soloActivas = false
  ): Promise<ApiResult<LineaOferta[]>> {
    return api.get<LineaOferta[]>(`/servicios/${servicioId}/barberos`, {
      params: omitEmpty({ soloActivas }),
    })
  },

  /**
   * Deja exactamente a esos barberos ofreciendo el servicio. Lista completa: lo
   * que no viene se desactiva, y quien sale conserva el resto de su carta.
   */
  async asignarBarberos(
    servicioId: string,
    payload: DatosAsignacionServicio
  ): Promise<ApiResult<LineaOferta[]>> {
    const validos = esquemaAsignacionServicio.parse(payload)
    return api.put<LineaOferta[]>(`/servicios/${servicioId}/barberos`, validos)
  },
}
