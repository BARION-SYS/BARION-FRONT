import { QrCode } from "lucide-react"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import { Badge } from "@shared/components/ui/badge"
import { Loadable } from "@shared/components/feedback/Loadable"
import { SinDatos } from "@shared/components/feedback/SinDatos"
import { useFormato } from "@shared/hooks/useFormato"
import { inicialesDe } from "@shared/utils/iniciales"
import { etiquetaAccionQr } from "@features/qr/constants/qr"
import type { ActividadQr } from "@features/qr/types/qr.types"

const coloresAvatar = [
  "var(--chart-1)",
  "var(--chart-3)",
  "var(--chart-2)",
  "var(--chart-4)",
  "var(--chart-5)",
]

interface QrActividadListProps {
  actividad: ActividadQr[]
  loading: boolean
}

/**
 * Quién llegó por el cartón. **Son conversiones, no visitas**: cada entrada es
 * una cita o una ficha de cliente creada con `origen = 'qr'`. Abrir la página no
 * deja rastro y no lo dejará, así que aquí nunca aparece nadie que solo mirara.
 *
 * Que esté vacío es lo normal hasta que el portal empiece a marcar el origen, y
 * se dice con esas palabras: un listado en blanco sin explicación se lee como una
 * pantalla rota.
 */
export function QrActividadList({ actividad, loading }: QrActividadListProps) {
  const { relativo } = useFormato()

  return (
    <SectionCard
      titulo="Llegaron por el código"
      subtitulo={
        actividad.length === 1 ? "1 cliente en el período" : `${actividad.length} en el período`
      }
    >
      <Loadable
        loading={loading}
        variant="list"
        count={4}
        isEmpty={actividad.length === 0}
        emptyState={
          <SinDatos
            titulo="Nadie ha llegado por el código todavía"
            detalle="Aquí aparecerá quien reserve o se registre después de escanearlo."
            icono={QrCode}
            alto={140}
          />
        }
      >
        <ul className="space-y-1.5">
          {actividad.map((entrada, i) => {
            const nombre = [entrada.cliente.nombre, entrada.cliente.apellido]
              .filter(Boolean)
              .join(" ")
            return (
              <li
                key={entrada.id}
                className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-secondary/50 motion-reduce:transition-none"
              >
                <InitialsAvatar
                  iniciales={inicialesDe(nombre)}
                  color={coloresAvatar[i % coloresAvatar.length]}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-foreground">{nombre}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {etiquetaAccionQr[entrada.accion]}
                    {entrada.sede ? ` · ${entrada.sede.nombre}` : ""}
                  </p>
                </div>
                <Badge variant="secondary" className="shrink-0 text-xs tabular-nums">
                  {relativo(entrada.ocurridoEn)}
                </Badge>
              </li>
            )
          })}
        </ul>
      </Loadable>
    </SectionCard>
  )
}
