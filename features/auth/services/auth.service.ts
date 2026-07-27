import { esquemaLogin, type DatosLogin } from "@features/auth/schemas/auth.schema"
import type { Sesion } from "@features/auth/types/auth.types"
import { api } from "@lib/http/instances"
import type { ApiResult } from "@shared/types/api.types"

// Autenticación real contra barion-api. La cookie de sesión la pone y la borra
// la API; aquí no se guarda ni se lee ningún token — el `withCredentials` del
// ApiClient es lo único que hace falta para que viaje en cada petición.

export const authService = {
  /**
   * Solo autentica: deja la cookie puesta y nada más. La API devuelve además un
   * cuerpo con la sesión, pero este front NO lo consume —de ahí el `unknown`—
   * porque dos orígenes para lo mismo terminan siendo dos verdades. Quién entró
   * lo dice `sesionActual()`, siempre.
   */
  async login(datos: DatosLogin): Promise<ApiResult<unknown>> {
    const { correo, contrasena } = esquemaLogin.parse(datos)
    // `correo` es el nombre del formulario; el contrato de la API usa `email`.
    return api.post<unknown>("/auth/login", { email: correo, contrasena })
  },

  /**
   * La sesión: quién es, de qué barbería y con qué permisos AHORA. Es la única
   * fuente — tras el login y tras cada recarga, porque la cookie sobrevive al
   * refresco y el estado del front no.
   */
  async sesionActual(): Promise<ApiResult<Sesion>> {
    return api.get<Sesion>("/auth/me")
  },

  async logout(): Promise<ApiResult<null>> {
    return api.post<null>("/auth/logout")
  },
}
