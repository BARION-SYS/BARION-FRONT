"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { CalendarCheck, Send, UserPlus } from "lucide-react"
import { QrActividadList } from "@features/qr/components/QrActividadList"
import { QrCapacidadesCard } from "@features/qr/components/QrCapacidadesCard"
import { QrCodigoCard } from "@features/qr/components/QrCodigoCard"
import { QrEnlaceCard } from "@features/qr/components/QrEnlaceCard"
import { QrSedesList } from "@features/qr/components/QrSedesList"
import { CAPACIDADES_QR, DIAS_QR, LIMITE_ACTIVIDAD_QR } from "@features/qr/constants/qr"
import { useQr } from "@features/qr/hooks/useQr"
import { enlaceDelCarton } from "@features/qr/utils/enlace"
import { ultimosDias } from "@features/dashboard/utils/serie"
import { puede } from "@features/auth/utils/permisos"
import { StatCard } from "@shared/components/stats/StatCard"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"
import { FuncionDelPlan } from "@shared/components/feedback/FuncionDelPlan"
import { Modal } from "@shared/components/modals/Modal"
import { Button } from "@shared/components/ui/button"
import { useFormato } from "@shared/hooks/useFormato"
import { useOrigen } from "@shared/hooks/useOrigen"
import { useConfiguracion } from "@features/configuracion/hooks/useConfiguracion"
import { notify } from "@shared/services/notify"
import { getErrorMessage } from "@shared/utils/error"
import { useAuthStore } from "@store/auth.store"
import { useSedeActual } from "@store/sede.store"
import type { EnlaceQr } from "@features/qr/types/qr.types"

/**
 * El cartón QR de la barbería y lo que ha traído.
 *
 * ── El enlace es de la SEDE, aunque la ruta sea de la barbería ───────────────
 * El código codifica `/b/{barberia.slug}?qr={sede.slugQr}`: la ruta la resuelve el
 * `slug` de la barbería —es la única que el portal entiende— y `slugQr` es la
 * marca que dice de qué cartón vino. Por eso hay un código por sede y el de aquí
 * es el de la sede activa del panel.
 *
 * ── Lo que se cuenta, y lo que no ───────────────────────────────────────────
 * **No hay escaneos.** Abrir la página del cartón no deja fila y no la va a
 * dejar: contarla exigía una tabla de una escritura por visita y un endpoint
 * público escribible sin sesión, para un número que no distingue a un cliente del
 * dueño enseñando el código. Lo que se mide es lo que el QR CONVIRTIÓ —citas y
 * fichas con `origen = 'qr'`—, que es la pregunta que de verdad se hace el dueño.
 *
 * ── Y por eso el vacío es normal ────────────────────────────────────────────
 * Mientras el portal no marque el origen, todo esto es cero y el feed no tiene
 * entradas. **No es un fallo**, así que la pantalla lo dice con palabras en vez de
 * dejar huecos que se leen como algo roto.
 *
 * ── Rotar el código ─────────────────────────────────────────────────────────
 * Se cambia la marca de la SEDE, y solo eso: los cartones repartidos siguen
 * llevando a la barbería porque la ruta la manda el `slug` de la barbería. Lo que
 * pierden es la atribución. Por eso la confirmación lo dice entero —tranquiliza y
 * advierte— y nada del informe se reinicia: el desglose es por sede, no por código.
 */
