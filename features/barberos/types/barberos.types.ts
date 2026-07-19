export type EstadoBarbero = "activo" | "vacaciones"

export interface EstadisticasBarbero {
  citas: number
  ingresos: number
  comision: number
  /** Porcentaje de comisión sobre ingresos, 0–100 */
  porcentajeComision: number
  /** Horas de jornada por día */
  horasPorDia: number
}

export interface Barbero {
  id: number
  nombre: string
  rol: string
  iniciales: string
  /** Token de gráfica, ej. `var(--chart-1)` */
  color: string
  calificacion: number
  resenas: number
  estado: EstadoBarbero
  /** Resumen legible del horario, ej. "Lun – Sáb · 09:00 – 19:00" */
  horario: string
  /** Días laborales de lunes a domingo (7 valores) */
  diasLaborales: boolean[]
  servicios: string[]
  estadisticas: EstadisticasBarbero
  /** Citas por día de la última semana (sparkline) */
  citasSemana: number[]
  telefono: string
  correo: string
}
