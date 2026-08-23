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

/**
 * Cómo se PINTA cada estado de cita — dominio dueño; otros feats importan de aquí.
 *
 * ── Aquí está la forma; el TEXTO vive en el diccionario ─────────────────────
 * El ícono y el tono no cambian con el idioma; la etiqueta sí. Tenerlos juntos
 * obligaba a que el único sitio donde se decide qué ícono lleva «cancelada»
 * fuera también un sitio con español dentro, y a repetir esa decisión de diseño
 * en cada traducción.
 *
 * Dos pares comparten tono (advertencia: pendiente/retrasada; peligro:
 * cancelada/no_asistio): el ícono y la etiqueta los distinguen igual, y el
 * estado nunca depende SOLO del color.
 */
export const configEstadoCita: Record<EstadoCita, { icono: LucideIcon; tono: TonoEstado }> = {
  reservada: { icono: CalendarClock, tono: "neutro" },
  pendiente_confirmacion: { icono: Hourglass, tono: "advertencia" },
  confirmada: { icono: Circle, tono: "info" },
  retrasada: { icono: AlertTriangle, tono: "advertencia" },
  en_curso: { icono: Clock, tono: "primario" },
  completada: { icono: CheckCircle2, tono: "exito" },
  cancelada: { icono: XCircle, tono: "peligro" },
  no_asistio: { icono: UserX, tono: "peligro" },
}

/**
 * Cómo se LLAMA cada estado en el idioma activo.
 *
 * Recibe el traductor ya acotado a `citas.estados` en vez de llamar al hook: así
 * la usan igual un componente y cualquier función que ya lo tenga a mano, y no
 * obliga a que todo lo que necesite el nombre de un estado sea un componente de
 * React.
 *
 * El tipo del parámetro es estructural —«algo que se llama con un estado y
 * devuelve texto»— y no el `Translator` de la librería: mantiene a este archivo
 * de dominio sin dependencias de infraestructura. `EstadoCita` es una unión
 * cerrada y los ocho existen en el catálogo, así que añadir uno en la api **no
 * compila** hasta tener su texto en los tres idiomas.
 */
export function textoEstadoCita(t: (estado: EstadoCita) => string, estado: EstadoCita): string {
  return t(estado)
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
