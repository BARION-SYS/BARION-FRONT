import { SectionCard } from "@shared/components/cards/SectionCard"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import { Badge } from "@shared/components/ui/badge"
import type { EscaneoQr } from "@features/qr/types/qr.types"

const coloresAvatar = [
  "var(--chart-1)",
  "var(--chart-3)",
  "var(--chart-2)",
  "var(--chart-4)",
  "var(--chart-5)",
]

interface PropsEscaneosRecientes {
  escaneos: EscaneoQr[]
}

export function QrEscaneosList({ escaneos }: PropsEscaneosRecientes) {
  return (
    <SectionCard titulo="Escaneos recientes">
      <ul className="space-y-2.5">
        {escaneos.map((escaneo, i) => (
          <li key={escaneo.id} className="flex items-center gap-3">
            <InitialsAvatar
              iniciales={escaneo.iniciales}
              color={coloresAvatar[i % coloresAvatar.length]}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-foreground">{escaneo.nombre}</p>
              <p className="truncate text-[10px] text-muted-foreground">{escaneo.accion}</p>
            </div>
            <Badge variant="secondary" className="shrink-0 text-[10px]">
              {escaneo.hace}
            </Badge>
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}
