/** Espejo del contrato de `docs/frontend/api-barion/ganancias/ganancias.md`. */

export type PeriodoNomina = "semana" | "mes" | "anio"

export interface OpcionPeriodoNomina {
  valor: PeriodoNomina
  etiqueta: string
}

export type TipoGanancia = "servicio" | "extra" | "propina" | "ajuste"

/** Una fila de la nómina: un barbero, un rango, una moneda. */
export interface ResumenNomina {
  barberoId: string
  moneda: string
  /** Lo que se le cobró al CLIENTE por sus servicios. */
  produccionCentavos: string
  /** Lo que de esa producción le queda a él. */
  comisionCentavos: string
  /** Íntegras: no salen de la producción. */
  propinasCentavos: string
  /** Correcciones posteriores. Puede ser negativo. */
  ajustesCentavos: string
  /** `comision + propinas + ajustes` — lo que se le paga. */
  totalCentavos: string
  citas: number
  /** `null` si la ficha se retiró. */
  barbero: { id: string; nombrePublico: string; indiceColor: number } | null
}

/** Un asiento del ledger: el detalle que sostiene cada cifra del resumen. */
export interface Ganancia {
  id: string
  barberoId: string
  /** `null` en propinas, extras y ajustes. */
  citaId: string | null
  tipo: TipoGanancia
  brutoCentavos: string
  montoCentavos: string
  /** Basis points: 5000 = 50 %. `null` = se queda todo, o la cita mezcló tarifas. */
  comisionBpsCongelada: number | null
  moneda: string
  /** Qué se hizo, tal como se llamaba entonces. */
  descripcionCongelada: string | null
  /** Instante UTC en que el corte quedó terminado. */
  ganadoEn: string
}

export interface FiltrosGanancias {
  /** Instante UTC ISO-8601, inclusive. */
  desde?: string
  /** Instante UTC ISO-8601, EXCLUSIVO. */
  hasta?: string
  /** Se ignora con `ganancias.ver_propias`: el alcance lo impone la api. */
  barberoId?: string
  tipo?: TipoGanancia
  paginar?: boolean
  page?: number
  limit?: number
}

export interface TotalesNomina {
  produccionCentavos: string
  comisionesCentavos: string
  propinasCentavos: string
  totalCentavos: string
}
