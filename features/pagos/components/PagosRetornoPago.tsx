"use client"

import { CheckCircle2, RefreshCw, X, XCircle } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import type { EstadoCobro } from "@features/pagos/types/pagos.types"

interface PagosRetornoPagoProps {
  /** La referencia con la que se acaba de pagar, para poder cotejarla. */
  referencia: string
  /**
   * En qué quedó ese cobro, si la api ya lo sabe.
   *
   * `undefined` = todavía no llegó la notificación de la pasarela, o el enlace
   * no está en la lista cargada. No es lo mismo que «falló».
   */
  estado?: EstadoCobro
  cargando: boolean
  onActualizar: () => void
  onCerrar: () => void
}

/**
 * Lo que se enseña a quien vuelve del checkout de la pasarela.
 *
 * ── Por qué no afirma nada por su cuenta ────────────────────────────────────
 * Al volver aquí la redirección solo significa «el navegador salió del
 * checkout», que también ocurre cuando alguien cancela o cierra a mitad. Quien
 * sabe qué pasó es la notificación del proveedor, que aplica el worker.
 *
 * ── Pero sí lee lo que YA se sabe ───────────────────────────────────────────
 * Antes se quedaba clavado en «esperando confirmación» aunque el cobro ya
 * estuviera aplicado: la misma referencia aparecía **Pagado** tres tarjetas más
 * abajo mientras el aviso seguía diciendo que faltaba. Dos verdades sobre el
 * mismo pago en la misma pantalla, y la que más se mira es la de arriba — que
 * era la falsa.
 *
 * Así que el aviso no inventa un estado, pero tampoco ignora el que ya llegó:
 * cruza la referencia contra el cobro y dice lo que corresponde. Mientras no
 * haya nada, sigue hablando de confirmación en curso.
 *
 * Presentacional puro: quién refresca y quién lo cierra viven en el padre.
 */
export function PagosRetornoPago({
  referencia,
  estado,
  cargando,
  onActualizar,
  onCerrar,
}: PagosRetornoPagoProps) {
  const vista = presentacion(estado)

  return (
    <section
      // `polite` y no `assertive`: es una confirmación de contexto, no una
      // alarma, y no debe interrumpir a quien va con lector de pantalla.
      aria-live="polite"
      // El color llega por dato, así que viaja como variable CSS y se pinta con
      // clases: un `style` con `backgroundColor` se saltaría el tema.
      style={{ "--tono": `var(${vista.tono})` } as React.CSSProperties}
      className="flex flex-wrap items-start gap-3 rounded-xl border border-[color-mix(in_srgb,var(--tono)_40%,transparent)] bg-[color-mix(in_srgb,var(--tono)_8%,transparent)] p-4"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--tono)_14%,transparent)] text-(--tono)">
        <vista.icono className="size-5" aria-hidden />
      </span>

      <div className="min-w-0 flex-1 space-y-1">
        <h3 className="text-base font-semibold text-foreground">{vista.titulo}</h3>
        <p className="text-sm text-muted-foreground">{vista.detalle}</p>
        <p className="truncate font-mono text-xs text-muted-foreground">{referencia}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {/* Actualizar solo mientras haya algo que esperar: con el cobro ya
            resuelto, el botón invitaría a repetir una consulta que no va a
            cambiar nada. */}
        {vista.esperando && (
          <Button variant="outline" className="min-h-11" disabled={cargando} onClick={onActualizar}>
            <RefreshCw aria-hidden />
            Actualizar
          </Button>
        )}
        <Button variant="ghost" size="icon" className="min-h-11 min-w-11" onClick={onCerrar}>
          <X aria-hidden />
          <span className="sr-only">Cerrar el aviso del pago</span>
        </Button>
      </div>
    </section>
  )
}

interface VistaRetorno {
  titulo: string
  detalle: string
  icono: typeof RefreshCw
  /** Token de color, no un color: el tema decide el valor. */
  tono: "--info" | "--exito" | "--advertencia"
  esperando: boolean
}

function presentacion(estado?: EstadoCobro): VistaRetorno {
  if (estado === "aprobado") {
    return {
      titulo: "Pago confirmado",
      detalle:
        "Tu plan quedó al día y la factura ya está en tu historial. No hace falta que hagas nada más.",
      icono: CheckCircle2,
      tono: "--exito",
      esperando: false,
    }
  }

  // Rechazado, anulado o error: los tres significan lo mismo para quien mira
  // —ese intento no prosperó— y distinguirlos aquí solo serviría para explicarle
  // el vocabulario interno de una pasarela.
  if (estado === "rechazado" || estado === "anulado" || estado === "error") {
    return {
      titulo: "El pago no se completó",
      detalle:
        "Ese intento no prosperó y no se te cobró nada. Puedes generar otro enlace o guardar una tarjeta para que el cobro salga solo.",
      icono: XCircle,
      tono: "--advertencia",
      esperando: false,
    }
  }

  return {
    titulo: "Volviste del pago",
    detalle:
      "Estamos esperando la confirmación de la pasarela. Puede tardar unos minutos y no hace falta pagar otra vez: cuando llegue, tu plan y tus facturas se actualizan solos.",
    icono: RefreshCw,
    tono: "--info",
    esperando: true,
  }
}
