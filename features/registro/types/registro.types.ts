/**
 * Lo que devuelve el registro abierto (`/publico/registro` de la api).
 *
 * Contrato publicado por la api en
 * `BARION-API/docs/frontend/api-barion/registro/registro.md`.
 */

export interface RegistroVista {
  slug: string
  nombreComercial: string
  /**
   * A dónde se mandó el enlace de verificación, para poder decirlo en pantalla.
   *
   * `null` cuando no se mandó ninguno: con Google el correo ya venía comprobado
   * por el proveedor, así que no hay nada que verificar y el escaparate se
   * publica de una vez. Es la diferencia visible entre las dos altas.
   */
  correoVerificacion: string | null
}

/**
 * Quién vuelve del proveedor, para prellenar el formulario y poder decir con
 * qué cuenta se va a registrar.
 *
 * No trae el identificador estable del proveedor a propósito: es la clave real
 * de la identidad y el navegador no la necesita ni la reenvía — el alta la lee
 * de la cookie firmada, que este código no puede tocar.
 */
export interface PreregistroGoogle {
  email: string
  nombre: string | null
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
