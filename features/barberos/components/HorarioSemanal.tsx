import { cn } from "@shared/utils/cn"
import { NOMBRE_DIA_CORTO, diasOrdenados } from "@features/barberos/constants/dias"
import type { TramoJornada } from "@features/barberos/types/barberos.types"

interface HorarioSemanalProps {
  tramos: TramoJornada[]
}

/**
 * La semana de un vistazo, en solo lectura.
 *
 * Un día puede tener varios tramos —mañana y tarde son dos— así que la celda
 * enseña el primero y cuántos más hay. Editarlos es otra pantalla: aquí solo se
 * responde "¿trabaja el jueves?".
 */
export function HorarioSemanal({ tramos }: HorarioSemanalProps) {
  const porDia = new Map<number, TramoJornada[]>()
  for (const tramo of tramos) {
    porDia.set(tramo.diaSemana, [...(porDia.get(tramo.diaSemana) ?? []), tramo])
  }

  return (
    <div className="grid grid-cols-7 gap-2">
      {diasOrdenados().map((dia) => {
        const delDia = porDia.get(dia) ?? []
        const trabaja = delDia.length > 0
        return (
          <div
            key={dia}
            className={cn(
              "rounded-lg border p-2 text-center",
              trabaja ? "border-primary/30 bg-primary/5" : "border-border bg-secondary"
            )}
          >
            <p className="mb-1 text-[10px] tracking-wide text-muted-foreground uppercase">
              {NOMBRE_DIA_CORTO[dia]}
            </p>
            {trabaja ? (
              <>
                <p className="text-[11px] font-semibold text-primary tabular-nums">
                  {delDia[0].inicio}
                </p>
                <p className="text-[11px] text-primary tabular-nums">{delDia[0].fin}</p>
                {delDia.length > 1 && (
                  <p className="text-[9px] text-muted-foreground">+{delDia.length - 1}</p>
                )}
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                <span aria-hidden>—</span>
                <span className="sr-only">Descansa</span>
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
