// Tipos ESPEJO del contrato de la API (`/barberos/**`), mantenidos a mano
// contra su Swagger — no se comparte código entre repos.

/** Un servicio que este barbero ofrece, con el precio y la duración que él cobra. */
export interface OfertaServicio {
  id: string
  servicioId: string
  nombre: string
  /** Centavos como string: en COP un entero de 32 bits se desborda. */
  precioCentavos: string
  duracionMin: number
}

/**
 * Quien ATIENDE. No es lo mismo que quien entra al sistema: el administrador que
 * no corta no tiene ficha, y quien atendía y perdió el acceso sigue teniéndola
 * —con su historial— y se reconoce por `tieneAcceso: false`.
 *
 * Esa ficha sin cuenta ya no se CREA: quien atiende, entra. Es lo que queda al
 * decir «esta persona ya no trabaja aquí», y por eso el campo sigue existiendo.
 */
export interface Barbero {
  id: string
  /**
   * Su fila en `equipo`, o `null` si no entra al sistema.
   *
   * Es lo que empareja las dos mitades de una misma persona: la lista de
   * Personas cruza `/equipo` con `/barberos` por aquí. El contacto no serviría —
   * la ficha de quien tiene cuenta deja `email` y `telefonoE164` vacíos.
   */
  membresiaId: string | null
  /** El que ve el cliente al reservar, no el legal. */
  nombrePublico: string
  slug: string | null
  avatarUrl: string | null
  /** Título de vitrina ("Barbero Senior"). NO es el rol de autorización. */
  titulo: string | null
  bio: string | null
  telefonoE164: string | null
  email: string | null
  activo: boolean
  /** `false` = no entra a la aplicación. Sigue en la agenda y sigue liquidando. */
  tieneAcceso: boolean
  sedeId: string | null
  fechaContratacion: string | null
  fechaRetiro: string | null
  /** Puntos base: 5000 = 50 %. `null` = se lleva el 100 %. */
  comisionBps: number | null
  /** Índice del token de color, no un hex: la paleta se re-tiñe con la marca. */
  indiceColor: number
  orden: number
  /** `null` mientras no tenga ninguna calificación. */
  calificacion: number | null
  resenas: number
  /** Derivado de una ausencia vigente ahora. Un activo de vacaciones es normal. */
  enVacaciones: boolean
  oferta: OfertaServicio[]
}

export interface TramoJornada {
  id: string
  /** 0 domingo … 6 sábado. */
  diaSemana: number
  /** Hora local de la sede. */
  inicio: string
  fin: string
}

export interface JornadaSemanal {
  barberoId: string
  tramos: TramoJornada[]
}

/** Un día que se sale de la jornada: cerrado, u otro horario que la reemplaza. */
export interface ExcepcionJornada {
  id: string
  /** `YYYY-MM-DD` en local de la sede. */
  fecha: string
  cerrado: boolean
  inicio: string | null
  fin: string | null
  motivo: string | null
}

export type TipoAusencia = "vacaciones" | "incapacidad" | "permiso" | "bloqueo"

/**
 * Vacaciones, incapacidad, permiso o un rato suelto. A diferencia de la jornada,
 * esto SÍ son instantes: ocurre una vez, en un momento concreto.
 */
export interface Ausencia {
  id: string
  /** Instantes UTC ISO-8601. El formateo a la hora de la sede es del cliente. */
  iniciaEn: string
  terminaEn: string
  tipo: TipoAusencia
  motivo: string | null
  aprobadaEn: string | null
}

/** El alta de una ausencia informa de cuántas citas quedaron dentro del rango. */
export interface AusenciaCreada extends Ausencia {
  citasPisadas: number
}

/** Una cita que sigue en pie después de retirar a su barbero. */
export interface CitaComprometida {
  id: string
  /** Instantes UTC ISO-8601: el formateo a la hora de la sede es del cliente. */
  iniciaEn: string
  terminaEn: string
  estado: string
  cliente: { id: string; nombre: string; telefonoE164: string | null }
}

/**
 * Lo que responde retirar a alguien de la agenda.
 *
 * Sus citas futuras **no se cancelan en cascada**: son clientes ya citados a los
 * que hay que avisar uno por uno. Por eso la respuesta las enumera — sin la
 * lista, la decisión de qué hacer con ellos se tomaría a ciegas.
 */
export interface RetiroBarbero extends Barbero {
  /** Total de citas futuras que siguen a su nombre. */
  citasComprometidas: number
  /** Las 50 primeras por hora de inicio. Con el total mayor, hay más. */
  citasPendientes: CitaComprometida[]
}

export interface FiltrosBarberos {
  soloActivos?: boolean
  sedeId?: string
  buscar?: string
  paginar?: boolean
  page?: number
  limit?: number
}

export interface FiltrosAusencias {
  desde?: string
  hasta?: string
  tipo?: TipoAusencia
  paginar?: boolean
}
