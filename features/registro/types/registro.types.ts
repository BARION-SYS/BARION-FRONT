/**
 * Lo que devuelve el registro abierto (`/publico/registro` de la api).
 *
 * Contrato leído del código de `BARION-API` (`registro.types.ts` y sus DTO):
 * ese módulo todavía NO publica su ficha en `docs/frontend/api-barion/`.
 */

export interface RegistroVista {
  slug: string
  nombreComercial: string
  /** A dónde se mandó el enlace de verificación, para poder decirlo en pantalla. */
  correoVerificacion: string
}

export interface DisponibilidadSlug {
  /** Booleano y nada más: decir de quién es convertiría esto en un directorio. */
  disponible: boolean
}
