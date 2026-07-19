export type PeriodoNomina = "semana" | "mes" | "anio"

export interface OpcionPeriodoNomina {
  valor: PeriodoNomina
  etiqueta: string
}

export interface ProduccionDia {
  dia: string
  produccion: number
}

export interface NominaBarbero {
  id: number
  nombre: string
  iniciales: string
  /** Token de gráfica, ej. `var(--chart-1)` */
  color: string
  citas: number
  /** Porcentaje de comisión sobre producción, 0–100 */
  porcentajeComision: number
  produccion: number
  comision: number
  propinas: number
  /** Comisión + propinas */
  total: number
  produccionDiaria: ProduccionDia[]
}

export interface TotalesNomina {
  produccion: number
  comisiones: number
  propinas: number
  totalAPagar: number
}
