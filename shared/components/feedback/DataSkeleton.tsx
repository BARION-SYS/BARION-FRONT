import { Skeleton } from "@shared/components/ui/skeleton"
import { Card } from "@shared/components/ui/card"
import { cn } from "@shared/utils/cn"

export type DataSkeletonVariant = "text" | "list" | "card" | "table" | "form" | "stats" | "chart"

interface DataSkeletonProps {
  variant?: DataSkeletonVariant
  /** Filas/ítems a pintar (list, table, text, form) o tarjetas (stats, card) */
  count?: number
  className?: string
}

// Skeleton genérico de carga — ÚNICA forma de loading de datos en la app.
// Variante según lo que va a aparecer: lista, tabla, tarjetas, stats, gráfica, form o texto.
export function DataSkeleton({ variant = "text", count, className }: DataSkeletonProps) {
  switch (variant) {
    case "list": {
      const filas = count ?? 5
      return (
        <div className={cn("space-y-2", className)} aria-hidden>
          {Array.from({ length: filas }, (_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
            >
              <Skeleton className="size-8 shrink-0 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-2/5" />
                <Skeleton className="h-2.5 w-3/5" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      )
    }
    case "card": {
      const tarjetas = count ?? 1
      return (
        <div className={cn(tarjetas > 1 && "grid gap-4 sm:grid-cols-2", className)} aria-hidden>
          {Array.from({ length: tarjetas }, (_, i) => (
            <Card key={i} className="gap-3 p-5">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-24 w-full" />
            </Card>
          ))}
        </div>
      )
    }
    case "table": {
      const filas = count ?? 6
      return (
        <div
          className={cn("overflow-hidden rounded-xl border border-border", className)}
          aria-hidden
        >
          <div className="flex gap-4 bg-secondary/50 p-3">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-3 flex-1" />
            ))}
          </div>
          {Array.from({ length: filas }, (_, i) => (
            <div key={i} className="flex gap-4 border-t border-border p-3">
              {Array.from({ length: 4 }, (_, j) => (
                <Skeleton key={j} className="h-3 flex-1" />
              ))}
            </div>
          ))}
        </div>
      )
    }
    case "form": {
      const campos = count ?? 4
      return (
        <div className={cn("space-y-4", className)} aria-hidden>
          {Array.from({ length: campos }, (_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
          ))}
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      )
    }
    case "stats": {
      const tarjetas = count ?? 4
      return (
        <div className={cn("grid grid-cols-2 gap-3 lg:grid-cols-4", className)} aria-hidden>
          {Array.from({ length: tarjetas }, (_, i) => (
            <Card key={i} className="gap-3 p-5">
              <div className="flex items-start justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="size-8 rounded-lg" />
              </div>
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-2.5 w-16" />
            </Card>
          ))}
        </div>
      )
    }
    case "chart":
      return (
        <Card className={cn("gap-4 p-5", className)} aria-hidden>
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
          <div className="flex h-40 items-end gap-2">
            {[60, 80, 45, 90, 70, 100, 55].map((altura, i) => (
              <Skeleton key={i} className="flex-1" style={{ height: `${altura}%` }} />
            ))}
          </div>
        </Card>
      )
    default: {
      const lineas = count ?? 3
      return (
        <div className={cn("space-y-2", className)} aria-hidden>
          {Array.from({ length: lineas }, (_, i) => (
            <Skeleton key={i} className={cn("h-4", i === lineas - 1 ? "w-2/5" : "w-full")} />
          ))}
        </div>
      )
    }
  }
}
