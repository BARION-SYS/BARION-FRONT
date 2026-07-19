export type EstadoCita = "completada" | "en-curso" | "confirmada" | "pendiente" | "cancelada"

export interface CitaHoy {
  id: number
  cliente: string
  iniciales: string
  barbero: string
  servicio: string
  hora: string
  duracionMin: number
  estado: EstadoCita
}

export type VistaCalendario = "semana" | "dia" | "lista"

export interface CitaCalendario {
  id: number
  cliente: string
  servicio: string
  barbero: string
  /** Índice del día dentro de la semana, 0 = lunes */
  dia: number
  /** Índice de la franja horaria dentro de la grilla */
  horaInicio: number
  /** Duración en franjas de una hora */
  duracion: number
  estado: EstadoCita
  /** Token de gráfica, ej. `var(--chart-3)` */
  color: string
}

export interface DiaCalendario {
  etiqueta: string
  fecha: number
  esHoy: boolean
}

export interface SemanaCalendario {
  /** Rango legible de la semana, ej. "14 — 20 Julio 2026" */
  rotulo: string
  mes: string
  dias: DiaCalendario[]
  horas: string[]
}
