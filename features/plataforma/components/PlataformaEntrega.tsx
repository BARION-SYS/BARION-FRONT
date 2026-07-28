"use client"

import { useState } from "react"
import { Check, Copy, ExternalLink } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { notify } from "@shared/services/notify"
import type { BarberiaFicha } from "@features/plataforma/types/plataforma.types"

interface PlataformaEntregaProps {
  barberia: BarberiaFicha
  correoPropietario: string
}

/**
 * Lo que se le entrega al cliente que acaba de comprar.
 *
 * Es el final real del alta: la barbería ya existe, y lo único que falta es que
 * su dueño reciba por dónde entra. A partir de ahí él crea sus barberos, su
 * catálogo y su código QR — Barion no vuelve a tocarla.
 *
 * La contraseña NO se muestra aquí: la escribió quien está dando de alta y ya la
 * tiene. Repetirla en pantalla solo añade un sitio más del que puede escaparse.
 */
export function PlataformaEntrega({ barberia, correoPropietario }: PlataformaEntregaProps) {
  const [copiado, setCopiado] = useState<string | null>(null)

  const origen = typeof window === "undefined" ? "" : window.location.origin
  const urlEntrada = `${origen}/b/${barberia.slug}/entrar`
  const urlPortal = `${origen}/b/${barberia.slug}`

  const copiar = async (texto: string, clave: string) => {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(clave)
      window.setTimeout(() => setCopiado(null), 2000)
    } catch {
      // Sin permiso de portapapeles el enlace sigue visible y se puede
      // seleccionar a mano: se avisa en vez de dejar el botón mudo.
      notify.error("No se pudo copiar. Selecciona el enlace y cópialo a mano")
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl border border-(--exito)/30 bg-[color-mix(in_srgb,var(--exito)_8%,transparent)] p-4">
        <p className="text-sm font-medium text-foreground">
          {barberia.nombreComercial} ya está creada y funcionando.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Envíale a tu cliente el enlace de entrada junto con el correo y la contraseña temporal que
          acabas de definir. Al entrar podrá cambiarla.
        </p>
      </div>

      <EnlaceCopiable
        etiqueta="Entrada de su equipo"
        descripcion="Aquí entran el propietario y, más adelante, sus barberos"
        valor={urlEntrada}
        copiado={copiado === "entrada"}
        onCopiar={() => void copiar(urlEntrada, "entrada")}
      />

      <EnlaceCopiable
        etiqueta="Portal público de reservas"
        descripcion="Lo que verán sus clientes. Es también el destino del código QR"
        valor={urlPortal}
        copiado={copiado === "portal"}
        onCopiar={() => void copiar(urlPortal, "portal")}
      />

      <EnlaceCopiable
        etiqueta="Correo del propietario"
        descripcion="Con este correo inicia sesión"
        valor={correoPropietario}
        copiado={copiado === "correo"}
        onCopiar={() => void copiar(correoPropietario, "correo")}
      />
    </div>
  )
}

interface EnlaceCopiableProps {
  etiqueta: string
  descripcion: string
  valor: string
  copiado: boolean
  onCopiar: () => void
}

function EnlaceCopiable({ etiqueta, descripcion, valor, copiado, onCopiar }: EnlaceCopiableProps) {
  const esEnlace = valor.startsWith("http")

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-sm font-medium">{etiqueta}</p>
      <p className="text-xs text-muted-foreground">{descripcion}</p>
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
          onClick={onCopiar}
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
