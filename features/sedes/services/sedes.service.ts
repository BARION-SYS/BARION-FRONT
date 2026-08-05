import { api } from "@lib/http/instances"
import { omitEmpty } from "@shared/utils/params"
import {
  esquemaCierre,
  esquemaEditarCierre,
  esquemaEditarSede,
  esquemaHorarios,
  esquemaSede,
  type DatosCierre,
  type DatosEditarCierre,
  type DatosEditarSede,
  type DatosHorarios,
  type DatosSede,
} from "@features/sedes/schemas/sedes.schema"
import type {
  Cierre,
  FiltrosCierres,
  FiltrosSedes,
  HorarioSemanal,
  Sede,
} from "@features/sedes/types/sedes.types"
import type { ApiResult } from "@shared/types/api.types"

export const sedesService = {
  async obtenerSedes(filtros: FiltrosSedes = {}): Promise<ApiResult<Sede[]>> {
    return api.get<Sede[]>("/sedes", { params: omitEmpty({ ...filtros }) })
  },

  async crearSede(payload: DatosSede): Promise<ApiResult<Sede>> {
    const validos = esquemaSede.parse(payload)
    // Los opcionales vacíos no viajan: la API decide su valor por defecto y
    // mandarlos en blanco la obligaría a distinguir "" de ausente.
    return api.post<Sede>("/sedes", omitEmpty({ ...validos }))
  },

  async actualizarSede(id: string, payload: DatosEditarSede): Promise<ApiResult<Sede>> {
    const validos = esquemaEditarSede.parse(payload)
    return api.patch<Sede>(`/sedes/${id}`, omitEmpty({ ...validos }))
  },

  /** Soft delete: la sede conserva su historial de citas y liquidaciones. */
  async desactivarSede(id: string): Promise<ApiResult<Sede>> {
    return api.delete<Sede>(`/sedes/${id}`)
  },

  async activarSede(id: string): Promise<ApiResult<Sede>> {
    return api.post<Sede>(`/sedes/${id}/activar`, {})
  },

  /**
   * Genera un `slugQr` nuevo para la sede y devuelve la sede entera, ya rotada.
   *
   * **El código lo pone el servidor y no se manda uno propuesto**: es único entre
   * TODAS las barberías, así que la unicidad no se puede comprobar desde aquí.
   * Vive en este service —y no en el de `qr`— porque `/sedes/**` es de esta
   * feature; quien lo usa es la pantalla del cartón.
   */
  async rotarSlugQr(sedeId: string): Promise<ApiResult<Sede>> {
    return api.post<Sede>(`/sedes/${sedeId}/qr/rotar`, {})
  },

  async obtenerHorario(sedeId: string): Promise<ApiResult<HorarioSemanal>> {
    return api.get<HorarioSemanal>(`/sedes/${sedeId}/horarios`)
  },

  /** Sustituye la semana entera: es lo que permite quitar un tramo. */
  async reemplazarHorario(
    sedeId: string,
    payload: DatosHorarios
  ): Promise<ApiResult<HorarioSemanal>> {
    const validos = esquemaHorarios.parse(payload)
    return api.put<HorarioSemanal>(`/sedes/${sedeId}/horarios`, validos)
  },

  async obtenerCierres(sedeId: string, filtros: FiltrosCierres = {}): Promise<ApiResult<Cierre[]>> {
    return api.get<Cierre[]>(`/sedes/${sedeId}/cierres`, {
      params: omitEmpty({ ...filtros }),
    })
  },

  async crearCierre(sedeId: string, payload: DatosCierre): Promise<ApiResult<Cierre>> {
    const validos = esquemaCierre.parse(payload)
    return api.post<Cierre>(`/sedes/${sedeId}/cierres`, validos)
  },

  async actualizarCierre(
    sedeId: string,
    cierreId: string,
    payload: DatosEditarCierre
  ): Promise<ApiResult<Cierre>> {
    const validos = esquemaEditarCierre.parse(payload)
    return api.patch<Cierre>(`/sedes/${sedeId}/cierres/${cierreId}`, omitEmpty({ ...validos }))
  },

  async cancelarCierre(sedeId: string, cierreId: string): Promise<ApiResult<null>> {
    return api.delete<null>(`/sedes/${sedeId}/cierres/${cierreId}`)
  },
}
