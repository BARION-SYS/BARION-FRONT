import { AlertTriangle, CalendarClock, CheckCircle2, CircleSlash, Clock } from "lucide-react"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import { Button } from "@shared/components/ui/button"
import { Progress } from "@shared/components/ui/progress"
import { useFormato } from "@shared/hooks/useFormato"
import type { TonoEstado } from "@shared/types/ui.types"
import type {
  EstadoSuscripcion,
  Suscripcion,
  UsoContraTope,
} from "@features/suscripcion/types/suscripcion.types"

interface SuscripcionResumenProps {
  suscripcion: Suscripcion
  soloLectura: boolean
  cargando: boolean
  onCancelar: () => void
  onReanudar: () => void
}

const presentacion: Record<
  EstadoSuscripcion,
  { etiqueta: string; tono: TonoEstado; icono: typeof Clock }
> = {
  prueba: { etiqueta: "En prueba", tono: "info", icono: Clock },
  activa: { etiqueta: "Al día", tono: "exito", icono: CheckCircle2 },
  mora: { etiqueta: "Pago pendiente", tono: "peligro", icono: AlertTriangle },
  cancelada: { etiqueta: "Cancelada", tono: "neutro", icono: CircleSlash },
  sobre_limite: { etiqueta: "Sobre el límite", tono: "advertencia", icono: AlertTriangle },
}

/**
 * El estado de la cuenta de un vistazo: en qué plan se está, cuánto queda y qué
 * tan cerca está la barbería de sus topes.
 */
export function SuscripcionResumen({
  suscripcion,
  soloLectura,
  cargando,
  onCancelar,
  onReanudar,
}: SuscripcionResumenProps) {
  const { fecha } = useFormato()
  const estado = presentacion[suscripcion.estado]
  const baja = suscripcion.cancelaAlFinPeriodo && !suscripcion.canceladaEn

  return (
    <SectionCard
      titulo={suscripcion.plan.nombre}
      subtitulo={
        suscripcion.estado === "prueba"
          ? "Estás probando Barion. Elige un plan antes de que termine para no perder el acceso."
          : "Tu plan con Barion"
      }
      accion={<StatusBadge etiqueta={estado.etiqueta} tono={estado.tono} icono={estado.icono} />}
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          {suscripcion.vigenteHasta && (
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <CalendarClock className="size-4" aria-hidden />
              {baja ? "Tu acceso termina el" : "Siguiente cobro el"}{" "}
              <strong className="font-medium text-foreground">
                {fecha(suscripcion.vigenteHasta)}
              </strong>
            </span>
          )}
          {suscripcion.diasRestantes !== null && (
            <span className="text-muted-foreground">
              {suscripcion.diasRestantes === 0
                ? "Vence hoy"
                : `Quedan ${suscripcion.diasRestantes} días`}
            </span>
          )}
        </div>

        {/*
          Un impago no se anuncia con un color: dice qué pasa y hasta cuándo hay
          margen. La fecha de corte la escribe el worker, no esta pantalla.
        */}
        {suscripcion.estado === "mora" && (
          <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-foreground">
            Hay un cobro pendiente.
            {suscripcion.graciaHasta
              ? ` Tienes hasta el ${fecha(suscripcion.graciaHasta)} antes de que se corte el acceso.`
              : " Regulariza el pago para no perder el acceso."}
          </p>
        )}

        {suscripcion.estado === "sobre_limite" && (
          <p className="rounded-lg border border-(--advertencia)/40 bg-[color-mix(in_srgb,var(--advertencia)_8%,transparent)] px-3 py-2 text-xs text-foreground">
            Tu plan actual no cubre todo lo que tienes montado. No se desactivó a nadie, pero no
            podrás dar de alta más hasta que lo ajustes o subas de plan.
          </p>
        )}

        {baja && (
          <p className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs text-foreground">
            Tu suscripción no se renovará. Sigues con acceso completo hasta la fecha de arriba.
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Tope titulo="Sedes" uso={suscripcion.uso.sedes} />
          <Tope titulo="Barberos" uso={suscripcion.uso.barberos} />
        </div>

        {!soloLectura && suscripcion.estado !== "cancelada" && (
          <div className="flex justify-end">
            {baja ? (
              <Button variant="outline" size="sm" disabled={cargando} onClick={onReanudar}>
                Volver a renovar
              </Button>
            ) : (
              <Button variant="ghost" size="sm" disabled={cargando} onClick={onCancelar}>
                Dejar de renovar
              </Button>
            )}
          </div>
        )}
      </div>
    </SectionCard>
  )
}

/**
 * Cuánto se ocupa de lo contratado. Sin tope no se pinta barra: una barra sin
 * final no informa de nada y sugiere un límite que no existe.
 */
function Tope({ titulo, uso }: { titulo: string; uso: UsoContraTope }) {
  const porcentaje = uso.limite ? Math.min(100, Math.round((uso.usado / uso.limite) * 100)) : null

  return (
    <div className="space-y-2 rounded-lg border border-border p-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">{titulo}</span>
        <span className="text-sm font-semibold text-foreground">
          {uso.usado}
          {uso.limite !== null && (
            <span className="text-xs font-normal text-muted-foreground"> / {uso.limite}</span>
          )}
        </span>
      </div>
      {porcentaje !== null ? (
        <Progress
          value={porcentaje}
          className={uso.excedido ? "[&>*]:bg-destructive" : undefined}
        />
      ) : (
        <p className="text-xs text-muted-foreground">Sin límite en este plan</p>
      )}
    </div>
  )
}
