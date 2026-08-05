/**
 * Lo que devuelve el registro abierto (`/publico/registro` de la api).
 *
 * Contrato publicado por la api en
 * `BARION-API/docs/frontend/api-barion/registro/registro.md`.
 */

export interface RegistroVista {
  slug: string
  nombreComercial: string
  /** A dónde se mandó el enlace de verificación, para poder decirlo en pantalla. */
  correoVerificacion: string
}

export interface DisponibilidadSlug {
  /** Si el identificador preguntado está libre. Nunca dice de quién es el ocupado. */
  disponible: boolean
  /**
   * El primero libre entre el preguntado y sus variantes numeradas (`-2`, `-3`…),
   * o `null` si ninguno lo está. Lo busca la API de una vez: pedir las variantes
   * una por una gastaba cinco peticiones del cupo por IP en cada nombre tecleado.
   */
  sugerencia: string | null
}
