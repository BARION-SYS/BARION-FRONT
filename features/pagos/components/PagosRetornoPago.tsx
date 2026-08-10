"use client"

import { RefreshCw, X } from "lucide-react"
import { Button } from "@shared/components/ui/button"

interface PagosRetornoPagoProps {
  /** La referencia con la que se acaba de pagar, para poder cotejarla. */
  referencia: string
  cargando: boolean
  onActualizar: () => void
  onCerrar: () => void
}

/**
 * Lo que se enseña a quien vuelve del checkout de la pasarela.
 *
 * ── Por qué NO dice «pago realizado» ────────────────────────────────────────
 * Al volver aquí Barion todavía no sabe qué pasó, y decirlo sería lo más caro que
 * puede afirmar esta pantalla. El resultado llega por la notificación del
 * proveedor y lo aplica el worker; la redirección solo significa «el navegador
 * salió del checkout», que también ocurre cuando alguien cancela o cierra a mitad.
 *
 * De ahí que el texto hable de confirmación en curso y ofrezca **actualizar** en
 * vez de un estado inventado: el dato bueno está en el resumen del plan y en la
 * lista de enlaces, que es lo que el botón vuelve a pedir.
 *
 * Presentacional puro: quién refresca y quién lo cierra viven en el padre.
 */
export function PagosRetornoPago({
  referencia,
  cargando,
  onActualizar,
  onCerrar,
}: PagosRetornoPagoProps) {
  return (
    <section
      // `polite` y no `assertive`: es una confirmación de contexto, no una
      // alarma, y no debe interrumpir a quien va con lector de pantalla.
      aria-live="polite"
      className="flex flex-wrap items-start gap-3 rounded-xl border border-(--info)/40 bg-[color-mix(in_srgb,var(--info)_8%,transparent)] p-4"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--info)_14%,transparent)] text-(--info)">
        <RefreshCw className="h-5 w-5" aria-hidden />
      </span>

      <div className="min-w-0 flex-1 space-y-1">
        <h3 className="text-base font-semibold text-foreground">Volviste del pago</h3>
        <p className="text-sm text-muted-foreground">
          Estamos esperando la confirmación de la pasarela. Puede tardar unos minutos y no hace
          falta pagar otra vez: cuando llegue, tu plan y tus facturas se actualizan solos.
        </p>
        <p className="truncate font-mono text-[11px] text-muted-foreground">{referencia}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button variant="outline" className="min-h-11" disabled={cargando} onClick={onActualizar}>
          <RefreshCw aria-hidden />
          Actualizar
        </Button>
        <Button variant="ghost" size="icon" className="min-h-11 min-w-11" onClick={onCerrar}>
          <X aria-hidden />
          <span className="sr-only">Cerrar el aviso del pago</span>
        </Button>
      </div>
    </section>
  )
}
