"use client"

import { useState } from "react"
import { Check, Copy, ExternalLink } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { notify } from "@shared/services/notify"

interface EnlaceCopiableProps {
  etiqueta: string
  descripcion?: string
  valor: string
}

/**
 * Un dato que existe para pasárselo a otra persona: la dirección del portal, la
 * puerta de su equipo, el correo con el que entra.
 *
 * Se copia desde aquí porque el trabajo de esta área acaba fuera del sistema —en
 * un WhatsApp al cliente—, y seleccionar a mano un slug largo es donde se cuela
 * el carácter de más que rompe el enlace.
 */
export function EnlaceCopiable({ etiqueta, descripcion, valor }: EnlaceCopiableProps) {
  const [copiado, setCopiado] = useState(false)
  const esEnlace = valor.startsWith("http")

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(valor)
      setCopiado(true)
      window.setTimeout(() => setCopiado(false), 2000)
    } catch {
      // Sin permiso de portapapeles el valor sigue visible y se puede
      // seleccionar a mano: se avisa en vez de dejar el botón mudo.
      notify.error("No se pudo copiar. Selecciona el texto y cópialo a mano")
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-sm font-medium">{etiqueta}</p>
      {descripcion && <p className="text-xs text-muted-foreground">{descripcion}</p>}
      <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2">
        <code className="min-w-0 flex-1 truncate text-xs">{valor}</code>
        {esEnlace && (
          <a
            href={valor}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label={`Abrir ${etiqueta}`}
          >
            <ExternalLink className="size-3.5" aria-hidden />
          </a>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 shrink-0 px-2"
          onClick={() => void copiar()}
        >
          {copiado ? (
            <Check className="size-3.5 text-(--exito)" aria-hidden />
          ) : (
            <Copy className="size-3.5" aria-hidden />
          )}
          <span className="sr-only">Copiar {etiqueta}</span>
        </Button>
      </div>
    </div>
  )
}
