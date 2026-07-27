import { esquemaLogin, type DatosLogin } from "@features/auth/schemas/auth.schema"
import type { Sesion, SesionActual } from "@features/auth/types/auth.types"
import { api } from "@lib/http/instances"
import type { ApiResult } from "@shared/types/api.types"

// Autenticación real contra barion-api. La cookie de sesión la pone y la borra
// la API; aquí no se guarda ni se lee ningún token — el `withCredentials` del
// ApiClient es lo único que hace falta para que viaje en cada petición.

export const authService = {
  async login(datos: DatosLogin): Promise<ApiResult<Sesion>> {
    const { barberiaSlug, correo, contrasena } = esquemaLogin.parse(datos)
    // `correo` es el nombre del formulario; el contrato de la API usa `email`.
    return api.post<Sesion>("/auth/login", { barberiaSlug, email: correo, contrasena })
  },

  /** Rehidrata la sesión al recargar: la cookie sobrevive, el estado del front no. */
  async sesionActual(): Promise<ApiResult<SesionActual>> {
    return api.get<SesionActual>("/auth/yo")
  },

  async logout(): Promise<ApiResult<null>> {
    return api.post<null>("/auth/logout")
  },
}
