// Tipos ESPEJO del contrato de la API (`/reportes/qr` y `/reportes/qr/actividad`),
// mantenidos a mano contra su documentación — no se comparte código entre repos.
//
// **No hay conteo de escaneos y no lo va a haber.** Abrir la página del cartón no
// deja fila en ninguna parte, y contarla exigía una tabla de una escritura por
// visita y un endpoint público escribible sin sesión — para un número que no
// distingue a un cliente del dueño enseñando el código. Lo que se mide es la
// huella que el QR dejó al CONVERTIR: una cita o una ficha con `origen = 'qr'`.
// Eso responde la única pregunta que hace el dueño: «¿me llegan citas por el
// cartón?».

/** Lo que convirtió el cartón de UNA sede. Es lo que dice qué código funciona. */
export interface SedeQr {
  sede: { id: string; nombre: string }
  slugQr: string
  citasDesdeQr: number
}

export interface ResumenQr {
  /** Citas creadas en el rango con `origen = 'qr'`. */
  citasDesdeQr: number
  /** Fichas de cliente creadas en el rango con `origen = 'qr'`. Sin desglose por
   *  sede: la ficha cuelga de la barbería y no hay local al que atribuirla. */
  clientesDesdeQr: number
  /** TODAS las sedes, incluidas las que convirtieron cero: un cero es información
   *  —ese cartón no está funcionando— y omitirlo lo esconde. */
  porSede: SedeQr[]
}

/** Las dos únicas huellas que existen. Nada más se registra. */
export type AccionQr = "reservo_cita" | "se_registro"

export interface ActividadQr {
  /** El id de la fila de la que sale la entrada — la cita o el cliente. Sirve de
   *  `key`; no identifica un escaneo, porque eso no existe. */
  id: string
  accion: AccionQr
  /** Instante UTC ISO-8601. El «hace X» lo formatea quien lo pinta. */
  ocurridoEn: string
  /** Las iniciales las compone el front: la api no manda presentación. */
  cliente: { id: string; nombre: string; apellido: string | null }
  /** `null` en `se_registro`: la ficha del cliente es de la barbería, no de una sede. */
  sede: { id: string; nombre: string } | null
}

/**
 * El rango va en INSTANTES y el huso lo pone el front: la api no adivina dónde
 * está la sede. Se aplica sobre la fecha de CREACIÓN —cuándo llegó por el QR—, no
 * sobre cuándo empieza la cita. Ninguna de las dos rutas acepta `sedeId`.
 */
export interface RangoQr {
  desde: string
  hasta: string
}

export interface FiltrosActividadQr extends RangoQr {
  /** 1–50, por defecto 20. Sin paginación: es un feed corto, no un listado. */
  limite?: number
}

/** El enlace impreso en el cartón de una sede, ya compuesto. */
export interface EnlaceQr {
  /** `{portal}/b/{barberia.slug}?qr={sede.slugQr}`. */
  url: string
  nombreBarberia: string
  nombreSede: string
  /** La marca de la sede dentro del enlace — es lo único que se puede rotar. */
  slugQr: string
}
