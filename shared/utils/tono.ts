import type { TonoEstado } from "@shared/types/ui.types"

/**
 * El token de color de cada tono de estado. Una sola tabla: la píldora, la
 * barra de salud y cualquier marca que hable de un estado tienen que pintar
 * «advertencia» exactamente igual.
 */
export const colorDeTono: Record<TonoEstado, string> = {
  exito: "var(--exito)",
  info: "var(--info)",
  advertencia: "var(--advertencia)",
  peligro: "var(--destructive)",
  primario: "var(--primary)",
  neutro: "var(--muted-foreground)",
}
