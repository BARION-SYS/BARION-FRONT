import { api } from "@lib/http/instances"
import { omitEmpty } from "@shared/utils/params"
import {
  esquemaCambioRol,
  esquemaInvitacion,
  type DatosCambioRol,
  type DatosInvitacion,
} from "@features/equipo/schemas/equipo.schema"
import type { FiltrosEquipo, Miembro } from "@features/equipo/types/equipo.types"
import type { ApiResult } from "@shared/types/api.types"

export const equipoService = {
  async obtenerMiembros(filtros: FiltrosEquipo = {}): Promise<ApiResult<Miembro[]>> {
    return api.get<Miembro[]>("/equipo", { params: omitEmpty({ ...filtros }) })
  },

  async invitarMiembro(payload: DatosInvitacion): Promise<ApiResult<Miembro>> {
    const validos = esquemaInvitacion.parse(payload)
    return api.post<Miembro>("/equipo", validos)
  },

  async cambiarRolMiembro(
    membresiaId: string,
    payload: DatosCambioRol
  ): Promise<ApiResult<Miembro>> {
    const validos = esquemaCambioRol.parse(payload)
    return api.patch<Miembro>(`/equipo/${membresiaId}/rol`, validos)
  },

  /** Revoca el acceso; no borra. Un revocado puede volver a ser invitado. */
  async revocarMiembro(membresiaId: string): Promise<ApiResult<Miembro>> {
    return api.delete<Miembro>(`/equipo/${membresiaId}`)
  },
}
