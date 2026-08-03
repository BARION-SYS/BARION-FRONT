import { Check, Copy, Link } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Input } from "@shared/components/ui/input"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { cn } from "@shared/utils/cn"

interface QrEnlaceCardProps {
  url: string
  /** La sede del cartón: el enlace lleva su marca y por eso no es uno solo. */
  nombreSede: string
  copiado: boolean
  onCopiar: () => void
}

/**
 * El enlace que codifica el cartón. **No hay «generar uno nuevo» y no es un
 * olvido**: el `slug` de la barbería va impreso en los códigos ya repartidos y
 * cambiarlo los dejaría muertos, así que no se edita. La marca de la sede sí se
 * puede rotar, pero eso se hace en `/dashboard/sedes` —donde se ve lo que se está
 * invalidando—, no desde un botón suelto aquí.
 */
export function QrEnlaceCard({ url, nombreSede, copiado, onCopiar }: QrEnlaceCardProps) {
  return (
    <SectionCard titulo="Enlace de reserva" subtitulo={`Cartón de ${nombreSede}`}>
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

      <p className="mt-3 text-xs text-muted-foreground">
        Lleva la marca de esta sede: lo que se reserve desde aquí queda atribuido a su cartón.
      </p>
    </SectionCard>
  )
}
