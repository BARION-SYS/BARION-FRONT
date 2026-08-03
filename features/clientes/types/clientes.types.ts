// Tipos ESPEJO del contrato de la API (`/clientes/**`, `/segmentos/**`),
// mantenidos a mano contra su Swagger — no se comparte código entre repos.
//
// El dinero llega como cadena de centavos; la moneda es la de la barbería, que
// el cliente no tiene propia. Los instantes son UTC ISO-8601 y los formatea
// `useFormato`, nunca un componente.

export type EstadoCliente = "activo" | "bloqueado" | "anonimizado"

/** La etiqueta la resuelve la api: UNA, la de mayor prioridad. */
export interface EtiquetaCliente {
  id: string
  nombre: string
}

export interface Cliente {
  id: string
  nombre: string
  apellido: string | null
  telefonoE164: string
  /**
   * `true` = ese número se probó por SMS. **Hoy nadie nuevo lo consigue**: el
   * código sale por correo, así que solo lo tienen las fichas que se verificaron
   * cuando el canal era el teléfono.
   */
  telefonoVerificado: boolean
  email: string
  /** `true` = esa dirección es suya de verdad, probada por OTP. */
  emailVerificado: boolean
  /**
   * **Cualquiera de los dos canales.** Es el campo por el que se ramifica:
   * `false` no es "a medias" —lo registró la barbería y se le puede agendar—,
   * es que **no reserva solo**.
   */
  verificado: boolean
  /** `YYYY-MM-DD`. Sin hora: un cumpleaños no es un instante. */
  fechaNacimiento: string | null
  barberoFavorito: { id: string; nombrePublico: string } | null
  etiqueta: EtiquetaCliente | null
  puntajeFiabilidad: number
  vecesNoAsistio: number
  bloqueadoHasta: string | null
  totalVisitas: number
  totalGastadoCentavos: string
  ultimaVisitaEn: string | null
  origen: string
  estado: EstadoCliente
  anonimizadoEn: string | null
  notas: string | null
}

/** Una visita. Los importes vienen CONGELADOS de la cita, no del catálogo. */
export interface Visita {
  citaId: string
  iniciaEn: string
  estado: string
  barbero: { id: string; nombrePublico: string } | null
  servicios: { nombre: string; precioCentavos: string }[]
  precioCentavos: string
  propinaCentavos: string | null
  moneda: string
}

export type TipoConsentimiento =
  "marketing_whatsapp" | "marketing_sms" | "marketing_email" | "tratamiento_datos"

export interface ConsentimientoVigente {
  tipo: string
  otorgado: boolean
  desdeEn: string
}

export interface Consentimiento {
  id: string
  tipo: string
  otorgado: boolean
  otorgadoEn: string | null
  revocadoEn: string | null
  origen: string
  versionPolitica: string
  creadoEn: string
}

/**
 * Lo VIGENTE decide si se le puede escribir; el HISTORIAL es la prueba legal.
 * Las dos cosas llegan resueltas: el front no recalcula cuál manda.
 */
export interface Consentimientos {
  vigentes: ConsentimientoVigente[]
  historial: Consentimiento[]
}

export interface Segmento {
  id: string
  nombre: string
  descripcion: string | null
  tipo: "estatico" | "dinamico"
  criterio: Record<string, unknown>
  esEtiqueta: boolean
  prioridad: number
  calculadoEn: string | null
  activo: boolean
  miembros: number
}

export interface FiltrosClientes {
  buscar?: string
  segmentoId?: string
  barberoFavoritoId?: string
  estado?: string
  paginar?: boolean
  page?: number
  limit?: number
}
