import { api } from "@lib/http/instances"
import {
  esquemaEditarRol,
  esquemaExcepciones,
  esquemaRol,
  type DatosEditarRol,
  type DatosExcepciones,
  type DatosRol,
} from "@features/roles/schemas/roles.schema"
import type { ExcepcionPermiso, Permiso, Rol } from "@features/roles/types/roles.types"
import type { ApiResult } from "@shared/types/api.types"

export const rolesService = {
  /** El catálogo de capacidades que existen. Sale del código de la API. */
  async obtenerPermisos(): Promise<ApiResult<Permiso[]>> {
    return api.get<Permiso[]>("/equipo/permisos")
  },

  async obtenerRoles(): Promise<ApiResult<Rol[]>> {
    return api.get<Rol[]>("/equipo/roles")
  },

  async crearRol(payload: DatosRol): Promise<ApiResult<Rol>> {
    const validos = esquemaRol.parse(payload)
    return api.post<Rol>("/equipo/roles", validos)
  },

  async actualizarRol(id: string, payload: DatosEditarRol): Promise<ApiResult<Rol>> {
    const validos = esquemaEditarRol.parse(payload)
    return api.patch<Rol>(`/equipo/roles/${id}`, validos)
  },

  async eliminarRol(id: string): Promise<ApiResult<null>> {
    return api.delete<null>(`/equipo/roles/${id}`)
  },

  async obtenerExcepciones(membresiaId: string): Promise<ApiResult<ExcepcionPermiso[]>> {
    return api.get<ExcepcionPermiso[]>(`/equipo/${membresiaId}/permisos`)
  },

  async reemplazarExcepciones(
    membresiaId: string,
    payload: DatosExcepciones
  ): Promise<ApiResult<null>> {
    const validos = esquemaExcepciones.parse(payload)
    return api.put<null>(`/equipo/${membresiaId}/permisos`, validos)
  },
}
