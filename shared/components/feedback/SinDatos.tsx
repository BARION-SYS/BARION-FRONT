import type { LucideIcon } from "lucide-react"

interface SinDatosProps {
  titulo: string
  detalle?: string
  icono?: LucideIcon
  /** Alto mínimo, para que no colapse el hueco de una gráfica. */
  alto?: number
}

/**
 * "Todavía no se sabe" — distinto de "no hubo nada".
 *
 * Existe para las lecturas que dependen del agregado nocturno: pintar ceros ahí
 * se leería como un negocio parado, cuando lo que pasa es que la historia aún no
 * está calculada. Un dato ausente y un dato en cero no se dibujan igual.
 */
export function SinDatos({ titulo, detalle, icono: Icono, alto = 180 }: SinDatosProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 text-center"
      style={{ minHeight: alto }}
    >
      {Icono && <Icono className="h-5 w-5 text-muted-foreground" aria-hidden />}
      <p className="text-sm font-medium text-foreground">{titulo}</p>
      {detalle && <p className="max-w-xs text-xs text-muted-foreground">{detalle}</p>}
    </div>
  )
}
