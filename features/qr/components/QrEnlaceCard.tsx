import { Check, Copy, Link, RefreshCw } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Input } from "@shared/components/ui/input"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { cn } from "@shared/utils/cn"

interface QrEnlaceCardProps {
  url: string
  /** La sede del cartón: el enlace lleva su marca y por eso no es uno solo. */
  nombreSede: string
  /** La marca que distingue el cartón de esta sede dentro del enlace. */
  slugQr: string
  copiado: boolean
  onCopiar: () => void
  /** `sedes.gestionar`. Sin él se ve el código y el enlace, pero no se rota. */
  gestiona: boolean
  /** Abre la confirmación en el padre — aquí no se rota nada. */
  onRotar: () => void
}

/**
 * El enlace que codifica el cartón.
 *
 * **Lo que se rota es la marca de la SEDE, nunca el `slug` de la barbería**: ese
 * va en la ruta de todos los enlaces repartidos —los del cartón y los que se
 * comparten por WhatsApp— y cambiarlo los mataría todos. Por eso no se edita a
 * mano ni se propone un valor: el código nuevo lo genera el servidor, que es el
 * único que puede garantizar que no choque con el de otra barbería.
 */
export function QrEnlaceCard({
  url,
  nombreSede,
  slugQr,
  copiado,
  onCopiar,
  gestiona,
  onRotar,
}: QrEnlaceCardProps) {
  return (
    <SectionCard
      titulo="Enlace de reserva"
      subtitulo={`Cartón de ${nombreSede}`}
      accion={
        gestiona ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={onRotar}
            className="cursor-pointer"
          >
            <RefreshCw className="size-4" aria-hidden />
            Generar código nuevo
          </Button>
        ) : undefined
      }
    >
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
        Lleva la marca de esta sede —<span className="font-mono">{slugQr}</span>—: lo que se reserve
        desde aquí queda atribuido a su cartón.
      </p>
    </SectionCard>
  )
}
