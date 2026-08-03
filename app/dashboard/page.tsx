"use client"

import { useEffect, useMemo } from "react"
import { CalendarDays, CheckCircle2, Coins, DollarSign, Gift, UserPlus } from "lucide-react"
import { DashboardBarberosCard } from "@features/dashboard/components/DashboardBarberosCard"
import { DashboardCitasCard } from "@features/dashboard/components/DashboardCitasCard"
import { DashboardIngresosChart } from "@features/dashboard/components/DashboardIngresosChart"
import { DashboardMetaChart } from "@features/dashboard/components/DashboardMetaChart"
import { DashboardServiciosCard } from "@features/dashboard/components/DashboardServiciosCard"
import { useDashboard } from "@features/dashboard/hooks/useDashboard"
import {
  anioEnCurso,
  aPuntosGrafica,
  rangoDeHoy,
  ultimosDias,
} from "@features/dashboard/utils/serie"
import { useCitas } from "@features/citas/hooks/useCitas"
import { useNomina } from "@features/nomina/hooks/useNomina"
import { PrimerosPasosList } from "@features/primeros-pasos/components/PrimerosPasosList"
import { usePrimerosPasos } from "@features/primeros-pasos/hooks/usePrimerosPasos"
import { pasosDeSesion, todoHecho } from "@features/primeros-pasos/utils/pasos"
import { puede } from "@features/auth/utils/permisos"
import { StatCard } from "@shared/components/stats/StatCard"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"
import { useFormato } from "@shared/hooks/useFormato"
import { useAuthStore } from "@store/auth.store"
import { useSedeActual } from "@store/sede.store"

/**
 * El resumen del negocio.
 *
 * Cuatro cosas que esta pantalla da por buenas porque las decide la api:
 *
 * - **Hoy y la tendencia salen de sitios distintos.** Lo de hoy es
 *   transaccional y siempre está al día; la tendencia la materializa un job
 *   nocturno del worker que **todavía no existe**, así que llega con
 *   `disponible: false` y aquí se dice "aún no se sabe" en vez de pintar ceros.
 * - **La producción por barbero sale del ledger** (`/ganancias/resumen`), no del
 *   agregado: es transaccional y responde hoy mismo.
 * - **La api entrega números crudos.** El título, el ícono y la unidad los pone
 *   esta pantalla.
 * - **Un endpoint, dos alcances.** Con `agenda.ver_propia` y
 *   `ganancias.ver_propias` la api ya devuelve solo lo del barbero, así que esta
 *   MISMA pantalla es su resumen del día. Lo único que cambia es que **no pide
 *   lo que su sesión no puede ver**: `reportes.ver` no está en el rol `barbero`,
 *   y pedirlo igual llenaría su pantalla de aterrizaje de errores 403.
 *
 * Encima de todo eso —y solo mientras haga falta— va la lista de primeros pasos:
 * quien termina `/registro` aterriza aquí con una barbería vacía y sin alta
 * asistida que lo guíe. Se retira sola en cuanto no queda nada pendiente.
 */
