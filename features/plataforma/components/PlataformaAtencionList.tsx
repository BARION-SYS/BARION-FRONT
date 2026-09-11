"use client"

import Link from "next/link"
import { ChevronRight, ShieldCheck } from "lucide-react"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import { Loadable } from "@shared/components/feedback/Loadable"
import { useFormato } from "@shared/hooks/useFormato"
import { inicialesDe } from "@shared/utils/iniciales"
import { MOTIVO_ATENCION, type BarberiaEnAtencion } from "@features/plataforma/utils/salud"

interface PlataformaAtencionListProps {
  items: BarberiaEnAtencion[]
  loading: boolean
  /** Cuántas se enseñan. El resto se lee en el inventario. */
  limite?: number
}

/**
 * A quién hay que llamar hoy, de la más grave a la menos.
 *
 * Cada fila dice POR QUÉ está aquí —con palabras, no con un punto de color— y
 * lleva a la ficha, que es donde se decide: suspender mirando una fila de lista
 * es decidir sin mirar.
 */
export function PlataformaAtencionList({
  items,
  loading,
  limite = 5,
}: PlataformaAtencionListProps) {
  const { numero } = useFormato()

  return (
    <Loadable
      loading={loading}
      variant="list"
      count={3}
      isEmpty={items.length === 0}
      emptyState={
        <div className="flex items-center gap-3 rounded-lg border border-dashed border-border px-4 py-5">
          <ShieldCheck className="size-5 shrink-0 text-(--exito)" aria-hidden />
          <p className="text-sm text-muted-foreground">
            Nada que atender: ninguna barbería en mora, dormida ni sin propietario.
          </p>
        </div>
      }
    >
      <ul className="-mx-2 flex flex-col">
        {items.slice(0, limite).map(({ barberia, motivos }) => (
          <li key={barberia.id}>
            <Link
              href={`/admin/barberias/${barberia.id}`}
              className="flex min-h-11 items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-secondary/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <InitialsAvatar iniciales={inicialesDe(barberia.nombreComercial)} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  {barberia.nombreComercial}
                </span>
                <span className="block truncate text-xs text-muted-foreground tabular-nums">
                  {numero(barberia.uso.clientesTotal)} clientes · {numero(barberia.uso.citas30d)}{" "}
                  citas en 30 días
                </span>
              </span>
              <span className="hidden flex-wrap justify-end gap-1 sm:flex">
                {motivos.slice(0, 2).map((motivo) => (
                  <StatusBadge key={motivo} {...MOTIVO_ATENCION[motivo]} />
                ))}
              </span>
              <span className="sm:hidden">
                <StatusBadge {...MOTIVO_ATENCION[motivos[0]]} />
              </span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
      {items.length > limite && (
        <Link
          href="/admin/barberias"
          className="mt-2 inline-flex min-h-11 items-center text-xs font-medium text-primary hover:underline"
        >
          Y {numero(items.length - limite)} más en el inventario
        </Link>
      )}
    </Loadable>
  )
}
