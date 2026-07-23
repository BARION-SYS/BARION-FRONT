"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"
import { Check, Copy, Download, Share2 } from "lucide-react"
import QRCodeStyling from "qr-code-styling"
import { Card } from "@shared/components/ui/card"
import { Button } from "@shared/components/ui/button"
import { cn } from "@shared/utils/cn"

interface PropsCodigoQr {
  nombreBarberia: string
  url: string
  copiado: boolean
  onCopiar: () => void
}

// QR REAL (qr-code-styling): codifica la URL de reservas, escaneable.
// Siempre sobre placa blanca — el contraste de escaneo no depende del tema.
// Módulos redondeados oscuros + esquinas con el color de marca + logo al centro.
function crearQr(url: string, colorMarca: string): QRCodeStyling {
  return new QRCodeStyling({
    width: 232,
    height: 232,
    type: "svg",
    data: url,
    image: "/barion-icon-light.webp",
    margin: 0,
    qrOptions: { errorCorrectionLevel: "H" },
    imageOptions: { margin: 4, imageSize: 0.32 },
    dotsOptions: { type: "rounded", color: "#18181b" },
    cornersSquareOptions: { type: "extra-rounded", color: colorMarca },
    cornersDotOptions: { type: "dot", color: "#18181b" },
    backgroundOptions: { color: "#ffffff" },
  })
}

// Marca legible sobre blanco: si el primario del tenant es muy claro, cae a oscuro.
function colorMarcaEscaneable(): string {
  const primario = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim()
  if (!/^#[0-9a-f]{6}$/i.test(primario)) return "#8f6b21"
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(primario.slice(i, i + 2), 16) / 255)
  const luminancia = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return luminancia > 0.6 ? "#18181b" : primario
}

export function QrCodigoCard({ nombreBarberia, url, copiado, onCopiar }: PropsCodigoQr) {
  const contenedorRef = useRef<HTMLDivElement>(null)
  const qrRef = useRef<QRCodeStyling | null>(null)
  const { resolvedTheme } = useTheme()

  // Pinta/actualiza el QR; se re-tiñe al cambiar el tema (el token --primary cambia).
  useEffect(() => {
    if (!contenedorRef.current) return
    const color = colorMarcaEscaneable()
    if (!qrRef.current) {
      qrRef.current = crearQr(url, color)
      qrRef.current.append(contenedorRef.current)
    } else {
      qrRef.current.update({ data: url, cornersSquareOptions: { color } })
    }
  }, [url, resolvedTheme])

  const descargar = () => {
    void qrRef.current?.download({ name: "barion-qr-reservas", extension: "png" })
  }

  const compartir = () => {
    if (navigator.share) {
      void navigator.share({ title: nombreBarberia, url }).catch(() => {})
    } else {
      onCopiar()
    }
  }

  return (
    <Card className="w-full items-center self-start p-6">
      <div className="text-center">
        <p className="text-sm font-semibold text-foreground">Código QR de la barbería</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Muéstralo en tu local o compártelo digitalmente
        </p>
      </div>

      {/* Placa blanca con marco — contraste de escaneo garantizado en ambos temas */}
      <div className="relative mt-1 mb-2 overflow-hidden rounded-2xl bg-white p-5 shadow-lg ring-1 ring-border">
        <div className="cinta-barberia absolute inset-x-0 top-0 h-1" aria-hidden />
        <div
          ref={contenedorRef}
          className="block [&_svg]:block"
          role="img"
          aria-label={`Código QR del enlace de reservas de ${nombreBarberia}`}
        />
      </div>

      <div className="max-w-full min-w-0 text-center">
        <p className="text-xs font-medium text-foreground">{nombreBarberia}</p>
        <p className="truncate text-[11px] text-muted-foreground">{url}</p>
      </div>

      <div className="mt-auto grid w-full grid-cols-3 gap-2">
        <Button
          variant="secondary"
          onClick={descargar}
          className="h-auto min-h-11 cursor-pointer flex-col gap-1.5 py-3 text-muted-foreground hover:text-foreground motion-reduce:transition-none"
        >
          <Download aria-hidden />
          <span className="text-[10px]">Descargar</span>
        </Button>
        <Button
          variant="secondary"
          onClick={compartir}
          className="h-auto min-h-11 cursor-pointer flex-col gap-1.5 py-3 text-muted-foreground hover:text-foreground motion-reduce:transition-none"
        >
          <Share2 aria-hidden />
          <span className="text-[10px]">Compartir</span>
        </Button>
        <Button
          variant="secondary"
          onClick={onCopiar}
          className={cn(
            "h-auto min-h-11 cursor-pointer flex-col gap-1.5 py-3 motion-reduce:transition-none",
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
