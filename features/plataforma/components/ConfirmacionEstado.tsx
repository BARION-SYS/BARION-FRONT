"use client"

import { ArrowRight } from "lucide-react"
import { Modal } from "@shared/components/modals/Modal"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import { Button } from "@shared/components/ui/button"
import { ESTADO_BARBERIA, MOTIVO_TRANSICION } from "@features/plataforma/utils/inventario"
import type { EstadoBarberia } from "@features/plataforma/types/plataforma.types"

export interface CambioEstadoPendiente {
  nombre: string
  actual: EstadoBarberia
  destino: EstadoBarberia
}

interface ConfirmacionEstadoProps {
  /** `null` = cerrada. */
  cambio: CambioEstadoPendiente | null
  cargando: boolean
  onConfirmar: () => void
  onCerrar: () => void
}

/**
 * La pausa antes de cambiar el estado de una barbería.
 *
 * Presentacional: arma el `Modal` compartido con lo que hay que saber antes de
 * pulsar —de dónde a dónde y qué consecuencia tiene— y devuelve la decisión al
 * padre, que es quien llama a la api y cierra al terminar.
 */
export function ConfirmacionEstado({
  cambio,
  cargando,
  onConfirmar,
  onCerrar,
}: ConfirmacionEstadoProps) {
  const suspende = cambio?.destino === "suspendida"

  return (
    <Modal
      open={cambio !== null}
      onOpenChange={(abierto) => !abierto && onCerrar()}
      titulo={cambio ? `¿Cambiar el estado de ${cambio.nombre}?` : ""}
      size="sm"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onCerrar} disabled={cargando}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant={suspende ? "destructive" : "default"}
            onClick={onConfirmar}
            disabled={cargando}
          >
            {cargando
              ? "Aplicando…"
              : cambio && `Pasar a ${ESTADO_BARBERIA[cambio.destino].etiqueta.toLowerCase()}`}
          </Button>
        </>
      }
    >
      {cambio && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <StatusBadge {...ESTADO_BARBERIA[cambio.actual]} />
            <ArrowRight className="size-4 text-muted-foreground" aria-hidden />
            <StatusBadge {...ESTADO_BARBERIA[cambio.destino]} />
          </div>
          <p className="text-sm text-muted-foreground">
            {MOTIVO_TRANSICION[cambio.destino]}. El cambio se aplica al instante a todo su equipo y
            se puede revertir después.
          </p>
        </div>
      )}
    </Modal>
  )
}
