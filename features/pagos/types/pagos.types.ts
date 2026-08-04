/**
 * Tipos ESPEJO del contrato de la api
 * (`BARION-API/docs/frontend/api-barion/pagos/medio-pago.md`).
 *
 * Con qué se le cobra a la barbería su suscripción a Barion. Nada que ver con
 * lo que la barbería le cobra a su cliente: eso no pasa por aquí.
 *
 * **El número de tarjeta jamás llega a la api de Barion.** Se tokeniza contra la
 * pasarela desde el navegador y lo único que viaja es un token de un solo uso.
 */

/** Congelado al guardar el medio: un token no es portable entre pasarelas. */
export type ProveedorPago = "wompi" | "stripe" | "simulado"

/** Los retirados no se listan, así que nunca llegan a esta pantalla. */
export type EstadoMedioPago = "activo" | "invalido"

export type TipoMedioPago = "tarjeta" | "debito_automatico" | "otro"

export interface MedioPago {
  id: string
  proveedor: ProveedorPago
  tipo: TipoMedioPago
  estado: EstadoMedioPago
  /** Con cuál se cobra. Como mucho uno, y siempre el último guardado. */
  predeterminado: boolean
  /** Lo imprimible, y solo eso. Cualquiera puede faltar según el proveedor. */
  marca: string | null
  ultimos4: string | null
  expiraMes: number | null
  expiraAnio: number | null
  /** El último rechazo, en las palabras del proveedor. **Se muestra, no se interpreta.** */
  ultimoError: string | null
  /** Instante UTC ISO-8601. */
  creadoEn: string
}

/** Informativo: sirve para avisar en pantalla de que no se está cobrando de verdad. */
export type AmbientePasarela = "sandbox" | "produccion"

/**
 * Con qué pasarela y con qué llave tiene que tokenizar el navegador.
 *
 * Sale del SERVIDOR y no del `.env` de este repo a propósito: quién cobra en
 * cada país lo decide la api. Con la llave publicada aquí, un cambio de
 * proveedor dejaría al navegador tokenizando contra uno y a la api canjeando el
 * token contra otro, y el fallo aparecería al guardar y no al desplegar.
 */
export interface ConfiguracionPasarela {
  proveedor: ProveedorPago
  llavePublica: string
  ambiente: AmbientePasarela
}

/**
 * Una aceptación que el proveedor exige antes de guardar una tarjeta.
 *
 * `token` es una cadena OPACA: la api la transporta y no la interpreta.
 * `enlace` es el documento que hay que poder leer antes de aceptar — sin él la
 * casilla pediría aceptar algo que nadie puede consultar.
 */
export interface AceptacionPasarela {
  token: string
  enlace: string
}

/**
 * Las dos que pide Wompi, con nombre de negocio en vez del suyo.
 *
 * El orden con el que viajan a la api ES el contrato (posición 0 términos,
 * posición 1 datos personales), y por eso se arma en un solo sitio
 * (`aceptacionesEnOrden`) en vez de en cada llamada.
 */
export interface AceptacionesPasarela {
  terminos: AceptacionPasarela
  datosPersonales: AceptacionPasarela
}
