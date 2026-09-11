"use client"

import Link from "next/link"
import { Sparkles } from "lucide-react"
import { rutasPublicas } from "@routes/rutasPublicas"
import { Button } from "@shared/components/ui/button"
import { useTextos } from "@shared/textos/useTextos"

interface PortalDemoAvisoProps {
  /** Una línea sobre el escaparate. Sin esto es la tarjeta que cierra la reserva. */
  compacto?: boolean
}

/**
 * «Esto es una demostración y aquí no se reserva».
 *
 * Aparece dos veces y a propósito: como franja al entrar —para que nadie recorra
 * cuatro pasos creyendo que va a agendar— y como tarjeta en el último paso, en
 * el sitio exacto donde estaría el formulario. La api rechaza igual el código
 * (`403` con `motivo: "barberia_demo"`), así que esto no protege nada: evita que
 * la única respuesta sea un error rojo sobre algo que no está roto.
 *
 * El enlace va con `next/link` porque `/registro` es una ruta de ESTA
 * aplicación: quien termina el alta entra al panel.
 */
export function PortalDemoAviso({ compacto = false }: PortalDemoAvisoProps) {
  const t = useTextos("portal.demo")

  if (compacto) {
    return (
      <div className="flex items-center justify-center gap-2 bg-[color-mix(in_srgb,var(--info)_14%,transparent)] px-4 py-2 text-center text-xs text-foreground sm:text-sm">
        <Sparkles className="size-4 shrink-0 text-(--info)" aria-hidden />
        <span>{t("titulo")}</span>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 text-center">
      <Sparkles className="mx-auto size-6 text-(--info)" aria-hidden />
      <h3 className="mt-3 text-base font-semibold text-foreground">{t("titulo")}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{t("detalle")}</p>
      <Button render={<Link href={rutasPublicas.registro} />} className="mt-5">
        {t("cta")}
      </Button>
    </div>
  )
}
