import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react"
import { Card } from "@shared/components/ui/card"
import { cn } from "@shared/utils/cn"
import type { DireccionTendencia } from "@shared/types/ui.types"

interface StatCardProps {
  titulo: string
  valor: string
  cambio?: string
  tendencia?: DireccionTendencia
  icono: LucideIcon
  acento?: boolean
  subtitulo?: string
}

export function StatCard({
  titulo,
  valor,
  cambio,
  tendencia = "sube",
  icono: Icono,
  acento,
  subtitulo,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "relative gap-3 overflow-hidden p-5 transition-colors hover:border-border/80",
        acento && "border-primary/30 bg-primary/10"
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
          {titulo}
        </p>
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            acento ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
          )}
        >
          <Icono className="h-4 w-4" aria-hidden />
        </div>
      </div>

      <div>
        <p
          className={cn(
            "text-2xl font-bold tracking-tight tabular-nums",
            acento ? "text-primary" : "text-foreground"
          )}
        >
          {valor}
        </p>
        {subtitulo && <p className="mt-0.5 text-xs text-muted-foreground">{subtitulo}</p>}
      </div>

      {cambio && (
        <div
          className={cn(
            "flex items-center gap-1 text-[11px] font-medium",
            tendencia === "sube"
              ? "text-(--exito)"
              : tendencia === "baja"
                ? "text-destructive"
                : "text-muted-foreground"
          )}
        >
          {tendencia === "sube" && <TrendingUp className="h-3 w-3" aria-hidden />}
          {tendencia === "baja" && <TrendingDown className="h-3 w-3" aria-hidden />}
          <span>{cambio}</span>
        </div>
      )}

      {acento && (
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <div className="absolute right-0 bottom-0 h-20 w-20 rounded-full bg-primary/5 blur-2xl" />
        </div>
      )}
    </Card>
  )
}
