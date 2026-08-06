/**
 * Tipos ESPEJO del contrato de la api
 * (`BARION-API/docs/frontend/api-barion/suscripciones/suscripcion.md`).
 *
 * Es la cuenta de la barbería **con Barion**, no lo que la barbería le cobra a
 * su cliente: eso no pasa por aquí.
 */

/** `prueba` mientras no se elige plan; `mora` y `sobre_limite` llegan solos. */
export type EstadoSuscripcion = "prueba" | "activa" | "mora" | "cancelada" | "sobre_limite"

export type PeriodoCobro = "mensual" | "anual"

export interface PrecioPlan {
  codigoPais: string
  /** Unidad menor como cadena: la api nunca manda dinero en número. */
  montoCentavos: string
  moneda: string
  periodo: PeriodoCobro
}

/** Un plan del catálogo público. Lo que se compara antes de elegir. */
export interface PlanPublicado {
  codigo: string
  nombre: string
  /** Claves ACTIVAS. Una función apagada no viaja: si no está, no se incluye. */
  funciones: string[]
  /** Topes: `{ sedes: 1, barberos: 5 }`. Una clave ausente = sin tope. */
  limites: Record<string, number>
  precios: PrecioPlan[]
}

/** El plan al que la barbería ya está suscrita. Sin precio, y a propósito. */
export interface PlanContratado {
  codigo: string
  nombre: string
  funciones: string[]
  limites: Record<string, number>
  /**
   * Siempre `null`: lo que se paga es lo que se pactó al contratar, y la tarifa
   * de hoy puede ser otra. Para precios, el catálogo público.
   */
  precio: PrecioPlan | null
}

export interface UsoContraTope {
  usado: number
  /** `null` = ese plan no pone tope. */
  limite: number | null
  excedido: boolean
}

export interface Suscripcion {
  estado: EstadoSuscripcion
  /** Cada cuánto se cobra lo contratado. La api lo manda; faltaba aquí. */
  periodo: PeriodoCobro
  plan: PlanContratado
  /** Instantes UTC ISO-8601. `null` cuando ese dato no aplica al estado. */
  pruebaTerminaEn: string | null
  periodoActualDesde: string | null
  periodoActualHasta: string | null
  /** Hasta cuándo se usa sin pagar nada más. También la fecha de una baja. */
  vigenteHasta: string | null
  /** Días completos hasta esa fecha. Nunca negativo. */
  diasRestantes: number | null
  graciaHasta: string | null
  suspendidaEn: string | null
  /** La baja está pedida pero NO ejecutada: se puede deshacer. */
  cancelaAlFinPeriodo: boolean
  canceladaEn: string | null
  uso: {
    sedes: UsoContraTope
    barberos: UsoContraTope
  }
}

export type TipoPersonaFiscal = "natural" | "juridica"

export type TipoDocumentoFiscal = "nit" | "cc" | "ce" | "pasaporte" | "nif" | "cif" | "ein"

export interface DireccionFiscal {
  calle: string
  ciudad: string
  region?: string
  codigoPostal?: string
  /** ISO 3166-1 alfa-2. */
  pais: string
}

/** A quién le emite Barion las facturas de la suscripción. */
export interface DatosFiscales {
  tipoPersona: TipoPersonaFiscal
  tipoDocumento: TipoDocumentoFiscal
  numeroDocumento: string
  razonSocial: string
  responsabilidades: string[]
  /** `null` si no se pidió: solo es obligatoria para una empresa. */
  direccionFiscal: DireccionFiscal | null
  codigoMunicipio: string | null
  emailFacturacion: string | null
  telefono: string | null
  /** `null` = capturados y sin comprobar por nadie. */
  verificadoEn: string | null
}

/**
 * El país viaja **siempre**, aunque no haya datos: es quien decide qué campos
 * pide el formulario, y deducirlo del documento guardado no sirve justo cuando
 * todavía no hay ninguno.
 */
export interface DatosFiscalesDeLaBarberia {
  codigoPais: string
  /** `null` mientras nadie los haya capturado. No es un error: es lo normal en prueba. */
  datosFiscales: DatosFiscales | null
}

export type EstadoFactura = "borrador" | "abierta" | "pagada" | "anulada" | "incobrable"

export interface Factura {
  id: string
  numero: string
  estado: EstadoFactura
  subtotalCentavos: string
  impuestoCentavos: string
  totalCentavos: string
  moneda: string
  emitidaEn: string
  venceEn: string | null
  pagadaEn: string | null
  /** `null` mientras la pasarela no publique el documento. */
  pdfUrl: string | null
}

/**
 * Una línea del desglose, tal como la guardó quien emitió la factura.
 *
 * `cantidad` es opcional porque el documento manda: una factura vieja o emitida
 * por otra vía puede no traerla, y suponer un `1` sería inventarse el desglose.
 */
export interface LineaFactura {
  concepto: string
  cantidad?: number
  montoCentavos: string
}

/**
 * Lo que devuelve `GET /facturas/:id`. `lineas` viaja como `unknown` a
 * propósito: la api las entrega **tal cual se guardaron**, sin filtrarlas ni
 * sumarlas, así que aquí se leen con guarda (`lineasDeFactura`) en vez de
 * afirmar una forma que el documento no garantiza.
 */
export interface FacturaDetalle extends Factura {
  lineas?: unknown
}

export interface FiltrosFacturas {
  page?: number
  limit?: number
  paginar?: boolean
  estado?: EstadoFactura
}
