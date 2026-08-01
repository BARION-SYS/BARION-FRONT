import { api } from "@lib/http/instances"
import { omitEmpty } from "@shared/utils/params"
import {
  esquemaAltaMiembro,
  esquemaCambioRol,
  type DatosAltaMiembro,
  type DatosCambioRol,
} from "@features/equipo/schemas/equipo.schema"
import type { AltaMiembro, FiltrosEquipo, Miembro } from "@features/equipo/types/equipo.types"
import type { ApiResult } from "@shared/types/api.types"

export const equipoService = {
  async obtenerMiembros(filtros: FiltrosEquipo = {}): Promise<ApiResult<Miembro[]>> {
    return api.get<Miembro[]>("/equipo", { params: omitEmpty({ ...filtros }) })
  },

  /**
   * Alta directa: nace lista para entrar. La respuesta trae la contraseña
   * inicial UNA vez —no hay forma de volver a consultarla— y el identificador de
   * la ficha de barbero si esa persona atiende.
   */
  async crearMiembro(payload: DatosAltaMiembro): Promise<ApiResult<AltaMiembro>> {
    const validos = esquemaAltaMiembro.parse(payload)
    return api.post<AltaMiembro>("/equipo", validos)
  },

  /**
   * Volver a darle una clave a quien la perdió. La api la rechaza si esa cuenta
   * trabaja en otra barbería: ahí la contraseña es de la persona, no de quien la
   * dio de alta aquí.
   */
  async regenerarContrasena(
    membresiaId: string
  ): Promise<ApiResult<{ contrasenaInicial: string }>> {
    return api.post<{ contrasenaInicial: string }>(`/equipo/${membresiaId}/contrasena`, {})
  },

  async cambiarRolMiembro(
    membresiaId: string,
    payload: DatosCambioRol
  ): Promise<ApiResult<Miembro>> {
    const validos = esquemaCambioRol.parse(payload)
    return api.patch<Miembro>(`/equipo/${membresiaId}/rol`, validos)
  },

  /**
   * Revoca el acceso; no borra. Y no lo saca de la agenda: si atendía, su ficha
   * de barbero sigue en pie y pasa a ser un barbero sin cuenta.
   */
  async revocarMiembro(membresiaId: string): Promise<ApiResult<Miembro>> {
    return api.delete<Miembro>(`/equipo/${membresiaId}`)
  },
}
