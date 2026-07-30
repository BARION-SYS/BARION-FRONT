import type { LucideIcon } from "lucide-react"

/** Indicador del código QR (escaneos, registros, citas). */
export interface EstadisticaQr {
  clave: string
  titulo: string
  valor: string
  icono: LucideIcon
  acento?: boolean
}

/** Actividad de un cliente que escaneó el QR. */
export interface EscaneoQr {
  id: number
  nombre: string
  iniciales: string
  accion: string
  /** Instante UTC ISO-8601. El "hace X" es del cliente (`useFormato().relativo`). */
  escaneadoEn: string
}

/** Enlace público de reservas de la barbería. */
export interface EnlaceReservasQr {
  url: string
  nombreBarberia: string
}
