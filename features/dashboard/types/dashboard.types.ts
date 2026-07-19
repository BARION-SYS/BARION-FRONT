import type { LucideIcon } from "lucide-react"
import type { DireccionTendencia } from "@shared/types/ui.types"

export interface KpiDashboard {
  clave: string
  titulo: string
  valor: string
  cambio?: string
  tendencia?: DireccionTendencia
  subtitulo?: string
  acento?: boolean
  icono: LucideIcon
}

export interface PuntoIngresoDiario {
  dia: string
  ingresos: number
  citas: number
}

export interface PuntoIngresoMensual {
  mes: string
  ingresos: number
  meta: number
}

export interface ResumenBarbero {
  nombre: string
  iniciales: string
  citas: number
  ingresos: number
  calificacion: number
  /** Porcentaje de la meta semanal alcanzado, 0–100 */
  porcentajeMeta: number
  /** Token de gráfica, ej. `var(--chart-1)` */
  color: string
}

export interface ServicioPopular {
  nombre: string
  /** Porcentaje del total, 0–100 */
  porcentaje: number
  color: string
}
