import type { LucideIcon } from "lucide-react"
import type { DireccionTendencia } from "@shared/types/ui.types"

export interface KpiEstadistica {
  clave: string
  titulo: string
  valor: string
  cambio?: string
  tendencia?: DireccionTendencia
  subtitulo?: string
  acento?: boolean
  icono: LucideIcon
}

export interface PuntoEvolucionMensual {
  mes: string
  ingresos: number
  clientes: number
}

export interface PuntoCitasMensual {
  mes: string
  completadas: number
  canceladas: number
}

export interface ServicioTop {
  nombre: string
  /** Porcentaje del total, 0–100 */
  porcentaje: number
  /** Token de gráfica, ej. `var(--chart-1)` */
  color: string
}
