import { SectionCard } from "@shared/components/cards/SectionCard"

interface QrCapacidadesCardProps {
  capacidades: readonly string[]
}

export function QrCapacidadesCard({ capacidades }: QrCapacidadesCardProps) {
  return (
    <SectionCard titulo="Al escanear el QR el cliente puede">
      <ol className="grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2">
        {capacidades.map((capacidad, i) => (
          <li key={capacidad} className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[9px] font-bold text-primary tabular-nums"
              aria-hidden
            >
              {i + 1}
            </span>
            {capacidad}
          </li>
        ))}
      </ol>
    </SectionCard>
  )
}
