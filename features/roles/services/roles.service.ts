import { api } from "@lib/http/instances"
import { esquemaExcepciones, type DatosExcepciones } from "@features/roles/schemas/roles.schema"
import type { ExcepcionPermiso, Permiso, Rol } from "@features/roles/types/roles.types"
import type { ApiResult } from "@shared/types/api.types"

export const rolesService = {
  /** El catálogo de capacidades que existen. Sale del código de la API. */
  async obtenerPermisos(): Promise<ApiResult<Permiso[]>> {
    return api.get<Permiso[]>("/equipo/permisos")
  },

  /** Los roles que define Barion. Solo lectura: no hay alta, edición ni borrado. */
  async obtenerRoles(): Promise<ApiResult<Rol[]>> {
    return api.get<Rol[]>("/equipo/roles")
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
