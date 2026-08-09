import {
  esquemaRegistro,
  esquemaRegistroGoogle,
  type DatosRegistro,
  type DatosRegistroGoogle,
} from "@features/registro/schemas/registro.schema"
import type {
  DisponibilidadSlug,
  PaisOperado,
  PreregistroGoogle,
  RegistroVista,
} from "@features/registro/types/registro.types"
import { api } from "@lib/http/instances"
import type { ApiResult } from "@shared/types/api.types"

// Alta abierta: una barbería nace sin que nadie de Barion intervenga. Es
// superficie pública, así que no hay sesión que enviar — y tampoco la abre: al
// terminar se entra por la puerta de la barbería, como todo el mundo.

export const registroService = {
  async registrarBarberia(datos: DatosRegistro): Promise<ApiResult<RegistroVista>> {
    // `parse` antes de enviar: descarta claves ajenas, recorta y normaliza.
    return api.post<RegistroVista>("/publico/registro", esquemaRegistro.parse(datos))
  },

  /**
   * Con quién se va a registrar, leído de la cookie que dejó la vuelta de
   * Google. Un 401 significa que no hay pase —o caducó— y el formulario tiene
   * que volver a ofrecer el botón del proveedor.
   */
  async obtenerPreregistroGoogle(): Promise<ApiResult<PreregistroGoogle>> {
    return api.get<PreregistroGoogle>("/publico/registro/google")
  },

  /**
   * El alta con la identidad ya comprobada. El correo NO viaja aquí: lo pone la
   * api desde la cookie firmada, que es lo único que impide registrar una
   * barbería a nombre de otra persona.
   */
  async registrarConGoogle(datos: DatosRegistroGoogle): Promise<ApiResult<RegistroVista>> {
    return api.post<RegistroVista>("/publico/registro/google", esquemaRegistroGoogle.parse(datos))
  },

  /**
   * Si el identificador público está libre y, si no, cuál sí lo está: la api
   * devuelve la primera variante numerada en la MISMA respuesta. Una petición
   * por nombre — probando las variantes desde aquí se agotaba el cupo por IP.
   */
  async verificarSlug(slug: string): Promise<ApiResult<DisponibilidadSlug>> {
    return api.get<DisponibilidadSlug>(`/publico/registro/disponible/${slug}`)
  },

  /**
   * El enlace del correo. Confirma que la dirección es suya y **abre su
   * escaparate**: hasta aquí el panel funcionaba, pero `/b/{slug}` no se servía.
   *
   * El token va en la ruta y no en el cuerpo porque quien abre esto es un
   * navegador desde una bandeja de entrada, sin sesión y sin formulario.
   */
  async verificarCorreo(token: string): Promise<ApiResult<null>> {
    return api.post<null>(`/publico/registro/verificar/${encodeURIComponent(token)}`)
  },

  /**
   * Dónde opera Barion HOY.
   *
   * **Es la misma lectura que consume el sitio de venta**, y ese es el punto:
   * hasta ahora cada uno declaraba su propia lista de países, así que la landing
   * ofrecía mercados donde esta alta responde 422 — y el rechazo llegaba después
   * de rellenar el formulario entero.
   *
   * Lectura anónima, sin sesión. No devuelve nada del impuesto de Barion: esa es
   * su posición tributaria, no algo que quien se registra necesite saber.
   */
  async obtenerPaisesOperados(): Promise<ApiResult<PaisOperado[]>> {
    return api.get<PaisOperado[]>("/publico/paises")
  },
}
