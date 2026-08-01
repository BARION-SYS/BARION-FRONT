/**
 * Espejo del contrato de `docs/frontend/api-barion/reportes/`.
 *
 * **`dashboard` es el feat dueño del dominio de reportes**: `estadisticas`
 * importa estos tipos y su service en vez de duplicarlos. Son los mismos
 * endpoints con otra ventana de tiempo.
 */

export interface ConteoCitas {
  total: number
  reservadas: number
  pendientesConfirmacion: number
  confirmadas: number
  retrasadas: number
  enCurso: number
  completadas: number
  canceladas: number
  noAsistio: number
}

export interface ServicioTop {
  /** `null` si el servicio ya no existe: se agrupó por su nombre congelado. */
  servicioId: string | null
  nombre: string
  veces: number
  ingresosCentavos: string
  moneda: string
}

/** El pulso del rango. Transaccional: siempre está al día. */
export interface ReporteDashboard {
  citas: ConteoCitas
  /** Solo de lo COMPLETADO: una cita reservada no es dinero. */
  ingresosCentavos: string
  propinasCentavos: string
  moneda: string
  /** Fichas creadas en el rango, no primeras visitas. */
  clientesNuevos: number
  ticketPromedioCentavos: string
  serviciosTop: ServicioTop[]
}

export interface PuntoSerie {
  /** El día, el LUNES de la semana o el DÍA 1 del mes. */
  periodo: string
  reservadas: number
  completadas: number
  canceladas: number
  noAsistio: number
  ingresosCentavos: string
  propinasCentavos: string
  moneda: string
  minutosOfrecidos: number
  minutosOcupados: number
  /** Huecos que la lista de espera volvió a llenar. */
  cuposRecuperados: number
}

export interface Serie {
  granularidad: Granularidad
  puntos: PuntoSerie[]
  /**
   * `false` mientras el job nocturno del worker no exista. **No es un error**:
   * es que aún no hay historia calculada, y la pantalla tiene que decirlo en vez
   * de pintar ceros — un cero se lee como "no hubo trabajo".
   */
  disponible: boolean
}

export interface RendimientoBarbero {
  barberoId: string
  completadas: number
  canceladas: number
  noAsistio: number
  brutoCentavos: string
  gananciaCentavos: string
  propinasCentavos: string
  moneda: string
  minutosOcupados: number
  /** 0–5 con un decimal. `null` si nadie calificó. */
  promedioPuntaje: number | null
  barbero: { id: string; nombrePublico: string; indiceColor: number } | null
}

export interface Meta {
  id: string
  /** Uno de los dos siempre es `null`. */
  sedeId: string | null
  barberoId: string | null
  periodoDesde: string
  periodoHasta: string
  montoCentavos: string
  moneda: string
  creadoEn: string
  actualizadoEn: string
}

export type Granularidad = "dia" | "semana" | "mes"

/** Lo transaccional se pide en INSTANTES. `hasta` es exclusivo. */
export interface RangoInstantes {
  desde: string
  hasta: string
  sedeId?: string
}

/** Lo agregado se pide en DÍAS `YYYY-MM-DD`, los dos inclusive. */
export interface RangoDias {
  desde: string
  hasta: string
  sedeId?: string
  granularidad?: Granularidad
}

export interface FiltrosMetas {
  sedeId?: string
  barberoId?: string
  /** Solo las que cubren ese día. */
  vigentesEn?: string
}
