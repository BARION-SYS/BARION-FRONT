"use client"

import { MapPin } from "lucide-react"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { Loadable } from "@shared/components/feedback/Loadable"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import { useFormato } from "@shared/hooks/useFormato"
import type { SedePlataforma } from "@features/plataforma/types/plataforma.types"

interface PlataformaSedesListProps {
  sedes: SedePlataforma[] | null
  loading: boolean
}

/**
 * Las sedes de una barbería con su pulso de 30 días.
 *
 * Salen también las desactivadas, al final: soporte necesita ver que existió
 * una segunda sede para entender por qué la barbería «perdió» la mitad de sus
 * citas. La barra es proporcional a la sede con más citas.
 */
export function PlataformaSedesList({ sedes, loading }: PlataformaSedesListProps) {
  const { numero } = useFormato()
  const lista = sedes ?? []
  const techo = Math.max(...lista.map((sede) => sede.citas30d), 1)

  return (
    <SectionCard
      titulo="Sedes"
      subtitulo={
        sedes
          ? `${numero(lista.filter((sede) => sede.activa).length)} activas de ${numero(lista.length)}`
          : "Dónde atiende"
      }
      className="h-full"
    >
      <Loadable
        loading={loading || !sedes}
        variant="list"
        count={2}
        isEmpty={lista.length === 0}
        emptyState={
          <p className="py-6 text-center text-sm text-muted-foreground">
            No tiene ninguna sede: no puede agendar nada.
          </p>
        }
      >
        <ul className="flex flex-col divide-y divide-border">
          {lista.map((sede) => (
            <li key={sede.id} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{sede.nombre}</p>
                  <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                    <MapPin className="size-3 shrink-0" aria-hidden />
                    {sede.ciudad ?? "Sin ciudad"} · {sede.zonaHoraria}
                  </p>
                </div>
                {!sede.activa && <StatusBadge tono="neutro" etiqueta="Desactivada" />}
              </div>

              <div
                className="h-1.5 overflow-hidden rounded-full bg-secondary"
                style={{ "--parte": `${(sede.citas30d / techo) * 100}%` } as React.CSSProperties}
                aria-hidden
              >
                <div className="h-full w-(--parte) rounded-full bg-(--chart-1)" />
              </div>

              <p className="text-xs text-muted-foreground tabular-nums">
                {numero(sede.citas30d)} citas en 30 días · {numero(sede.barberosActivos)}{" "}
                {sede.barberosActivos === 1 ? "barbero" : "barberos"}
              </p>
            </li>
          ))}
        </ul>
      </Loadable>
    </SectionCard>
  )
}
