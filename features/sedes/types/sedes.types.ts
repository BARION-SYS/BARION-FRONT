// Tipos ESPEJO del contrato de la API (`/sedes/**`), mantenidos a mano contra su
// Swagger — no se comparte código entre repos.

/** Forma acordada con la API. Todos los campos son opcionales. */
export interface DireccionSede {
  calle?: string
  ciudad?: string
  region?: string
  codigoPostal?: string
  pais?: string
}

export interface Sede {
  id: string
  nombre: string
  /** IANA, de la SEDE. Una cadena en EE. UU. cruza husos. */
  zonaHoraria: string
  /** `null` = hereda la moneda de la barbería. */
  moneda: string | null
  slugQr: string
  telefono: string | null
  direccion: DireccionSede | null
  /** 1 lunes, 0 domingo. Decide con qué día arranca la semana en pantalla. */
  inicioSemana: number
  activa: boolean
}

/**
 * Un tramo del horario comercial: "los martes de 09:00 a 13:00". Las horas son
 * LOCALES de la sede, y por eso el horario llega con su zona.
 */
export interface TramoHorario {
  id: string
  /** 0 domingo … 6 sábado. */
  diaSemana: number
  abre: string
  cierra: string
}

export interface HorarioSemanal {
  sedeId: string
  zonaHoraria: string
  tramos: TramoHorario[]
}

/** Festivo, inventario, remodelación. Ambas fechas quedan incluidas. */
export interface Cierre {
  id: string
  /** `YYYY-MM-DD`. Nunca un instante: en otro huso el festivo se corre de día. */
  fechaDesde: string
  fechaHasta: string
  motivo: string
}

export interface FiltrosSedes {
  soloActivas?: boolean
  buscar?: string
  paginar?: boolean
  page?: number
  limit?: number
}

export interface FiltrosCierres {
  desde?: string
  hasta?: string
  paginar?: boolean
  page?: number
  limit?: number
}
