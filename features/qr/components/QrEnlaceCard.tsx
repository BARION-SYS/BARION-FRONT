import { Check, Copy, Link, RefreshCw } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Input } from "@shared/components/ui/input"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { cn } from "@shared/utils/cn"

interface PropsEnlaceReservas {
  url: string
  copiado: boolean
  onCopiar: () => void
}

export function QrEnlaceCard({ url, copiado, onCopiar }: PropsEnlaceReservas) {
  return (
    <SectionCard titulo="Enlace de reserva">
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Link
            className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input readOnly value={url} aria-label="Enlace de reserva" className="h-9 pl-8 text-xs" />
        </div>
        <Button
          variant="secondary"
          size="lg"
          onClick={onCopiar}
          className={cn(
            "shrink-0 cursor-pointer motion-reduce:transition-none",
            copiado && "text-(--exito)"
          )}
        >
          {copiado ? <Check aria-hidden /> : <Copy aria-hidden />}
          {copiado ? "Copiado" : "Copiar"}
        </Button>
      </div>

      <Button
        variant="ghost"
        size="lg"
        className="mt-3 cursor-pointer self-start text-xs text-muted-foreground hover:text-foreground motion-reduce:transition-none"
      >
        <RefreshCw aria-hidden />
        Generar nuevo enlace
      </Button>
    </SectionCard>
  )
}
