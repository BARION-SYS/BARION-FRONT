import { Check, Copy, Download, Share2 } from "lucide-react"
import { Card } from "@shared/components/ui/card"
import { Button } from "@shared/components/ui/button"
import { cn } from "@shared/utils/cn"

interface PropsCodigoQr {
  nombreBarberia: string
  url: string
  copiado: boolean
  onCopiar: () => void
}

export function QrCodigoCard({ nombreBarberia, url, copiado, onCopiar }: PropsCodigoQr) {
  return (
    <Card className="items-center p-6">
      <div className="text-center">
        <p className="text-sm font-semibold text-foreground">Código QR de la Barbería</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Muéstralo en tu local o compártelo digitalmente
        </p>
      </div>

      {/* QR simulado — fondo claro sobre foreground para contraste de escaneo */}
      <div className="mt-1 mb-2 rounded-2xl bg-foreground p-5 shadow-lg">
        <svg
          width="160"
          height="160"
          viewBox="0 0 160 160"
          className="block"
          role="img"
          aria-label={`Código QR del enlace de reservas de ${nombreBarberia}`}
        >
          {[0, 1, 2, 3, 4, 5, 6].map((fila) =>
            [0, 1, 2, 3, 4, 5, 6].map((col) => {
              const esEsquina =
                (fila < 3 && col < 3) || (fila < 3 && col > 3) || (fila > 3 && col < 3)
              const semilla = (fila * 7 + col * 3 + fila + col) % 2
              return esEsquina || semilla === 0 ? (
                <rect
                  key={`${fila}-${col}`}
                  x={col * 20 + 20}
                  y={fila * 20 + 20}
                  width="16"
                  height="16"
                  rx="2"
                  fill="var(--background)"
                />
              ) : null
            })
          )}
          {/* Cuadros de esquina */}
          <rect
            x="20"
            y="20"
            width="56"
            height="56"
            rx="6"
            fill="none"
            stroke="var(--background)"
            strokeWidth="5"
          />
          <rect
            x="84"
            y="20"
            width="56"
            height="56"
            rx="6"
            fill="none"
            stroke="var(--background)"
            strokeWidth="5"
          />
          <rect
            x="20"
            y="84"
            width="56"
            height="56"
            rx="6"
            fill="none"
            stroke="var(--background)"
            strokeWidth="5"
          />
          <rect x="36" y="36" width="24" height="24" rx="3" fill="var(--background)" />
          <rect x="100" y="36" width="24" height="24" rx="3" fill="var(--background)" />
          <rect x="36" y="100" width="24" height="24" rx="3" fill="var(--background)" />
          {/* Módulos de datos */}
          {Array.from({ length: 36 }, (_, i) => {
            const fila = Math.floor(i / 6)
            const col = i % 6
            if ((fila + col) % 2 === 0)
              return (
                <rect
                  key={`dato-${i}`}
                  x={84 + col * 10 + 2}
                  y={84 + fila * 10 + 2}
                  width="8"
                  height="8"
                  rx="1"
                  fill="var(--background)"
                />
              )
            return null
          })}
          {/* Logo central */}
          <rect x="65" y="65" width="30" height="30" rx="6" fill="var(--primary)" />
          <text
            x="80"
            y="85"
            textAnchor="middle"
            fontSize="14"
            fill="var(--primary-foreground)"
            fontWeight="bold"
          >
            T
          </text>
        </svg>
      </div>

      <div className="max-w-full min-w-0 text-center">
        <p className="text-xs font-medium text-foreground">{nombreBarberia}</p>
        <p className="truncate text-[11px] text-muted-foreground">{url}</p>
      </div>

      <div className="mt-auto grid w-full grid-cols-3 gap-2">
        <Button
          variant="secondary"
          className="h-auto min-h-9 cursor-pointer flex-col gap-1.5 py-3 text-muted-foreground hover:text-foreground motion-reduce:transition-none"
        >
          <Download aria-hidden />
          <span className="text-[10px]">Descargar</span>
        </Button>
        <Button
          variant="secondary"
          className="h-auto min-h-9 cursor-pointer flex-col gap-1.5 py-3 text-muted-foreground hover:text-foreground motion-reduce:transition-none"
        >
          <Share2 aria-hidden />
          <span className="text-[10px]">Compartir</span>
        </Button>
        <Button
          variant="secondary"
          onClick={onCopiar}
          className={cn(
            "h-auto min-h-9 cursor-pointer flex-col gap-1.5 py-3 motion-reduce:transition-none",
            copiado
              ? "border-(--exito)/40 bg-(--exito)/10 text-(--exito)"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {copiado ? <Check aria-hidden /> : <Copy aria-hidden />}
          <span className="text-[10px]">{copiado ? "Copiado" : "Copiar"}</span>
        </Button>
      </div>
    </Card>
  )
}
