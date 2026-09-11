// Tipos ESPEJO del contrato de la API (`/publico/**` y `/mi/**`), mantenidos a
// mano contra su Swagger — no se comparte código entre repos.
//
// Dos cosas que cambian respecto del mock y afectan a todo el feat:
//
//  · **Los ids son uuid**, no números. `id: 0` como "cualquiera disponible"
//    desaparece: es `barberoId: null`, que es lo que significa.
//  · **El dinero son centavos como cadena** + su moneda. Nunca un número suelto:
//    en COP un entero de 32 bits se desborda.
//
// La cita del cliente es la MISMA que la del panel, así que se importa de `citas`,
// que es su feat dueño. Duplicar el tipo garantizaría que un día divergieran.
import type { Cita, DiaAgenda, EstadoCita } from "@features/citas/types/citas.types"

export type { Cita, DiaAgenda, EstadoCita }

/** Un tramo del horario comercial, en hora local de SU sede. */
export interface TramoHorario {
  /** 0 domingo … 6 sábado. */
  diaSemana: number
  abre: string
  cierra: string
}

/**
 * Una sede del escaparate. `abiertoAhora` lo resuelve la API en la zona de ESTA
 * sede: calcularlo en el navegador acabaría mintiendo en el huso que no es el suyo.
 */
export interface SedePortal {
  id: string
  nombre: string
  zonaHoraria: string
  direccion: Record<string, unknown> | null
  /** La marca del cartón de ESTA sede: `?qr={slugQr}`. Resuelve dónde está el cliente. */
  slugQr: string
  horario: TramoHorario[]
  abiertoAhora: boolean
}

export interface FichaBarberia {
  eslogan: string | null
  descripcion: string | null
  ventajas: string[]
}

export interface MarcaBarberia {
  colorMarca: string | null
  colorFondo: string | null
  logoUrl: string | null
  actualizadaEn: string | null
}

/** Lo que devuelve `GET /publico/barberias/:slug`. */
export interface BarberiaPortal {
  id: string
  slug: string
  nombreComercial: string
  pais: string
  moneda: string
  locale: string
  ficha: FichaBarberia
  marca: MarcaBarberia
  sedes: SedePortal[]
  /**
   * La barbería de demostración de Barion: se ve entera y no toma reservas. Se
   * dice al ENTRAR, no al final: la api rechaza el código con `barberia_demo`,
   * y dejar que alguien elija barbero, servicio y hora para chocar ahí es
   * hacerle perder el tiempo con forma de formulario.
   */
  esDemo: boolean
}

/**
 * Un servicio de la carta. `precioDesdeCentavos` es de REFERENCIA: lo que se
 * cobra es el precio de la oferta del barbero que atienda.
 */
export interface ServicioPortal {
  id: string
  nombre: string
  descripcion: string | null
  categoria: string | null
  imagenUrl: string | null
  precioDesdeCentavos: string | null
  moneda: string
  duracionMin: number
  destacado: boolean
}

/** Lo que ESE barbero cobra por ESE servicio: es lo que se reserva de verdad. */
export interface OfertaPortal {
  id: string
  servicioId: string
  nombre: string
  categoria: string | null
  precioCentavos: string
  moneda: string
  duracionMin: number
}

export interface BarberoPortal {
  id: string
  nombrePublico: string
  slug: string | null
  avatarUrl: string | null
  titulo: string | null
  bio: string | null
  /** Índice del token `--chart-N`, no un hex: la paleta se re-tiñe con la marca. */
  indiceColor: number
  calificacion: number | null
  resenas: number
  sedeId: string | null
  enVacaciones: boolean
  oferta: OfertaPortal[]
}

/** Lo que devuelve `GET /publico/barberias/:slug/disponibilidad`. */
export interface DisponibilidadPortal {
  sedeId: string
  zonaHoraria: string
  duracionMin: number
  /** Limpieza: entra en el hueco y NO se le enseña al cliente. */
  bufferMin: number
  dias: DiaAgenda[]
}

/** Seguimiento por código, sin sesión. Corto a propósito: un enlace se reenvía. */
export interface SeguimientoPortal {
  codigoSeguimiento: string
  estado: EstadoCita
  iniciaEn: string
  terminaEn: string
  barbero: { nombrePublico: string } | null
  cliente: { nombre: string } | null
  servicios: { nombre: string; duracionMin: number }[]
  precioCentavos: string
  moneda: string
  canceladaEn: string | null
}

/** Pasos del flujo público de reserva. El OTP es el paso `codigo`. */
/**
 * El orden importa y es este: **barbero primero**.
 *
 * Con el catálogo delante, el cliente elegía un servicio que su barbero podía no
 * hacer, y el choque aparecía al final —después del código— obligando a rehacer
 * el flujo entero. Eligiendo barbero primero, la carta que se pinta ES su oferta:
 * lo que no ofrece no se puede elegir porque no está, y el precio deja de ser un
 * «desde» para ser el que se va a cobrar.
 */
