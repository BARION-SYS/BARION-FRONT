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

/** Estados por los que pasa un cobro, y por tanto un enlace de pago. */
export type EstadoCobro =
  "pendiente" | "procesando" | "aprobado" | "rechazado" | "error" | "anulado"

/**
 * Un enlace de pago que la barbería generó para mandárselo a quien vaya a pagar.
 *
 * `url` es de Barion, no de la pasarela: quien la abre acaba en el checkout, pero
 * lo que viaja por WhatsApp es esta. Si mañana se cambia de proveedor, el enlace
 * que alguien guardó en un chat sigue funcionando.
 */
export interface EnlacePago {
  id: string
  url: string
  /** Lo que hay que buscar al conciliar: es lo que vuelve en el aviso de la pasarela. */
  referencia: string
  /** Unidad menor como cadena: la api nunca manda dinero en número. */
  montoCentavos: string
  moneda: string
  estado: EstadoCobro
  /**
   * Ya no sirve, aunque siga `pendiente`. **Lo decide la api**: comparar
   * `venceEn` con el reloj del navegador sería fiar a la máquina del cliente algo
   * que determina si se puede cobrar.
   */
  vencido: boolean
  venceEn: string | null
  creadoEn: string
  /** Correo de quien lo generó, o `null` si esa persona ya no está. */
  creadoPor: string | null
}
