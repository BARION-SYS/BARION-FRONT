"use client"

import { useCallback, useEffect } from "react"
import { CalendarClock, Scissors } from "lucide-react"
import { BarberosJornadaForm } from "@features/barberos/components/BarberosJornadaForm"
import { useBarberos } from "@features/barberos/hooks/useBarberos"
import { ServiciosOfertaForm } from "@features/servicios/components/ServiciosOfertaForm"
import { useServicios } from "@features/servicios/hooks/useServicios"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"
import { SinDatos } from "@shared/components/feedback/SinDatos"
import { notify } from "@shared/services/notify"
import { getErrorMessage } from "@shared/utils/error"
import type { DatosOferta } from "@features/servicios/schemas/servicios.schema"

/**
 * Lo del barbero sobre sí mismo: cuándo trabaja y qué ofrece.
 *
 * ── Por qué existe esta pantalla ────────────────────────────────────────────
 * El rol `barbero` tiene `jornadas.gestionar_propia` y `oferta.gestionar_propia`,
 * y la api se los honra desde siempre. Lo que no había era **dónde ejercerlos**:
 * Personas exige capacidades sobre TODO el equipo, que él no tiene, así que un
 * barbero entraba al panel sin poder declarar su jornada. Y sin jornada no hay
 * cupos — el motor de disponibilidad no tiene de dónde sacarlos, y su agenda se
 * queda vacía para siempre sin que nada falle.
 *
 * ── Un endpoint, dos alcances ───────────────────────────────────────────────
 * No hay rutas nuevas: son las mismas de Personas. Quien gestiona a todo el
 * equipo pasa por `/dashboard/personas`; aquí se entra con la ficha propia, que
 * la api resuelve a partir de la sesión (`GET /barberos/mio`). Por eso esta
 * página no acepta ningún id por la URL: el barbero de esta pantalla es siempre
 * quien la abre.
 *
 * ── Lo que NO está aquí, a propósito ────────────────────────────────────────
 * Ni días especiales ni ausencias. Un día suelto y unas vacaciones son
 * excepciones que alguien aprueba —la ausencia lo dice explícitamente: aprobarla
 * es de quien gestiona—, y mezclarlas con la jornada haría creer que se declaran
 * igual de solas. Se piden por donde se piden hoy.
 */
export default function MiPerfilPage() {
  const {
    miPerfil,
    jornada,
    loadingMiPerfil,
    loadingDisponibilidad,
    loadingAction,
    fetchMiPerfil,
    fetchDisponibilidad,
    handleReplaceJornada,
  } = useBarberos()

  const {
    servicios,
    oferta,
    loadingLista,
    loadingOferta,
    loadingAction: guardandoOferta,
    fetchServicios,
    fetchOferta,
    handleReplaceOferta,
  } = useServicios()

  useEffect(() => {
    void fetchMiPerfil()
    // El catálogo entero: es lo que este barbero PODRÍA ofrecer, y sale de la
    // carta de la barbería, no de él.
    void fetchServicios({ paginar: false, soloActivos: true })
  }, [fetchMiPerfil, fetchServicios])

  // La jornada y la oferta cuelgan del id de la ficha, que no se conoce hasta
  // que la api dice cuál es. Dos efectos y no uno: el primero pregunta quién
  // soy, este pide lo suyo.
  const barberoId = miPerfil?.id ?? null
  useEffect(() => {
    if (!barberoId) return
    void fetchDisponibilidad(barberoId)
    void fetchOferta(barberoId)
  }, [barberoId, fetchDisponibilidad, fetchOferta])

  const guardarJornada = useCallback(
    async (tramos: { diaSemana: number; inicio: string; fin: string }[]) => {
      if (!barberoId) return
      try {
        const mensaje = await handleReplaceJornada(barberoId, { tramos })
        notify.success(mensaje)
      } catch (err) {
        notify.error(getErrorMessage(err))
      }
    },
    [barberoId, handleReplaceJornada]
  )

  const guardarOferta = useCallback(
    async (datos: DatosOferta) => {
      if (!barberoId) return
      try {
        const mensaje = await handleReplaceOferta(barberoId, datos)
        notify.success(mensaje)
      } catch (err) {
        notify.error(getErrorMessage(err))
      }
    },
    [barberoId, handleReplaceOferta]
  )

  if (loadingMiPerfil) {
    return <DataSkeleton variant="form" />
  }

  // Que alguien con permisos de barbero no tenga ficha es raro pero posible —una
  // membresía a la que se le cambió el rol y cuya ficha se desactivó—, y decirlo
  // con palabras vale más que una pantalla vacía que parece rota.
  if (!miPerfil) {
    return (
      <SinDatos
        icono={Scissors}
        titulo="Todavía no atiendes clientes"
        detalle="Tu cuenta no tiene ficha de barbero, así que no hay jornada ni oferta que declarar. Quien administra la barbería puede abrírtela desde Personas."
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionCard
        titulo="Mi jornada"
        subtitulo="Las horas en las que se te pueden reservar citas, en la hora de tu sede"
      >
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
          <CalendarClock className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>
            Sin jornada no hay huecos que ofrecer: tu agenda se ve vacía aunque estés trabajando.
            Guardar sustituye la semana entera, así que quitar un tramo es guardarla sin él.
          </p>
        </div>
        {loadingDisponibilidad ? (
          <DataSkeleton variant="form" />
        ) : (
          <BarberosJornadaForm
            jornada={jornada}
            cargando={loadingAction}
            onSubmit={guardarJornada}
          />
        )}
      </SectionCard>

      <SectionCard titulo="Mi oferta" subtitulo="Qué servicios haces, con tu precio y tu duración">
        {loadingLista || loadingOferta ? (
          <DataSkeleton variant="form" />
        ) : (
          <ServiciosOfertaForm
            servicios={servicios}
            oferta={oferta}
            cargando={guardandoOferta}
            onSubmit={guardarOferta}
          />
        )}
      </SectionCard>
    </div>
  )
}
