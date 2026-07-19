import { CheckCircle2, Circle, Clock, XCircle, type LucideIcon } from "lucide-react"
import type { TonoEstado } from "@shared/types/ui.types"
import type { EstadoCita } from "@features/citas/types/citas.types"

// Config de presentación de estados de cita — dominio dueño; otros feats importan de aquí.
export const configEstadoCita: Record<
  EstadoCita,
  { etiqueta: string; icono: LucideIcon; tono: TonoEstado }
> = {
  completada: { etiqueta: "Completada", icono: CheckCircle2, tono: "exito" },
  "en-curso": { etiqueta: "En curso", icono: Clock, tono: "primario" },
  confirmada: { etiqueta: "Confirmada", icono: Circle, tono: "info" },
  pendiente: { etiqueta: "Pendiente", icono: Clock, tono: "advertencia" },
  cancelada: { etiqueta: "Cancelada", icono: XCircle, tono: "peligro" },
}
