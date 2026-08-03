import type { AccionQr } from "@features/qr/types/qr.types"

/**
 * Qué ofrece el portal a quien escanea. Es COPY, no dato: no lo devuelve ninguna
 * ruta ni debería —describe el producto, no el estado de esta barbería—, así que
 * vive aquí y no en un service.
 */
export const CAPACIDADES_QR: readonly string[] = [
  "Registrarse con nombre y teléfono",
  "Elegir su barbero favorito",
  "Ver horarios disponibles en tiempo real",
  "Reservar una cita en segundos",
  "Confirmar su asistencia con 1 clic",
  "Ver promociones activas",
]

/**
 * La api manda `accion` como código y la traducción es del front. Solo hay dos
 * porque solo hay dos huellas: nada registra «consultó horarios» ni «vio
 * promociones».
 */
export const etiquetaAccionQr: Record<AccionQr, string> = {
  reservo_cita: "Reservó cita",
  se_registro: "Se registró",
}

/** Cuántos días mira la pantalla. Un mes es el ciclo con el que se reimprime un cartón. */
export const DIAS_QR = 30

/** Entradas del feed. La api admite 1–50 y no pagina: es actividad reciente. */
export const LIMITE_ACTIVIDAD_QR = 12
