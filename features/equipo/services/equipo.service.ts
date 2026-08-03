import { api } from "@lib/http/instances"
import { omitEmpty } from "@shared/utils/params"
import {
  esquemaAltaMiembro,
  esquemaCambioRol,
  type DatosAltaMiembro,
  type DatosCambioRol,
} from "@features/equipo/schemas/equipo.schema"
import type {
  AltaMiembro,
  FiltrosEquipo,
  Miembro,
  RevocacionMiembro,
} from "@features/equipo/types/equipo.types"
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
    // Los opcionales vacíos no viajan: la api rechaza `sedeId: ""` y una
    // comisión omitida no es lo mismo que una comisión en blanco.
    return api.post<AltaMiembro>("/equipo", omitEmpty({ ...validos }))
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
   * «Esta persona ya no trabaja aquí»: revoca el acceso Y la retira de la
   * agenda, en una sola operación. No borra —el historial se queda— y **no
   * cancela sus citas futuras**: la respuesta las enumera para poder llamar a
   * cada cliente.
   */
  async revocarMiembro(membresiaId: string): Promise<ApiResult<RevocacionMiembro>> {
    return api.delete<RevocacionMiembro>(`/equipo/${membresiaId}`)
  },
}
