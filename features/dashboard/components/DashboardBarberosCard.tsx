import { SectionCard } from "@shared/components/cards/SectionCard"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import type { ResumenBarbero } from "@features/dashboard/types/dashboard.types"
import { formatNumber } from "@shared/utils/numbers"

interface Props {
  barberos: ResumenBarbero[]
}

export function DashboardBarberosCard({ barberos }: Props) {
  return (
    <SectionCard
      titulo="Rendimiento barberos"
      accion={
        <span className="rounded-md bg-secondary px-2 py-1 text-[10px] text-muted-foreground">
          Esta semana
        </span>
      }
    >
      <ul className="space-y-4">
        {barberos.map((barbero) => (
          <li key={barbero.nombre} className="flex items-center gap-3">
            <InitialsAvatar iniciales={barbero.iniciales} color={barbero.color} />
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center justify-between">
                <div>
                  <p className="text-xs leading-none font-semibold text-foreground">
                    {barbero.nombre}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {barbero.citas} citas · ★ {barbero.calificacion}
                  </p>
                </div>
                <p
                  className="text-xs font-bold text-(--tono) tabular-nums"
                  style={{ "--tono": barbero.color } as React.CSSProperties}
                >
                  ${formatNumber(barbero.ingresos)}
                </p>
              </div>
              <div
                className="h-1.5 w-full overflow-hidden rounded-full bg-secondary"
                role="progressbar"
                aria-valuenow={barbero.porcentajeMeta}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Meta semanal de ${barbero.nombre}: ${barbero.porcentajeMeta}%`}
              >
                <div
                  className="h-full rounded-full transition-[width] duration-700 motion-reduce:transition-none"
                  style={
                    {
                      "--tono": barbero.color,
                      width: `${barbero.porcentajeMeta}%`,
                    } as React.CSSProperties
                  }
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}
