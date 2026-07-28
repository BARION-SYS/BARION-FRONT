import { esquemaLogin, type DatosLogin } from "@features/auth/schemas/auth.schema"
import type { ResultadoLogin, Sesion } from "@features/auth/types/auth.types"
import { api } from "@lib/http/instances"
import type { ApiResult } from "@shared/types/api.types"

// Autenticación real contra barion-api. La cookie de sesión la pone y la borra
// la API; aquí no se guarda ni se lee ningún token — el `withCredentials` del
// ApiClient es lo único que hace falta para que viaje en cada petición.

export const authService = {
  /**
   * Autentica y deja la cookie puesta — salvo cuando hay que elegir barbería,
   * que es el único caso en que vuelve sin sesión.
   *
   * De la respuesta se consume SOLO el discriminante y la lista para elegir. La
   * sesión que la API manda dentro se sigue ignorando: es la foto del instante
   * de entrar, y quién entró lo dice `sesionActual()`, siempre. Dos orígenes
   * para lo mismo terminan siendo dos verdades.
   *
   * `slug` no sale del formulario sino de la ruta de la puerta, y por eso entra
   * como argumento aparte y no por el schema.
   */
  async login(datos: DatosLogin, slug?: string): Promise<ApiResult<ResultadoLogin>> {
    const { correo, contrasena } = esquemaLogin.parse(datos)
    // `correo` es el nombre del formulario; el contrato de la API usa `email`.
    return api.post<ResultadoLogin>("/auth/login", {
      email: correo,
      contrasena,
      ...(slug ? { slug } : {}),
    })
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