export default function QrPage() {
  const {
    barberia,
    resumen,
    actividad,
    loadingQr,
    loadingReportes,
    sinPlanReportes,
    loadingAction,
    fetchBarberiaQr,
    fetchReportesQr,
    handleRotateSlugQr,
  } = useQr()

  // El reenvío del correo que publica la barbería: vive en `configuracion`,
  // que es de quien es la ficha, y aquí se consume su hook.
  const { handleReenviarVerificacion, loadingAction: reenviando } = useConfiguracion()

  const sesion = useAuthStore((estado) => estado.sesion)
  const veReportes = puede(sesion, "reportes.ver")
  // Ocultar el botón no es seguridad —la api revalida—, pero a quien solo mira le
  // evita un 403 sobre una pantalla que sí puede usar.
  const gestionaSedes = puede(sesion, "sedes.gestionar")

  const sedeActual = useSedeActual()
  const { numero, timezone } = useFormato()

  // Estado de UI: confirmación transitoria del copiado.
  const [copiado, setCopiado] = useState(false)
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Estado de UI: la confirmación de rotar el código.
  const [confirmandoRotacion, setConfirmandoRotacion] = useState(false)

  /** El dominio real por el que se entró: es el que se imprime en el cartón. */
  const origen = useOrigen()

  // Sin `sedeId` ni granularidad: estas dos rutas no los aceptan —el QR mezcla
  // citas y fichas de cliente, y la ficha no cuelga de un local—.
  const rango = useMemo(() => {
    const { desde, hasta } = ultimosDias(timezone, DIAS_QR)
    return { desde, hasta }
  }, [timezone])

  useEffect(() => {
    void fetchBarberiaQr()
  }, [fetchBarberiaQr])

  // Las cifras piden `reportes.ver`. Un barbero no lo trae, y pedirlas igual le
  // llenaría de 403 una pantalla cuyo QR sí puede usar.
  useEffect(() => {
    if (!veReportes) return
    void fetchReportesQr(rango, LIMITE_ACTIVIDAD_QR)
  }, [veReportes, rango, fetchReportesQr])

  useEffect(() => {
    return () => {
      if (temporizador.current) clearTimeout(temporizador.current)
    }
  }, [])

  const enlace = useMemo<EnlaceQr | null>(() => {
    if (!origen || !barberia || !sedeActual) return null
    return {
      url: enlaceDelCarton(origen, barberia.slug, sedeActual.slugQr),
      nombreBarberia: barberia.nombreComercial,
      nombreSede: sedeActual.nombre,
      slugQr: sedeActual.slugQr,
    }
  }, [origen, barberia, sedeActual])

  const copiarEnlace = useCallback(() => {
    if (!enlace) return
    navigator.clipboard?.writeText(enlace.url).catch(() => {})
    setCopiado(true)
    if (temporizador.current) clearTimeout(temporizador.current)
    temporizador.current = setTimeout(() => setCopiado(false), 2000)
  }, [enlace])

  /**
   * El código nuevo llega en la respuesta y el hook lo deja en el store de sedes,
   * de donde salen el enlace y el QR: la pantalla se repinta sola, sin recargar
   * ni recomponer nada a mano.
   */
  const rotarCodigoQr = useCallback(async () => {
    if (!sedeActual) return
    try {
      const mensaje = await handleRotateSlugQr(sedeActual.id)
      setConfirmandoRotacion(false)
      notify.success(mensaje)
      // Las cifras no se mueven —lo medido se queda—, pero el desglose enseña el
      // código de cada sede y el de esta acaba de dejar de ser el que muestra.
      if (veReportes) void fetchReportesQr(rango, LIMITE_ACTIVIDAD_QR)
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }, [sedeActual, handleRotateSlugQr, veReportes, fetchReportesQr, rango])

  const periodo = `Últimos ${DIAS_QR} días`

  if (loadingQr && !barberia) {
    return (
      <main className="flex flex-1 flex-col gap-5 overflow-y-auto p-4 md:p-6">
        <DataSkeleton variant="stats" count={2} className="grid-cols-1 sm:grid-cols-2" />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <DataSkeleton variant="card" />
          <DataSkeleton variant="list" count={4} />
        </div>
      </main>
    )
  }

  return (
    // Móvil: scroll de página. lg+: app-like — alto completo, columnas con scroll propio.
    <main className="flex flex-1 flex-col gap-5 overflow-y-auto p-4 md:p-6 lg:overflow-hidden">
      {/*
        El cartón no sirve de nada mientras el escaparate no exista: la
        dirección responde 404 y quien escanea ve una página de error. Va lo
        primero y no como nota al pie, porque el siguiente paso natural de esta
        pantalla es imprimirlo.
      */}
      {barberia && !barberia.verificada && (
        <p
          role="alert"
          className="shrink-0 rounded-xl border border-(--advertencia)/40 bg-[color-mix(in_srgb,var(--advertencia)_8%,transparent)] p-4 text-sm text-muted-foreground"
        >
          <span className="font-medium text-foreground">
            Tu página pública todavía no está publicada.
          </span>{" "}
          Falta abrir el enlace que te mandamos al correo con el que te registraste. Hasta entonces
          este código lleva a una página de error: no lo imprimas ni lo compartas.
          {/* La salida, al lado del problema: sin esto, un correo perdido solo
              se recuperaba tocando la base. */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 flex"
            disabled={reenviando}
            onClick={() => {
              void (async () => {
                try {
                  notify.success(await handleReenviarVerificacion())
                } catch (err) {
                  notify.error(getErrorMessage(err))
                }
              })()
            }}
          >
            <Send className="size-4" aria-hidden />
            Reenviar el correo
          </Button>
        </p>
      )}

      {veReportes && (
        <section aria-label="Lo que ha traído el código QR" className="shrink-0">
          {/* El cartón y su código NO dependen del plan: lo que se cierra son
              las cifras, así que la pantalla sigue sirviendo para imprimirlo. */}
          {sinPlanReportes ? (
            <FuncionDelPlan
              titulo="Las cifras del cartón"
              detalle="Cuántas citas y clientes llegó a traer el QR entra con un plan superior. El código, su descarga y la rotación siguen aquí."
              alto={160}
            />
          ) : loadingReportes && !resumen ? (
            <DataSkeleton variant="stats" count={2} className="grid-cols-1 sm:grid-cols-2" />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Aquí un cero SÍ es un dato: son conteos transaccionales y exactos
                  —«ninguna cita vino del cartón»—, no una historia sin calcular. */}
              <StatCard
                titulo="Citas desde QR"
                valor={numero(resumen?.citasDesdeQr ?? 0)}
                subtitulo={periodo}
                icono={CalendarCheck}
                acento
              />
              <StatCard
                titulo="Registros"
                valor={numero(resumen?.clientesDesdeQr ?? 0)}
                subtitulo={`Fichas nuevas · ${periodo.toLowerCase()}`}
                icono={UserPlus}
              />
            </div>
          )}
        </section>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:min-h-0 lg:flex-1 lg:grid-cols-[380px_minmax(0,1fr)]">
        <div className="scroll-fino flex lg:min-h-0 lg:overflow-y-auto">
          {enlace ? (
            <QrCodigoCard
              nombreBarberia={enlace.nombreBarberia}
              url={enlace.url}
              copiado={copiado}
              onCopiar={copiarEnlace}
            />
          ) : (
            <DataSkeleton variant="card" className="w-full" />
          )}
        </div>

        <div className="scroll-fino space-y-4 lg:min-h-0 lg:overflow-y-auto lg:pr-0.5">
          {enlace && (
            <QrEnlaceCard
              url={enlace.url}
              nombreSede={enlace.nombreSede}
              slugQr={enlace.slugQr}
              copiado={copiado}
              onCopiar={copiarEnlace}
              gestiona={gestionaSedes}
              onRotar={() => setConfirmandoRotacion(true)}
            />
          )}
          <QrCapacidadesCard capacidades={CAPACIDADES_QR} />

          {/* Con una sola sede el desglose repetiría la cifra de arriba. */}
          {veReportes && (resumen?.porSede.length ?? 0) > 1 && (
            <QrSedesList porSede={resumen?.porSede ?? []} sedeActualId={sedeActual?.id ?? null} />
          )}

          {veReportes && <QrActividadList actividad={actividad} loading={loadingReportes} />}
        </div>
      </div>

      {/* Anuncio del copiado para lectores de pantalla */}
      <span aria-live="polite" className="sr-only">
        {copiado ? "Enlace copiado al portapapeles" : ""}
      </span>

      {/*
        La consecuencia se cuenta entera: lo que sigue funcionando, lo que se
        pierde y lo que hay que hacer. Media verdad aquí asusta de más («¿mato los
        cartones?») o de menos («¿por qué dejó de contar?»).
      */}
      <Modal
        open={confirmandoRotacion}
        onOpenChange={(abierto) => !abierto && setConfirmandoRotacion(false)}
        titulo="Generar un código nuevo"
        descripcion={`El cartón de ${enlace?.nombreSede ?? "esta sede"} pasará a llevar otro código.`}
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmandoRotacion(false)}
              disabled={loadingAction}
            >
              Cancelar
            </Button>
            <Button size="sm" onClick={() => void rotarCodigoQr()} disabled={loadingAction}>
              Generar código nuevo
            </Button>
          </>
        }
      >
        <div className="space-y-2.5 text-sm text-muted-foreground">
          <p>
            Los cartones que ya imprimiste{" "}
            <span className="font-medium text-foreground">siguen funcionando</span>: quien los
            escanee llega igual a tu barbería y puede reservar.
          </p>
          <p>
            Lo único que pierden es la atribución: sus citas dejarán de contarse como venidas del QR
            y pasarán a contar como llegadas por enlace.
          </p>
          <p>Para volver a medir esta sede hay que reimprimir el cartón con el código nuevo.</p>
          <p>
            Lo que ya se midió no se toca: el informe conserva las citas que el cartón trajo hasta
            ahora.
          </p>
        </div>
      </Modal>
    </main>
  )
}
