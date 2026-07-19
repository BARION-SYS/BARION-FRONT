import { cn } from "@shared/utils/cn"

const DIAS_SEMANA = ["L", "M", "X", "J", "V", "S", "D"]

interface Props {
  diasLaborales: boolean[]
}

// Rejilla de los 7 días marcando cuáles trabaja el barbero.
export function HorarioSemanal({ diasLaborales }: Props) {
  return (
    <div className="grid grid-cols-7 gap-2">
      {DIAS_SEMANA.map((dia, i) => {
        const trabaja = diasLaborales[i]
        return (
          <div
            key={dia}
            className={cn(
              "rounded-lg border p-3 text-center",
              trabaja ? "border-primary/30 bg-primary/5" : "border-border bg-secondary"
            )}
          >
            <p className="mb-1 text-[10px] tracking-wide text-muted-foreground uppercase">{dia}</p>
            <p
              className={cn(
                "text-xs font-bold",
                trabaja ? "text-primary" : "text-muted-foreground"
              )}
            >
              <span aria-hidden>{trabaja ? "✓" : "—"}</span>
              <span className="sr-only">{trabaja ? "Trabaja" : "Descansa"}</span>
            </p>
          </div>
        )
      })}
    </div>
  )
}