export default function DashboardPage() {
  const { pulso, serie, metas, loadingPulso, error, fetchPulso, fetchSerie, fetchMetas } =
    useDashboard()
  const { citas, fetchCitas } = useCitas()
  const { resumen, fetchResumen } = useNomina()
  const { progreso, fetchProgreso } = usePrimerosPasos()

  const sesion = useAuthStore((estado) => estado.sesion)
  const veReportes = puede(sesion, "reportes.ver")
  const leeBarberos = puede(sesion, "barberos.ver")
  const leeCatalogo = puede(sesion, "catalogo.ver")
  // Esta pantalla se abre con `reportes.ver` O con `agenda.ver_propia`, así que
  // ninguna de sus tres fuentes se puede dar por hecha. El caso real no es el
  // barbero —que trae las dos de abajo— sino el administrador al que le
  // revocaron una capacidad persona a persona: sin esto, aterriza en el panel
  // con dos 403 en la consola.
  const veAgenda = puede(sesion, "agenda.ver") || puede(sesion, "agenda.ver_propia")
  const veGanancias = puede(sesion, "ganancias.ver") || puede(sesion, "ganancias.ver_propias")

  // Los pasos que esta sesión puede EJECUTAR. Un barbero no gestiona sedes, ni
  // personas, ni el catálogo: se queda sin ninguno y la lista no aparece.
  const pasos = useMemo(() => pasosDeSesion(sesion), [sesion])

  const sedeActual = useSedeActual()
  const { dinero, numero, timezone, fecha, fechaCorta } = useFormato()

  const hoy = useMemo(() => rangoDeHoy(timezone), [timezone])
  const ultimoMes = useMemo(() => ultimosDias(timezone, 30, "dia"), [timezone])
  const anio = useMemo(() => anioEnCurso(timezone), [timezone])

  useEffect(() => {
    // La agenda de hoy y lo que se lleva ganado — la api acota ambas por
    // `*_propia` cuando toca, pero cada una detrás de SU capacidad.
    if (veAgenda) void fetchCitas({ ...hoy, sedeId: sedeActual?.id })
    if (veGanancias) void fetchResumen(hoy)

    if (!veReportes) return

    void fetchPulso({ ...hoy, sedeId: sedeActual?.id })
    void fetchSerie({ ...ultimoMes, sedeId: sedeActual?.id })
    void fetchMetas({ sedeId: sedeActual?.id, vigentesEn: anio.hasta })
  }, [
    fetchPulso,
    fetchCitas,
    fetchResumen,
    fetchSerie,
    fetchMetas,
    veReportes,
    veAgenda,
    veGanancias,
    hoy,
    ultimoMes,
    anio.hasta,
    sedeActual?.id,
  ])

  // El alta guiada solo se comprueba si hay algún paso que ofrecer, y solo pide
  // lo que esta sesión puede leer: pedir el resto sería un 403 seguro.
  //
  // Espera a que el `Navbar` haya cargado las sedes —toda barbería nace con una,
  // la crea el alta— en lugar de arrancar con `null` y repetirlo todo un tick
  // después: dos rondas de peticiones por cada entrada al panel.
  useEffect(() => {
    if (pasos.length === 0 || !sedeActual) return
    void fetchProgreso({ sede: sedeActual, leeBarberos, leeCatalogo })
  }, [pasos.length, sedeActual, leeBarberos, leeCatalogo, fetchProgreso])

  const puntos = useMemo(
    () => aPuntosGrafica(serie.puntos, (periodo) => fechaCorta(`${periodo}T12:00:00Z`), metas),
    [serie.puntos, metas, fechaCorta]
  )

  // Con `ganancias.ver_propias` el resumen trae UNA fila: la suya.
  const propio = resumen[0] ?? null

  if (loadingPulso && !pulso) {
    return (
      <main className="flex-1 space-y-6 overflow-y-auto p-4 md:p-6">
        <DataSkeleton
          variant="stats"
          count={6}
          className="grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
        />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <DataSkeleton variant="chart" className="xl:col-span-2" />
          <DataSkeleton variant="chart" />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <DataSkeleton variant="list" count={5} className="lg:col-span-3" />
          <DataSkeleton variant="card" count={2} className="flex flex-col gap-4 lg:col-span-2" />
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 space-y-6 overflow-y-auto p-4 md:p-6">
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {/* Lo primero que se ve mientras el alta no esté terminada, y nada en
          cuanto lo esté: el `null` de `progreso` es "todavía no se sabe", así
          que una barbería ya montada nunca lo ve aparecer y desaparecer. */}
      {progreso && !todoHecho(pasos, progreso) && (
        <PrimerosPasosList pasos={pasos} progreso={progreso} />
      )}

      <section aria-label="Indicadores de hoy">
        {veReportes ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard
              titulo="Citas hoy"
              valor={numero(pulso?.citas.total ?? 0)}
              icono={CalendarDays}
              subtitulo={fecha(new Date())}
            />
            <StatCard
              titulo="Completadas"
              valor={numero(pulso?.citas.completadas ?? 0)}
              icono={CheckCircle2}
              subtitulo={`${numero(pulso?.citas.canceladas ?? 0)} canceladas`}
            />
            <StatCard
              titulo="Ingresos"
              valor={dinero(Number(pulso?.ingresosCentavos ?? 0))}
              icono={DollarSign}
              acento
              subtitulo="Solo lo completado"
            />
            <StatCard
              titulo="Ticket promedio"
              valor={dinero(Number(pulso?.ticketPromedioCentavos ?? 0))}
              icono={Coins}
              subtitulo="Por cita cerrada"
            />
            <StatCard
              titulo="Propinas"
              valor={dinero(Number(pulso?.propinasCentavos ?? 0))}
              icono={Gift}
              subtitulo="Van al barbero"
            />
            <StatCard
              titulo="Clientes nuevos"
              valor={numero(pulso?.clientesNuevos ?? 0)}
              icono={UserPlus}
              subtitulo="Fichas creadas hoy"
            />
          </div>
        ) : (
          // Lo mismo, pero de lo suyo: la api ya acotó ambas lecturas por
          // `*_propia`, así que estas cifras SON las de quien mira.
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              titulo="Mis citas hoy"
              valor={numero(citas.length)}
              icono={CalendarDays}
              subtitulo={fecha(new Date())}
            />
            <StatCard
              titulo="Completadas"
              valor={numero(citas.filter((cita) => cita.estado === "completada").length)}
              icono={CheckCircle2}
              subtitulo="De las de hoy"
            />
            <StatCard
              titulo="Llevo ganado"
              valor={dinero(Number(propio?.totalCentavos ?? 0))}
              icono={DollarSign}
              acento
              subtitulo="Comisión + propinas de hoy"
            />
            <StatCard
              titulo="Propinas"
              valor={dinero(Number(propio?.propinasCentavos ?? 0))}
              icono={Gift}
              subtitulo="Íntegras para ti"
            />
          </div>
        )}
      </section>

      {/* La tendencia y el ranking son de quien lee reportes. Al barbero no se
          le ocultan por sensibles: es que su api no se los daría. */}
      {veReportes && (
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-3" aria-label="Ingresos">
          <div className="xl:col-span-2">
            <DashboardIngresosChart
              datos={puntos}
              subtitulo="Últimos 30 días"
              disponible={serie.disponible}
            />
          </div>
          <DashboardMetaChart
            datos={puntos}
            disponible={serie.disponible}
            hayMetas={metas.length > 0}
          />
        </section>
      )}

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-5" aria-label="Actividad">
        <div className={veReportes ? "lg:col-span-3" : "lg:col-span-5"}>
          <DashboardCitasCard citas={citas} />
        </div>
        {veReportes && (
          <div className="flex flex-col gap-4 lg:col-span-2">
            <DashboardBarberosCard filas={resumen} subtitulo="Hoy" />
            <DashboardServiciosCard servicios={pulso?.serviciosTop ?? []} subtitulo="Hoy" />
          </div>
        )}
      </section>
    </main>
  )
}
