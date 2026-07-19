import { SectionCard } from "@shared/components/cards/SectionCard"

interface PropsCapacidadesQr {
  capacidades: string[]
}

export function QrCapacidadesCard({ capacidades }: PropsCapacidadesQr) {
  return (
    <SectionCard titulo="Al escanear el QR el cliente puede">
      <ol className="space-y-2">
        {capacidades.map((capacidad, i) => (
          <li key={capacidad} className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <span
              className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[8px] font-bold text-primary"
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
