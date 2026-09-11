"use client"

import Link from "next/link"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import { useFormato } from "@shared/hooks/useFormato"
import { inicialesDe } from "@shared/utils/iniciales"
import { AccionesBarberia } from "@features/plataforma/components/AccionesBarberia"
import { ESTADO_BARBERIA, nombreDePais } from "@features/plataforma/utils/inventario"
import { PULSO, pulsoDe } from "@features/plataforma/utils/salud"
import type {
  BarberiaInventario,
  EstadoBarberia,
} from "@features/plataforma/types/plataforma.types"

interface PlataformaCardProps {
  barberia: BarberiaInventario
  gestiona: boolean
  onCambiarEstado: (barberia: BarberiaInventario, destino: EstadoBarberia) => void
}

/**
 * Una barbería del inventario en móvil. Sustituye a la fila de la tabla por
 * debajo de `md`: plegar columnas hasta dejar tres deja fuera justo lo que se
 * busca —el pulso y el plan—, y una tabla que scrollea en horizontal en un
 * teléfono no se lee.
 */
export function PlataformaCard({ barberia, gestiona, onCambiarEstado }: PlataformaCardProps) {
  const { numero } = useFormato()
  const estado = ESTADO_BARBERIA[barberia.estado]
  const pulso = PULSO[pulsoDe(barberia)]

  return (
    <article className="rounded-xl border border-border bg-card p-4">
      <header className="flex items-start gap-3">
        <Link
          href={`/admin/barberias/${barberia.id}`}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <InitialsAvatar iniciales={inicialesDe(barberia.nombreComercial)} tamano="md" />
          <span className="min-w-0">
            <span className="block truncate text-base font-semibold">
              {barberia.nombreComercial}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              /{barberia.slug} · {nombreDePais(barberia.codigoPais)}
            </span>
          </span>
        </Link>
        <AccionesBarberia
          barberia={barberia}
          gestiona={gestiona}
          onCambiarEstado={onCambiarEstado}
        />
      </header>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <StatusBadge tono={estado.tono} etiqueta={estado.etiqueta} />
        {barberia.estado === "activa" && (
          <StatusBadge tono={pulso.tono} etiqueta={pulso.etiqueta} icono={pulso.icono} />
        )}
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3">
        <div>
          <dt className="text-xs text-muted-foreground">Clientes</dt>
          <dd className="text-sm font-semibold tabular-nums">
            {numero(barberia.uso.clientesTotal)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Citas 30 d</dt>
          <dd className="text-sm font-semibold tabular-nums">{numero(barberia.uso.citas30d)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-muted-foreground">Plan</dt>
          <dd className="truncate text-sm font-semibold capitalize">
            {barberia.suscripcion?.planCodigo ?? "Sin plan"}
          </dd>
        </div>
      </dl>
    </article>
  )
}
