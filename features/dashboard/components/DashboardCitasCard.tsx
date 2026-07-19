import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { cn } from "@shared/utils/cn"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import { configEstadoCita } from "@features/citas/utils/estadoCita"
import type { CitaHoy } from "@features/citas/types/citas.types"

const coloresAvatar = ["var(--chart-1)", "var(--chart-3)", "var(--chart-2)", "var(--chart-4)"]

interface Props {
  citas: CitaHoy[]
}

export function DashboardCitasCard({ citas }: Props) {
  const completadas = citas.filter((c) => c.estado === "completada").length
  const enCurso = citas.filter((c) => c.estado === "en-curso").length
  const canceladas = citas.filter((c) => c.estado === "cancelada").length

  return (
    <SectionCard
      titulo="Citas de hoy"
      subtitulo="Lunes, 14 Julio 2026"
      className="flex flex-col"
      accion={
        <Link
          href="/dashboard/citas"
          className="flex items-center gap-1 text-xs text-primary transition-colors hover:text-primary/80"
        >
          Ver todas <ChevronRight className="h-3 w-3" aria-hidden />
        </Link>
      }
    >
      <ul className="max-h-80 flex-1 space-y-1.5 overflow-y-auto pr-1">
        {citas.map((cita, i) => {
          const estado = configEstadoCita[cita.estado]
          return (
            <li
              key={cita.id}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-3 transition-colors",
                cita.estado === "en-curso"
                  ? "border-primary/30 bg-primary/5"
                  : "border-transparent bg-secondary/50 hover:bg-secondary"
              )}
            >
              <InitialsAvatar
                iniciales={cita.iniciales}
                color={coloresAvatar[i % coloresAvatar.length]}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-foreground">{cita.cliente}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {cita.servicio} · {cita.barbero}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs font-semibold text-foreground tabular-nums">{cita.hora}</p>
                <p className="text-[11px] text-muted-foreground">{cita.duracionMin} min</p>
              </div>
              <StatusBadge
                etiqueta={estado.etiqueta}
                tono={estado.tono}
                icono={estado.icono}
                compacta
              />
            </li>
          )
        })}
      </ul>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs">
        <p className="text-muted-foreground">
          <span className="font-semibold text-foreground">{citas.length}</span> citas totales
        </p>
        <div className="flex items-center gap-3">
          <span className="text-(--exito)">
            <span className="font-semibold">{completadas}</span> completas
          </span>
          <span className="text-primary">
            <span className="font-semibold">{enCurso}</span> en curso
          </span>
          <span className="text-destructive">
            <span className="font-semibold">{canceladas}</span> canceladas
          </span>
        </div>
      </div>
    </SectionCard>
  )
}
