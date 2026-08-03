"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { CalendarCheck, UserPlus } from "lucide-react"
import { QrActividadList } from "@features/qr/components/QrActividadList"
import { QrCapacidadesCard } from "@features/qr/components/QrCapacidadesCard"
import { QrCodigoCard } from "@features/qr/components/QrCodigoCard"
import { QrEnlaceCard } from "@features/qr/components/QrEnlaceCard"
import { QrSedesList } from "@features/qr/components/QrSedesList"
import { CAPACIDADES_QR, DIAS_QR, LIMITE_ACTIVIDAD_QR } from "@features/qr/constants/qr"
import { useQr } from "@features/qr/hooks/useQr"
import { enlaceDelCarton } from "@features/qr/utils/enlace"
import { ultimosDiasInstantes } from "@features/dashboard/utils/serie"
import { puede } from "@features/auth/utils/permisos"
import { StatCard } from "@shared/components/stats/StatCard"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"
import { useFormato } from "@shared/hooks/useFormato"
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
 */
export default function QrPage() {
  const {
    barberia,
    resumen,
    actividad,
    loadingQr,
    loadingReportes,
    fetchBarberiaQr,
    fetchReportesQr,
  } = useQr()

  const sesion = useAuthStore((estado) => estado.sesion)
  const veReportes = puede(sesion, "reportes.ver")

  const sedeActual = useSedeActual()
  const { numero, timezone } = useFormato()

  // Estado de UI: confirmación transitoria del copiado.
  const [copiado, setCopiado] = useState(false)
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null)

  /**
   * El origen del portal, resuelto en el navegador. Va en estado y no calculado
   * al vuelo porque en el servidor no existe: pintarlo directo dejaría el primer
   * render con una dirección distinta a la del cliente.
   */
  const [origen, setOrigen] = useState("")
  useEffect(() => {
    setOrigen(window.location.origin)
  }, [])

  const rango = useMemo(() => ultimosDiasInstantes(timezone, DIAS_QR), [timezone])

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
    }
  }, [origen, barberia, sedeActual])

  const copiarEnlace = useCallback(() => {
    if (!enlace) return
    navigator.clipboard?.writeText(enlace.url).catch(() => {})
    setCopiado(true)
    if (temporizador.current) clearTimeout(temporizador.current)
    temporizador.current = setTimeout(() => setCopiado(false), 2000)
  }, [enlace])

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
      {veReportes && (
        <section aria-label="Lo que ha traído el código QR" className="shrink-0">
          {loadingReportes && !resumen ? (
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
              copiado={copiado}
              onCopiar={copiarEnlace}
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
    </main>
  )
}
