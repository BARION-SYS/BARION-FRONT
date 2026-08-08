import {
  esquemaCambioContrasena,
  esquemaLogin,
  esquemaNuevaContrasena,
  esquemaSolicitudRecuperacion,
  type DatosCambioContrasena,
  type DatosLogin,
  type DatosNuevaContrasena,
  type DatosSolicitudRecuperacion,
} from "@features/auth/schemas/auth.schema"
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

  /**
   * Poner la propia contraseña. Es también la salida de la pantalla bloqueante:
   * quien entró con la clave que le dictaron la usa aquí como actual, y con eso
   * la API levanta el bloqueo en el acto.
   *
   * La confirmación no viaja: existe para que nadie se equivoque al teclear, y
   * comprobarlo es cosa del formulario, no del servidor.
   */
  async cambiarContrasena(datos: DatosCambioContrasena): Promise<ApiResult<null>> {
    const { contrasenaActual, contrasenaNueva } = esquemaCambioContrasena.parse(datos)
    return api.post<null>("/auth/cambiar-contrasena", { contrasenaActual, contrasenaNueva })
  },

  /**
   * Pedir el enlace para restablecerla. Responde 200 exista o no ese correo, así
   * que la pantalla no puede prometer más que "si tiene cuenta, le llegará".
   */
  async solicitarRecuperacion(datos: DatosSolicitudRecuperacion): Promise<ApiResult<null>> {
    return api.post<null>("/auth/restablecer-contrasena", esquemaSolicitudRecuperacion.parse(datos))
  },

  /** El token sale del enlace del correo, no del formulario. */
  async confirmarRecuperacion(
    token: string,
    datos: DatosNuevaContrasena
  ): Promise<ApiResult<null>> {
    const { contrasenaNueva } = esquemaNuevaContrasena.parse(datos)
    return api.post<null>("/auth/restablecer-contrasena/confirmar", { token, contrasenaNueva })
  },

  /**
   * Suelta un proveedor de la cuenta. La api rechaza con 422 si es la única
   * forma de entrar que queda: quien abrió su barbería con Google nace SIN
   * contraseña, y soltar su único proveedor lo dejaría fuera para siempre.
   */
  async desvincularProveedor(proveedor: string): Promise<ApiResult<null>> {
    return api.delete<null>(`/auth/oauth/${encodeURIComponent(proveedor)}`)
  },
}
