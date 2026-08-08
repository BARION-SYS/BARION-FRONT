"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Modal } from "@shared/components/modals/Modal"
import { notify } from "@shared/services/notify"
import { getErrorMessage } from "@shared/utils/error"
import { useAuthStore } from "@store/auth.store"
import { puede } from "@features/auth/utils/permisos"
import { useFormato } from "@shared/hooks/useFormato"
import { useSedeActual } from "@store/sede.store"
import { useBarberos } from "@features/barberos/hooks/useBarberos"
import { useCitas } from "@features/citas/hooks/useCitas"
import { useClientes } from "@features/clientes/hooks/useClientes"
import { useServicios } from "@features/servicios/hooks/useServicios"
import { CitasDetail } from "@features/citas/components/CitasDetail"
import { CitasForm } from "@features/citas/components/CitasForm"
import { CitasList } from "@features/citas/components/CitasList"
import { CitasToolbar } from "@features/citas/components/CitasToolbar"
import { GrillaSemana } from "@features/citas/components/GrillaSemana"
import { hoyLocal, semanaDe, sumarDias, ventanaDe } from "@features/citas/utils/semana"
import type { DatosCita } from "@features/citas/schemas/citas.schema"
import type { Cita, EstadoCita, VistaCalendario } from "@features/citas/types/citas.types"

/**
 * La agenda.
 *
 * Tres cosas que esta pantalla da por buenas porque las decide la api:
 *
 * - **La disponibilidad propone, no aparta.** Un 409 al reservar significa que
 *   alguien se adelantó: se vuelve a consultar, no se reintenta.
 * - **Las transiciones las valida la api.** Aquí solo se ofrecen los saltos
 *   probables, para no enseñar botones que van a devolver 422.
 * - **Precio y duración quedan congelados** en la cita: lo que se pinta no es el
 *   catálogo de hoy.
 *
 * Y un endpoint, dos alcances: con `agenda.ver_propia` la api ya devuelve solo
 * las citas de ese barbero. Aquí no hay nada que filtrar.
 */
