import { SectionCard } from "@shared/components/cards/SectionCard"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import { Badge } from "@shared/components/ui/badge"
import { useFormato } from "@shared/hooks/useFormato"
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
  const { relativo } = useFormato()

  return (
    <SectionCard
      titulo="Escaneos recientes"
      subtitulo={`${escaneos.length} ${escaneos.length === 1 ? "interacción" : "interacciones"} vía QR`}
    >
      <ul className="space-y-1.5">
        {escaneos.map((escaneo, i) => (
          <li
            key={escaneo.id}
            className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-secondary/50 motion-reduce:transition-none"
          >
            <InitialsAvatar
              iniciales={escaneo.iniciales}
              color={coloresAvatar[i % coloresAvatar.length]}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground">{escaneo.nombre}</p>
              <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{escaneo.accion}</p>
            </div>
            <Badge variant="secondary" className="shrink-0 text-[10px] tabular-nums">
              {relativo(escaneo.escaneadoEn)}
            </Badge>
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}