export type PasoReserva = "barbero" | "servicio" | "agenda" | "datos" | "codigo" | "listo"

/**
 * Un servicio tal como se ofrece EN ESTE flujo, ya resuelto contra quien atiende.
 *
 * Con un barbero elegido, `precioCentavos` es el suyo y `barberos` es 1. Con
 * «cualquiera disponible» se pinta el mínimo de quienes lo hacen y `barberos`
 * dice cuántos son — que es lo que justifica seguir enseñando un «desde».
 */
export interface ServicioOfrecido extends ServicioPortal {
  /** El de la oferta del barbero elegido, o el más bajo de los candidatos. */
  precioCentavos: string | null
  /** Cuántos barberos lo ofrecen. Con uno elegido siempre es 1. */
  barberos: number
  /** La duración real de quien atiende, que puede no ser la del catálogo. */
  duracionRealMin: number
}

export interface CodigoEmitido {
  enviado: boolean
  venceEn: string
  /** Hoy siempre `"email"`: el SMS se paga por mensaje y Barion no lo asume. */
  canal: "telefono" | "email"
}

/**
 * Quién vuelve de Google cuando todavía no tiene ficha en esta barbería.
 *
 * Solo lo que hay que enseñar —«continuarás como X»— y prellenar. El pase real
 * vive en una cookie firmada que este código no puede leer ni reenviar.
 */
export interface PreregistroClientePortal {
  email: string
  nombre: string | null
}

/**
 * Lo que devuelve verificar el código. La sesión vive en la cookie httpOnly: esto
 * es solo lo que la pantalla necesita saber de quién entró.
 */
export interface SesionCliente {
  barberiaId: string
  clienteId: string
  nombre: string
  /**
   * `true` = su ficha es una identidad probada y **puede reservar sola**. Lo es
   * con cualquiera de los dos canales: el correo, que es el de hoy, o el teléfono
   * de quien se verificó cuando el código salía por SMS.
   */
  verificado: boolean
  /** `true` = era su primera vez y quedó registrado. */
  registrado: boolean
}

export interface MovimientoFidelidad {
  id: string
  /** acumulacion | canje | caducidad | ajuste */
  tipo: string
  puntos: number
  motivo: string | null
  venceEn: string | null
  creadoEn: string
}

export interface PremioPortal {
  id: string
  nombre: string
  descripcion: string | null
  costoPuntos: number
  /** servicio_gratis | descuento_monto | descuento_porcentaje | regalo */
  tipo: string
  descuentoCentavos: string | null
  descuentoBps: number | null
  /** `null` = sin límite de existencias. */
  stock: number | null
  /** Si con su saldo ya puede pedirlo. Lo resuelve la API, no el front. */
  alcanzable: boolean
}

export interface CanjePortal {
  id: string
  premioId: string
  premioNombre: string
  puntosGastados: number
  /** pendiente | aplicado | cancelado | vencido */
  estado: string
  /** Lo que enseña en el sillón. */
  codigo: string | null
  venceEn: string | null
  creadoEn: string
}

/** `programa: null` = esa barbería no tiene fidelización. Es lo normal al empezar. */
export interface FidelidadPortal {
  programa: { id: string; nombre: string } | null
  saldoPuntos: number
  puntosHistoricos: number
  movimientos: MovimientoFidelidad[]
  premios: PremioPortal[]
  canjes: CanjePortal[]
}

export interface PromocionPortal {
  id: string
  codigo: string
  nombre: string
  /** porcentaje | monto | servicio_gratis */
  tipo: string
  descuentoBps: number | null
  descuentoCentavos: string | null
  moneda: string | null
  terminaEn: string | null
}

/**
 * Lo que devuelve ejecutar el enlace de un correo
 * (`POST /publico/barberias/:slug/acciones/:token`).
 *
 * **`resultado` es lo único con lo que se elige la pantalla.** El propósito lo
 * decide el TOKEN y lo resuelve la api: aquí no hay nada que pedir ni que elegir,
 * solo lo que pasó.
 */
export type ResultadoAccion = "confirmada" | "cancelada" | "reservada" | "calificada" | "baja"

export interface AccionEnlace {
  /** `confirmar` · `cancelar` · `aceptar_oferta` · `calificar` · `baja`. */
  accion: string
  resultado: ResultadoAccion
  /** `null` en la baja de comunicaciones: no hay cita detrás. */
  citaId: string | null
}

/** Filtros de las citas del cliente. Su id sale del token, nunca de la query. */
export interface FiltrosCitasCliente {
  desde?: string
  hasta?: string
  estado?: EstadoCita
  paginar?: boolean
  page?: number
  limit?: number
}