export default function CitasPage() {
  const {
    citas,
    disponibilidad,
    historial,
    loadingLista,
    loadingDisponibilidad,
    loadingAction,
    error,
    fetchCitas,
    fetchDisponibilidad,
    limpiarDisponibilidad,
    fetchHistorial,
    handleCreateCita,
    handleReprogramarCita,
    handleCambiarEstadoCita,
  } = useCitas()

  const { barberos, miPerfil, fetchBarberos, fetchMiPerfil } = useBarberos()
  const { clientes, fetchClientes } = useClientes()
  const { oferta, fetchOferta } = useServicios()

  const sesion = useAuthStore((estado) => estado.sesion)
  const gestiona = puede(sesion, "agenda.gestionar") || puede(sesion, "agenda.gestionar_propia")
  // El equipo entero es de `barberos.ver`. El barbero no lo trae, y pedirlo
  // igual devolvería 403 en cada entrada a la agenda.
  const veEquipo = puede(sesion, "barberos.ver")
  const sedeActual = useSedeActual()
  const { timezone } = useFormato()

  // Estado de UI: vive en el contenedor.
  const [vista, setVista] = useState<VistaCalendario>("semana")
  const [ancla, setAncla] = useState(() => hoyLocal(timezone))
  const [barberoId, setBarberoId] = useState("")
  const [estado, setEstado] = useState("")
  const [seleccionada, setSeleccionada] = useState<Cita | null>(null)
  const [creando, setCreando] = useState(false)
  const [reprogramando, setReprogramando] = useState<Cita | null>(null)

  const hoy = hoyLocal(timezone)

  // La semana empieza donde diga la sede: verla arrancar en domingo desorienta
  // a quien lleva veinte años mirándola empezar en lunes.
  const fechas = useMemo(
    () => (vista === "dia" ? [ancla] : semanaDe(ancla, sedeActual?.inicioSemana ?? 1)),
    [vista, ancla, sedeActual?.inicioSemana]
  )

  const cargar = useCallback(() => {
    void fetchCitas({
      ...ventanaDe(fechas),
      sedeId: sedeActual?.id,
      barberoId: barberoId || undefined,
      estado: (estado || undefined) as EstadoCita | undefined,
    })
  }, [fetchCitas, fechas, sedeActual?.id, barberoId, estado])

  useEffect(() => {
    cargar()
  }, [cargar])

  // Quién puede aparecer en el filtro y en el formulario. Con `barberos.ver`, el
  // equipo; sin él, la ficha propia —`GET /barberos/mio`, que la api resuelve
  // desde la sesión—, que es exactamente a quien ese barbero puede agendar.
  useEffect(() => {
    if (veEquipo) void fetchBarberos({ sedeId: sedeActual?.id, soloActivos: true })
    else void fetchMiPerfil()
  }, [veEquipo, fetchBarberos, fetchMiPerfil, sedeActual?.id])

  const agendables = useMemo(
    () => (veEquipo ? barberos : miPerfil ? [miPerfil] : []),
    [veEquipo, barberos, miPerfil]
  )

  useEffect(() => {
    if (seleccionada) void fetchHistorial(seleccionada.id)
  }, [seleccionada?.id, fetchHistorial]) // eslint-disable-line react-hooks/exhaustive-deps

  const conAviso = async (accion: () => Promise<string>) => {
    try {
      notify.success(await accion())
      return true
    } catch (err) {
      notify.error(getErrorMessage(err))
      return false
    }
  }

  const onConsultar = useCallback(
    (params: { barberoId: string; ofertaIds: string[]; desde: string }) => {
      if (!sedeActual) return
      void fetchDisponibilidad({ sedeId: sedeActual.id, dias: 1, ...params })
    },
    [fetchDisponibilidad, sedeActual]
  )

  // Los clientes se piden al abrir el formulario y no al cargar la agenda: solo
  // hacen falta dentro, y son una lista que crece sin techo.
  const abrirFormulario = useCallback(
    (cita: Cita | null) => {
      limpiarDisponibilidad()
      void fetchClientes({ paginar: false })
      if (cita) setReprogramando(cita)
      else setCreando(true)
    },
    [limpiarDisponibilidad, fetchClientes]
  )

  const onCrear = useCallback(
    async (datos: DatosCita) => {
      try {
        notify.success(await handleCreateCita(datos))
        setCreando(false)
        cargar()
      } catch (err) {
        // 409 = ese hueco se lo llevó otro. Se vuelve a preguntar en vez de
        // reintentar a ciegas: la franja elegida ya no existe.
        notify.error(getErrorMessage(err))
        onConsultar({
          barberoId: datos.barberoId,
          ofertaIds: datos.ofertaIds,
          desde: datos.iniciaEn.slice(0, 10),
        })
      }
    },
    [handleCreateCita, cargar, onConsultar]
  )

  const onEstado = useCallback(
    async (destino: EstadoCita) => {
      if (!seleccionada) return
      const movida = await conAviso(() =>
        handleCambiarEstadoCita(seleccionada.id, { estado: destino })
      )
      if (movida) {
        setSeleccionada(null)
        cargar()
      }
    },
    [seleccionada, handleCambiarEstadoCita, cargar]
  )

  const onReprogramar = useCallback(
    async (datos: DatosCita) => {
      if (!reprogramando) return
      const movida = await conAviso(() =>
        handleReprogramarCita(reprogramando.id, {
          iniciaEn: datos.iniciaEn,
          barberoId: datos.barberoId,
        })
      )
      if (movida) {
        setReprogramando(null)
        setSeleccionada(null)
        cargar()
      }
    },
    [reprogramando, handleReprogramarCita, cargar]
  )

  return (
    <main className="scroll-fino flex flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6">
      <CitasToolbar
        vista={vista}
        fechas={fechas}
        barberoId={barberoId}
        estado={estado}
        barberos={agendables}
        gestiona={gestiona}
        onVista={setVista}
        onMover={(dias) =>
          setAncla((previa) => sumarDias(previa, vista === "dia" ? dias : dias * 7))
        }
        onHoy={() => setAncla(hoy)}
        onBarbero={setBarberoId}
        onEstado={setEstado}
        onNueva={() => abrirFormulario(null)}
      />

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {vista === "lista" ? (
        <CitasList citas={citas} loading={loadingLista} onSeleccionar={setSeleccionada} />
      ) : (
        <GrillaSemana fechas={fechas} citas={citas} hoy={hoy} onSeleccionar={setSeleccionada} />
      )}

      <Modal
        open={seleccionada !== null}
        onOpenChange={(abierto) => !abierto && setSeleccionada(null)}
        titulo="Cita"
        descripcion="Lo que se cobró queda congelado: no cambia aunque cambie la tarifa."
        size="lg"
      >
        {seleccionada && (
          <CitasDetail
            cita={seleccionada}
            historial={historial}
            gestiona={gestiona}
            cargando={loadingAction}
            onEstado={(destino) => void onEstado(destino)}
            onReprogramar={() => abrirFormulario(seleccionada)}
          />
        )}
      </Modal>

      <Modal
        open={creando || reprogramando !== null}
        onOpenChange={(abierto) => {
          if (!abierto) {
            setCreando(false)
            setReprogramando(null)
          }
        }}
        titulo={reprogramando ? "Mover la cita" : "Nueva cita"}
        descripcion={
          reprogramando
            ? "Vuelve a quedar sin confirmar: lo que el cliente confirmó era la otra hora."
            : "Las horas que se ofrecen están libres ahora; no quedan apartadas hasta reservar."
        }
        size="lg"
      >
        {sedeActual && (
          <CitasForm
            key={reprogramando?.id ?? "nueva"}
            sedeId={sedeActual.id}
            clientes={clientes}
            barberos={agendables}
            oferta={oferta}
            disponibilidad={disponibilidad}
            cargandoDisponibilidad={loadingDisponibilidad}
            cargando={loadingAction}
            onBarbero={(id) => void fetchOferta(id)}
            onConsultar={onConsultar}
            onSubmit={reprogramando ? onReprogramar : onCrear}
          />
        )}
      </Modal>
    </main>
  )
}
