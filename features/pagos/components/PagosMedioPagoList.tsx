import { CalendarClock, CreditCard, Plus } from "lucide-react"
import { PagosMedioPagoCard } from "@features/pagos/components/PagosMedioPagoCard"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { Loadable } from "@shared/components/feedback/Loadable"
import { SinDatos } from "@shared/components/feedback/SinDatos"
import { Button } from "@shared/components/ui/button"
import { useFormato } from "@shared/hooks/useFormato"
import type { ConfiguracionPasarela, MedioPago } from "@features/pagos/types/pagos.types"

interface PagosMedioPagoListProps {
  mediosPago: MedioPago[]
  cargando: boolean
  cargandoAction: boolean
  soloLectura: boolean
  /** `null` mientras carga, o cuando la api dijo que no hay pasarela. */
  configuracion: ConfiguracionPasarela | null
  /** El texto con el que la api explicó por qué no hay con qué tokenizar. */
  errorConfiguracion: string | null
  /** Fin del período vigente: cuándo se intentará el próximo cobro. */
  proximoCobroEn: string | null
  /** `false` con la baja ya pedida: hay fecha, pero no habrá cobro. */
  renovacionActiva: boolean
  onAgregar: () => void
  onRetirar: (medio: MedioPago) => void
}

/**
 * Con qué se le cobra a la barbería su suscripción, y cuándo.
 *
 * Las dos mitades van juntas porque es lo que la persona viene a mirar: una
 * tarjeta sin fecha no dice si urge, y una fecha sin tarjeta no dice si se va a
 * poder cobrar.
 */
export function PagosMedioPagoList({
  mediosPago,
  cargando,
  cargandoAction,
  soloLectura,
  configuracion,
  errorConfiguracion,
  proximoCobroEn,
  renovacionActiva,
  onAgregar,
  onRetirar,
}: PagosMedioPagoListProps) {
  const { fecha } = useFormato()
  // Guardar una tarjeta exige tokenizar en el navegador, y eso es propio de cada
  // pasarela: hoy solo está montado el widget de Wompi.
  const puedeGuardar = configuracion?.proveedor === "wompi"
  const hayConQueCobrar = mediosPago.some(
    (medio) => medio.predeterminado && medio.estado === "activo"
  )

  return (
    <SectionCard
      titulo="Método de pago"
      subtitulo="Con qué se cobra tu suscripción a Barion. El último que guardes es el que cobra."
      accion={
        !soloLectura && puedeGuardar ? (
          <Button size="sm" variant="outline" disabled={cargandoAction} onClick={onAgregar}>
            <Plus aria-hidden />
            Agregar tarjeta
          </Button>
        ) : undefined
      }
    >
      <div className="space-y-4">
        {proximoCobroEn && (
          <p className="inline-flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <CalendarClock className="size-4" aria-hidden />
            {renovacionActiva ? "Se cobrará el" : "Tu acceso termina el"}{" "}
            <strong className="font-medium text-foreground">{fecha(proximoCobroEn)}</strong>
            {!renovacionActiva && <span>— no habrá cobro, la baja ya está pedida</span>}
          </p>
        )}

        {/*
          Un país sin pasarela responde 422 con su propio texto. Se enseña tal
          cual y no se monta el formulario: no hay contra quién tokenizar.
        */}
        {errorConfiguracion && (
          <p className="rounded-lg border border-(--advertencia)/40 bg-[color-mix(in_srgb,var(--advertencia)_8%,transparent)] px-3 py-2 text-xs text-foreground">
            {errorConfiguracion}
          </p>
        )}

        {configuracion && !puedeGuardar && (
          <p className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs text-foreground">
            Tu barbería cobra por {configuracion.proveedor}. Guardar el medio de pago desde aquí
            todavía no está disponible para esa pasarela: escríbenos y lo resolvemos contigo.
          </p>
        )}

        {configuracion?.ambiente === "sandbox" && (
          <p className="rounded-lg border border-(--info)/40 bg-[color-mix(in_srgb,var(--info)_8%,transparent)] px-3 py-2 text-xs text-foreground">
            Pasarela en modo de pruebas: nada de lo que guardes aquí cobra dinero de verdad.
          </p>
        )}

        <Loadable
          loading={cargando}
          variant="list"
          count={2}
          isEmpty={mediosPago.length === 0}
          emptyState={
            <SinDatos
              titulo="No hay con qué cobrar tu suscripción"
              detalle={
                soloLectura
                  ? "Quien administre la barbería puede guardar una tarjeta."
                  : "Guarda una tarjeta antes de la próxima renovación para no perder el acceso."
              }
              icono={CreditCard}
              alto={140}
            />
          }
        >
          <div className="space-y-3">
            {!hayConQueCobrar && (
              <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-foreground">
                Ninguna de estas tarjetas está vigente: la próxima renovación no se va a poder
                cobrar. Guarda otra para sustituirla.
              </p>
            )}
            {mediosPago.map((medio) => (
              <PagosMedioPagoCard
                key={medio.id}
                medio={medio}
                soloLectura={soloLectura}
                cargando={cargandoAction}
                onRetirar={onRetirar}
              />
            ))}
          </div>
        </Loadable>
      </div>
    </SectionCard>
  )
}
