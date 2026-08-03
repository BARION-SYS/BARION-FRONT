import type { ResultadoAccion } from "@features/portal/types/portal.types"

interface CopiaResultado {
  /** Acompaña al `message` de la api, que es el titular y no se reescribe aquí. */
  detalle: string
  /** Verde solo cuando algo quedó en pie; lo demás es neutro, no un fallo. */
  tono: "exito" | "neutro"
}

/**
 * Qué se le cuenta a quien acaba de usar el enlace de un correo, por `resultado`.
 *
 * El **titular sale de la api** (`message`): es ella quien sabe qué hizo el token.
 * Esto es solo la frase de apoyo y el tono del icono — nada que la pantalla pueda
 * deducir por su cuenta, porque el propósito del enlace nunca lo elige el front.
 */
export const copiaPorResultado: Record<ResultadoAccion, CopiaResultado> = {
  confirmada: {
    detalle: "Te esperamos. Si algo cambia, puedes cancelar desde «Mis citas».",
    tono: "exito",
  },
  cancelada: {
    detalle: "Gracias por avisar: el cupo queda libre para otro cliente.",
    tono: "neutro",
  },
  reservada: {
    detalle: "El cupo que se liberó es tuyo y ya está en tu agenda.",
    tono: "exito",
  },
  calificada: {
    detalle:
      "Tu comentario se publica solo si la barbería lo aprueba; la calificación cuenta igual.",
    tono: "exito",
  },
  baja: {
    detalle:
      "No volverás a recibir comunicaciones comerciales. Los avisos de tus citas siguen llegando.",
    tono: "neutro",
  },
}
