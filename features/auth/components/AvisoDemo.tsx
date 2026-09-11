"use client"

import Link from "next/link"
import { ArrowRight, Eye } from "lucide-react"
import { rutasPublicas } from "@routes/rutasPublicas"
import { useTextos } from "@shared/textos/useTextos"

/**
 * La franja que dice «esto es la demo» mientras se recorre el panel.
 *
 * La API rechaza cualquier escritura de una sesión demo, así que sin este aviso
 * quien la prueba rellenaría un formulario entero para enterarse al guardar. Va
 * fija bajo el navbar y en cada pantalla porque la pregunta —«¿esto se guarda?»—
 * aparece en cualquiera, no solo en la primera.
 *
 * La salida que ofrece es crear su barbería: quien está mirando la demo está
 * decidiendo si contratar, y ese es el siguiente paso, no un callejón.
 */
export function AvisoDemo() {
  const t = useTextos("auth.demo")

  return (
    <div
      role="status"
      className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b border-border bg-primary/10 px-4 py-2 text-center text-sm text-foreground"
    >
      <span className="inline-flex items-center gap-2">
        <Eye className="size-4 shrink-0 text-primary" aria-hidden />
        {t("aviso")}
      </span>
      <Link
        href={rutasPublicas.registro}
        className="inline-flex min-h-11 items-center gap-1 rounded-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none md:min-h-0"
      >
        {t("crear")}
        <ArrowRight className="size-3.5" aria-hidden />
      </Link>
    </div>
  )
}
