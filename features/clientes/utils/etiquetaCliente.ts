import type { TonoEstado } from "@shared/types/ui.types"
import type { EtiquetaCliente } from "@features/clientes/types/clientes.types"

// Config de presentación por etiqueta — siempre tokens, nunca paleta directa.
export const configEtiquetaCliente: Record<EtiquetaCliente, { tono: TonoEstado; color: string }> = {
  VIP: { tono: "primario", color: "var(--chart-1)" },
  Frecuente: { tono: "info", color: "var(--chart-3)" },
  Regular: { tono: "exito", color: "var(--chart-2)" },
  Nuevo: { tono: "advertencia", color: "var(--chart-4)" },
}
