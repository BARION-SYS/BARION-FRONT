"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { cn } from "@shared/utils/cn"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { SinDatos } from "@shared/components/feedback/SinDatos"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import { tokenDeColor } from "@shared/utils/color"
import { inicialesDe } from "@shared/utils/iniciales"
import { useFormato } from "@shared/hooks/useFormato"
import { configEstadoCita } from "@features/citas/utils/estadoCita"
import type { Cita } from "@features/citas/types/citas.types"

interface DashboardCitasCardProps {
  /** Las citas de hoy, tal como las devuelve `GET /citas`. */
  citas: Cita[]
}

export function DashboardCitasCard({ citas }: DashboardCitasCardProps) {
  const { diaSemana, hora } = useFormato()

  const completadas = citas.filter((cita) => cita.estado === "completada").length
  const enCurso = citas.filter((cita) => cita.estado === "en_curso").length
  const canceladas = citas.filter(
    (cita) => cita.estado === "cancelada" || cita.estado === "no_asistio"
  ).length

  return (
    <SectionCard
      titulo="Citas de hoy"
      subtitulo={diaSemana(new Date())}
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
      {citas.length === 0 ? (
        <SinDatos titulo="Hoy no hay nada agendado" alto={120} />
      ) : (
        <ul className="scroll-fino max-h-80 flex-1 space-y-1.5 overflow-y-auto pr-1">
          {citas.map((cita) => {
            const estado = configEstadoCita[cita.estado]
            const nombreCliente = cita.cliente?.nombre ?? "Cliente"

            return (
              <li
                key={cita.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3 transition-colors",
                  cita.estado === "en_curso"
                    ? "border-primary/30 bg-primary/5"
                    : "border-transparent bg-secondary/50 hover:bg-secondary"
                )}
              >
                <InitialsAvatar
                  iniciales={inicialesDe(nombreCliente)}
                  color={tokenDeColor(cita.barbero?.indiceColor ?? 0)}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-foreground">{nombreCliente}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {cita.servicios.map((linea) => linea.nombre).join(" + ")}
                    {cita.barbero && ` · ${cita.barbero.nombrePublico}`}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-semibold text-foreground tabular-nums">
                    {hora(cita.iniciaEn)}
                  </p>
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
      )}

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
            <span className="font-semibold">{canceladas}</span> perdidas
          </span>
        </div>
      </div>
    </SectionCard>
  )
}
