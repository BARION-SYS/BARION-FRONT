import { Label } from "@shared/components/ui/label"
import { Switch } from "@shared/components/ui/switch"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { cn } from "@shared/utils/cn"
import { useTextos } from "@shared/textos/useTextos"
import type {
  CanalNotificacion,
  CanalesNotificacion,
  InfoCanalNotificacion,
} from "@features/configuracion/types/configuracion.types"

interface Props {
  canales: InfoCanalNotificacion[]
  activos: CanalesNotificacion
  alAlternar: (canal: CanalNotificacion) => void
}

export function Notificaciones({ canales, activos, alAlternar }: Props) {
  const t = useTextos("configuracion.notificaciones")
  return (
    <SectionCard titulo={t("titulo")} subtitulo={t("subtitulo")}>
      <ul className="space-y-3">
        {canales.map((canal) => {
          const activo = activos[canal.canal]
          return (
            <li
              key={canal.canal}
              className={cn(
                "flex items-center justify-between gap-4 rounded-xl border p-4 transition-colors motion-reduce:transition-none",
                activo ? "border-border bg-secondary" : "border-border/50 bg-card"
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ "--tono": canal.color } as React.CSSProperties}
                  aria-hidden
                >
                  <span className="h-3 w-3 rounded-full bg-(--tono)" />
                </span>
                <div>
                  <Label
                    htmlFor={`canal-${canal.canal}`}
                    className="cursor-pointer text-sm font-semibold text-foreground"
                  >
                    {canal.etiqueta}
                  </Label>
                  <p className="text-xs text-muted-foreground">{canal.descripcion}</p>
                </div>
              </div>
              <Switch
                id={`canal-${canal.canal}`}
                checked={activo}
                onCheckedChange={() => alAlternar(canal.canal)}
              />
            </li>
          )
        })}
      </ul>
    </SectionCard>
  )
}
