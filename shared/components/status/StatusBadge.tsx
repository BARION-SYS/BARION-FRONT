import type { LucideIcon } from "lucide-react"
import { Badge } from "@shared/components/ui/badge"
import { cn } from "@shared/utils/cn"
import type { TonoEstado } from "@shared/types/ui.types"

const tokenPorTono: Record<TonoEstado, string> = {
  exito: "var(--exito)",
  info: "var(--info)",
  advertencia: "var(--advertencia)",
  peligro: "var(--destructive)",
  primario: "var(--primary)",
  neutro: "var(--muted-foreground)",
}

interface StatusBadgeProps {
  etiqueta: string
  tono: TonoEstado
  icono?: LucideIcon
  /** En pantallas pequeñas oculta el texto (queda para lectores de pantalla) */
  compacta?: boolean
}

// Ícono + texto sobre Badge de shadcn: el estado nunca depende solo del color.
export function StatusBadge({ etiqueta, tono, icono: Icono, compacta }: StatusBadgeProps) {
  // Color dinámico vía variable CSS — el estilo lo hacen las clases, no style directo.
  return (
    <Badge
      variant="secondary"
      className="gap-1 rounded-full bg-[color-mix(in_srgb,var(--tono)_12%,transparent)] text-(--tono)"
      style={{ "--tono": tokenPorTono[tono] } as React.CSSProperties}
    >
      {Icono && <Icono aria-hidden />}
      <span className={cn("text-[10px] font-medium", compacta && "sr-only sm:not-sr-only")}>
        {etiqueta}
      </span>
    </Badge>
  )
}
