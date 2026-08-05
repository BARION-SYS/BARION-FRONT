"use client"

import { use } from "react"
import Link from "next/link"
import { AlertTriangle, CheckCircle2, LifeBuoy } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { rutasWeb } from "@routes/rutasPublicas"

/**
 * A dónde vuelve quien abrió un enlace de pago que no servía.
 *
 * La api redirige aquí con `?estado=`, y esta pantalla es la mitad del contrato:
 * sin ella ese caso termina en un 404, que es la peor respuesta posible para
 * alguien que acaba de intentar pagar.
 *
 * **No lleva sesión a propósito.** El enlace se comparte, así que quien llega
 * puede no tener cuenta en Barion — pedirle que entre para leer un mensaje sería
 * cerrarle la puerta después de haberlo mandado a pagar.
 */
export default function PagoPage({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  const { estado } = use(searchParams)
  const copia = copiaPorEstado(estado)

  return (
    <main className="grid min-h-dvh place-items-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center">
        <span
          className={`mx-auto flex size-12 items-center justify-center rounded-full ${copia.fondo}`}
        >
          <copia.icono className={`h-6 w-6 ${copia.color}`} aria-hidden />
        </span>

        <h1 className="mt-4 text-lg font-semibold text-foreground">{copia.titulo}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{copia.detalle}</p>

        <div className="mt-6">
          <Button variant="outline" className="min-h-11 w-full" render={<Link href="/entrar" />}>
            Ir a Barion
          </Button>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          ¿Necesitas ayuda?{" "}
          <a className="text-primary underline-offset-4 hover:underline" href={rutasWeb.inicio}>
            Escríbenos
          </a>
        </p>
      </div>
    </main>
  )
}

/**
 * `inservible` agrupa tres casos —no existe, caducó, ya no está pendiente— porque
 * la api los responde igual: distinguirlos convertiría la dirección en un oráculo
 * de referencias válidas. La copia tiene que cubrir los tres sin mentir en
 * ninguno, y por eso no dice cuál fue.
 */
function copiaPorEstado(estado: string | undefined) {
  if (estado === "ya_pagado") {
    return {
      icono: CheckCircle2,
      color: "text-(--exito)",
      fondo: "bg-[color-mix(in_srgb,var(--exito)_14%,transparent)]",
      titulo: "Este pago ya se hizo",
      detalle: "No hace falta que pagues otra vez. Puedes cerrar esta página tranquilo.",
    }
  }

  if (estado === "sin_pasarela") {
    return {
      icono: LifeBuoy,
      color: "text-(--advertencia)",
      fondo: "bg-[color-mix(in_srgb,var(--advertencia)_14%,transparent)]",
      titulo: "No pudimos abrir el pago",
      detalle:
        "Es un problema nuestro, no tuyo. Avísale a quien te mandó el enlace para que lo genere de nuevo.",
    }
  }

  return {
    icono: AlertTriangle,
    color: "text-(--advertencia)",
    fondo: "bg-[color-mix(in_srgb,var(--advertencia)_14%,transparent)]",
    titulo: "Este enlace ya no sirve",
    detalle:
      "Los enlaces de pago caducan a las 24 horas. Pídele uno nuevo a quien te lo envió y podrás pagar sin problema.",
  }
}
