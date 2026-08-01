import { esquemaRegistro, type DatosRegistro } from "@features/registro/schemas/registro.schema"
import type { DisponibilidadSlug, RegistroVista } from "@features/registro/types/registro.types"
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

  /** Si el identificador público está libre. La api responde solo el booleano. */
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
}
