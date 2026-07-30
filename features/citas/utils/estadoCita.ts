import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Circle,
  Clock,
  Hourglass,
  UserX,
  XCircle,
  type LucideIcon,
} from "lucide-react"
import type { TonoEstado } from "@shared/types/ui.types"
import type { EstadoCita } from "@features/citas/types/citas.types"

// Config de presentación de estados de cita — dominio dueño; otros feats importan de aquí.
//
// Dos pares comparten tono (advertencia: pendiente/retrasada; peligro: cancelada/no_asistio):
// el ícono y la etiqueta los distinguen igual, y el estado nunca depende SOLO del color.
export const configEstadoCita: Record<
  EstadoCita,
  { etiqueta: string; icono: LucideIcon; tono: TonoEstado }
> = {
  reservada: { etiqueta: "Reservada", icono: CalendarClock, tono: "neutro" },
  pendiente_confirmacion: {
    etiqueta: "Pendiente de confirmación",
    icono: Hourglass,
    tono: "advertencia",
  },
  confirmada: { etiqueta: "Confirmada", icono: Circle, tono: "info" },
  retrasada: { etiqueta: "Retrasada", icono: AlertTriangle, tono: "advertencia" },
  en_curso: { etiqueta: "En curso", icono: Clock, tono: "primario" },
  completada: { etiqueta: "Completada", icono: CheckCircle2, tono: "exito" },
  cancelada: { etiqueta: "Cancelada", icono: XCircle, tono: "peligro" },
  no_asistio: { etiqueta: "No asistió", icono: UserX, tono: "peligro" },
}

/** Ya pasó o está pasando: nadie cancela una cita completada, cancelada, no
 * asistida o en curso. El resto (reservada, pendiente, confirmada, retrasada)
 * sí admite cancelación mientras la fecha siga en el futuro. */
export const ESTADOS_NO_CANCELABLES: readonly EstadoCita[] = [
  "completada",
  "cancelada",
  "no_asistio",
  "en_curso",
]
