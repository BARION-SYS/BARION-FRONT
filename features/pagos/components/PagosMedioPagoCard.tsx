import { AlertTriangle, CreditCard, Trash2 } from "lucide-react"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import { Button } from "@shared/components/ui/button"
import type { TonoEstado } from "@shared/types/ui.types"
import type { EstadoMedioPago, MedioPago } from "@features/pagos/types/pagos.types"
import { useTextos } from "@shared/textos/useTextos"

interface PagosMedioPagoCardProps {
  medio: MedioPago
  soloLectura: boolean
  cargando: boolean
  onRetirar: (medio: MedioPago) => void
}

/**
 * El tono de cada estado del medio de pago. Su nombre, y el del tipo, salen del
 * catálogo dentro del componente: aquí no alcanza ningún hook.
 */
const TONO_POR_ESTADO: Record<EstadoMedioPago, TonoEstado> = {
  activo: "exito",
  invalido: "peligro",
}

/**
 * Una tarjeta guardada.
 *
 * Una `invalido` se lista igual que una vigente —hay que verla para poder
 * sustituirla— y se puede retirar. No hay botón de «marcar como principal»: el
 * último medio guardado es el que cobra, y para cambiar de tarjeta se guarda
 * otra.
 */
export function PagosMedioPagoCard({
  medio,
  soloLectura,
  cargando,
  onRetirar,
}: PagosMedioPagoCardProps) {
  const t = useTextos("pagos.medio")
  const estado = {
    etiqueta: t(`estados.${medio.estado}`),
    tono: TONO_POR_ESTADO[medio.estado],
  }
  const vence =
    medio.expiraMes !== null && medio.expiraAnio !== null
      ? `${String(medio.expiraMes).padStart(2, "0")}/${medio.expiraAnio}`
      : null

  return (
    <div className="flex flex-wrap items-start gap-3 rounded-lg border border-border p-3">
      <CreditCard className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-medium text-foreground">
            {medio.marca ?? t(`tipos.${medio.tipo}`)}
            {medio.ultimos4 && (
              <span className="text-muted-foreground"> •••• {medio.ultimos4}</span>
            )}
          </span>
          <StatusBadge etiqueta={estado.etiqueta} tono={estado.tono} />
          {medio.predeterminado && <StatusBadge etiqueta={t("predeterminado")} tono="primario" />}
        </div>

        {vence && <p className="text-xs text-muted-foreground">Vence {vence}</p>}

        {/*
          El rechazo se enseña con las palabras del proveedor, sin traducir ni
          interpretar: es lo único que explica por qué no se pudo cobrar.
        */}
        {medio.ultimoError && (
          <p className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-2 py-1.5 text-xs text-foreground">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-destructive" aria-hidden />
            <span className="min-w-0 break-words">{medio.ultimoError}</span>
          </p>
        )}
      </div>

      {!soloLectura && (
        <Button
          variant="ghost"
          size="icon"
          disabled={cargando}
          onClick={() => onRetirar(medio)}
          aria-label={`Retirar la tarjeta terminada en ${medio.ultimos4 ?? "sin dígitos"}`}
        >
          <Trash2 aria-hidden />
        </Button>
      )}
    </div>
  )
}
