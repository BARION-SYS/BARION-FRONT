// Tipos genéricos del cliente HTTP — nunca viven dentro de lib/http.

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

// Contrato de la API: el body SIEMPRE llega como { data, message?, pagination? }.
// El payload viene directo en `data` (nunca data.usuarios ni anidados por recurso).
export interface ApiEnvelope<T> {
  data: T
  message?: string
  pagination?: PaginationInfo | null
}

/**
 * El caso CONCRETO por el que la api rechazó algo. Catálogo cerrado: solo se
 * publica un `motivo` cuando alguna pantalla tiene que ramificar de verdad.
 *
 * Existe para no distinguir fallos comparando una frase en español — un texto de
 * copy convertido en contrato por accidente deja de funcionar en cuanto alguien
 * mejora el mensaje.
 *
 * `token_invalido` es UNO SOLO para «no existe», «ya se usó» y «caducó»: son
 * indistinguibles a propósito, o el endpoint sería un oráculo de qué enlaces
 * ajenos siguen vivos. `preregistro_invalido` sigue el mismo criterio con el
 * pase que deja la vuelta de Google, y lo que ramifica con él es la pantalla del
 * alta: sin el motivo se quedaba reenviando el formulario contra un pase muerto.
 */
export type MotivoError =
  "falta_puntaje" | "requiere_confirmacion" | "token_invalido" | "preregistro_invalido"

/**
 * Contrato de error de la API: `{ error: { message, status, codigo?, motivo? }, meta }`.
 *
 * `codigo` es la FAMILIA del fallo (`regla_negocio`, `token_expirado`…) y
 * `motivo` el caso concreto dentro de ella. Los dos son **opcionales aquí a
 * propósito**: son aditivos y una api anterior a ellos responde igual de válida,
 * así que quien los lea tiene que aguantar su ausencia.
 *
 * El campo `message` suelto queda como respaldo para errores que no pasan por su
 * filtro global (un 502 del proxy, por ejemplo).
 */
export interface ApiErrorEnvelope {
  error?: { message?: string; status?: number; codigo?: string; motivo?: string }
  message?: string
}

// Lo normalizado por ApiClient — lo que recibe el service.
export interface ApiResult<T> {
  data: T
  status: number
  message: string
  pagination?: PaginationInfo | null
}

export interface HttpError {
  status: number
  message: string
  /** Familia del fallo. Ausente mientras la api no lo publique. */
  codigo?: string
  /** El caso concreto, ya validado contra el catálogo. Ausente si no llegó. */
  motivo?: MotivoError
  detail?: unknown
}
