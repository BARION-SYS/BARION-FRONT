"use client"

import { SectionCard } from "@shared/components/cards/SectionCard"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"
import { useFormato } from "@shared/hooks/useFormato"
import type { EquipoBarberia } from "@features/plataforma/types/plataforma.types"

interface PlataformaEquipoCardProps {
  equipo: EquipoBarberia | null
  loading: boolean
}

/**
 * El equipo contado por rol. Sin nombres: el propietario ya sale en su propia
 * tarjeta como contraparte del contrato, y del resto basta saber cuántos son.
 *
 * Los barberos «sin cuenta» se cuentan aparte porque cambian cómo se da soporte:
 * diez barberos y ninguno con acceso es una barbería que lleva una sola persona.
 */
export function PlataformaEquipoCard({ equipo, loading }: PlataformaEquipoCardProps) {
  const { numero } = useFormato()

  const filas = equipo
    ? [
        { etiqueta: "Propietarios", valor: equipo.propietarios },
        { etiqueta: "Administradores", valor: equipo.administradores },
        { etiqueta: "Barberos con acceso", valor: equipo.barberosConAcceso },
        {
          etiqueta: "Barberos sin cuenta",
          valor: equipo.barberosSinCuenta,
          nota: "Atienden, no entran",
        },
        { etiqueta: "Barberos retirados", valor: equipo.barberosInactivos },
        { etiqueta: "Accesos revocados", valor: equipo.accesosRevocados },
      ]
    : []

  return (
    <SectionCard titulo="Equipo" subtitulo="Quién trabaja ahí, contado por rol">
      {loading || !equipo ? (
        <DataSkeleton variant="list" count={3} />
      ) : (
        <dl className="flex flex-col divide-y divide-border">
          {filas.map((fila) => (
            <div key={fila.etiqueta} className="flex items-baseline justify-between gap-3 py-2">
              <dt className="text-sm text-muted-foreground">
                {fila.etiqueta}
                {fila.nota && <span className="block text-xs">{fila.nota}</span>}
              </dt>
              <dd
                className={
                  fila.valor === 0
                    ? "text-sm text-muted-foreground tabular-nums"
                    : "text-sm font-semibold tabular-nums"
                }
              >
                {numero(fila.valor)}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </SectionCard>
  )
}
