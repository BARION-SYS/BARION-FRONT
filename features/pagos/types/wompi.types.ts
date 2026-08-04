/**
 * Tipos ESPEJO del contrato de **Wompi**, no del de Barion.
 *
 * Viven aparte de `pagos.types.ts` porque son de otro dueño: los nombres son los
 * suyos (`snake_case`, inglés) y cambian cuando él lo decida. El vocabulario de
 * Wompi muere en `wompi.service.ts`, que traduce a los tipos de la feature — así
 * ningún componente sabe con qué pasarela se está hablando.
 *
 * Documentación: https://docs.wompi.co/en/docs/colombia/tokens-de-aceptacion/
 * y https://docs.wompi.co/en/docs/colombia/metodos-de-pago/
 */

/** Cada aceptación llega presignada: el token y el PDF que hay que poder leer. */
export interface AceptacionWompi {
  acceptance_token: string
  permalink: string
  type: string
}

/**
 * `GET /v1/merchants/{public_key}`.
 *
 * Solo lo que esta pantalla usa: el comercio trae bastantes más campos, y
 * declararlos todos sería fingir un contrato que no se consume.
 */
export interface ComercioWompi {
  /** Términos y condiciones de uso. Posición 0 de `aceptaciones`. */
  presigned_acceptance: AceptacionWompi | null
  /** Autorización de tratamiento de datos personales. Posición 1. */
  presigned_personal_data_auth: AceptacionWompi | null
}

/**
 * `POST /v1/tokens/cards` — el canje del número de tarjeta por un token.
 *
 * Los cuatro dígitos y la marca vuelven aquí, pero no se guardan: quien decide
 * qué se pinta de una tarjeta guardada es la api, con lo que la pasarela le
 * confirmó al crear el medio de pago.
 */
export interface TokenTarjetaWompi {
  /** El token de UN SOLO USO. Lo único que sale de aquí hacia Barion. */
  id: string
  brand: string | null
  last_four: string
  exp_month: string
  exp_year: string
  card_holder: string
}

/** El cuerpo exacto que espera `POST /v1/tokens/cards`. */
export interface CuerpoTokenizacionWompi {
  number: string
  cvc: string
  exp_month: string
  exp_year: string
  card_holder: string
}
