"use client"

import { use, useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Plus } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Modal } from "@shared/components/modals/Modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/components/ui/tabs"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"
import { notify } from "@shared/services/notify"
import { getErrorMessage } from "@shared/utils/error"
import { useAuthStore } from "@store/auth.store"
import { puede } from "@features/auth/utils/permisos"
import { useCatalogos } from "@features/catalogos/hooks/useCatalogos"
import { useBarberos } from "@features/barberos/hooks/useBarberos"
import { useServicios } from "@features/servicios/hooks/useServicios"
import { ServiciosOfertaForm } from "@features/servicios/components/ServiciosOfertaForm"
import { BarberosAusenciaForm } from "@features/barberos/components/BarberosAusenciaForm"
import { BarberosAusenciasList } from "@features/barberos/components/BarberosAusenciasList"
import { BarberosDetail } from "@features/barberos/components/BarberosDetail"
import { BarberosExcepcionForm } from "@features/barberos/components/BarberosExcepcionForm"
import { BarberosExcepcionesList } from "@features/barberos/components/BarberosExcepcionesList"
import { BarberosForm } from "@features/barberos/components/BarberosForm"
import { BarberosJornadaForm } from "@features/barberos/components/BarberosJornadaForm"
import { PersonasRetiroDetail } from "@features/personas/components/PersonasRetiroDetail"
import type {
  DatosAusencia,
  DatosBarbero,
  DatosExcepcion,
} from "@features/barberos/schemas/barberos.schema"
import type { DatosOferta } from "@features/servicios/schemas/servicios.schema"
import type {
  Ausencia,
  ExcepcionJornada,
  RetiroBarbero,
} from "@features/barberos/types/barberos.types"

/**
 * Una persona en la agenda: su ficha, cuándo trabaja y qué ofrece.
 *
 * Esto era una segunda LISTA —la pestaña «Atienden»—, y por eso la misma persona
 * aparecía dos veces en el panel: una en Acceso y otra aquí. La lista ahora es
 * una sola, la de Personas, y esta pantalla es el detalle al que se llega desde
 * su fila. Lo que queda aquí es lo que solo tiene sentido de uno en uno: la
 * jornada, los días especiales, las ausencias y la oferta.
 */
export default function PersonaEnAgendaPage({
  params,
}: {
  params: Promise<{ barberoId: string }>
}) {
  const { barberoId } = use(params)

  const {
    barberos,
    jornada,
    ausencias,
    excepciones,
    loadingLista,
    loadingDisponibilidad,
    loadingAction,
    error,
    fetchBarbero,
    fetchDisponibilidad,
    handleUpdateBarbero,
    handleToggleBarbero,
    handleReplaceJornada,
    handleGuardarExcepcion,
    handleEliminarExcepcion,
    handleCreateAusencia,
    handleApproveAusencia,
    handleCancelAusencia,
  } = useBarberos()

  const { catalogos, fetchCatalogos } = useCatalogos()

  /**
   * La oferta es del catálogo, no de personal: el precio es de un SERVICIO. Se
   * edita aquí porque es donde se administra a la persona, y la mutación vive en
   * esta página, que es el padre.
   */
  const {
    servicios,
    oferta,
    loadingOferta,
    loadingAction: guardandoOferta,
    fetchServicios,
    fetchOferta,
    handleReplaceOferta,
  } = useServicios()

  /**
   * Ocultar un botón no es seguridad —la api revalida el permiso en cada
   * petición—, pero evita ofrecer acciones que terminan en 403.
   */
  const sesion = useAuthStore((estado) => estado.sesion)
  const gestiona = puede(sesion, "barberos.gestionar")

  // Estado de UI: vive en el contenedor.
  const [editando, setEditando] = useState(false)
  const [enDisponibilidad, setEnDisponibilidad] = useState(false)
  const [enOferta, setEnOferta] = useState(false)
  const [creandoAusencia, setCreandoAusencia] = useState(false)
  const [excepcionEnEdicion, setExcepcionEnEdicion] = useState<ExcepcionJornada | null>(null)
  const [creandoExcepcion, setCreandoExcepcion] = useState(false)
  /** Lo que quedó colgando al retirarlo: sus citas futuras NO se cancelan. */
  const [retiro, setRetiro] = useState<RetiroBarbero | null>(null)

  const barbero = barberos[0]

  const recargar = useCallback(() => fetchBarbero(barberoId), [fetchBarbero, barberoId])

  useEffect(() => {
    void recargar()
    void fetchDisponibilidad(barberoId)
    void fetchCatalogos()
  }, [recargar, fetchDisponibilidad, fetchCatalogos, barberoId])

  const conAviso = async (accion: () => Promise<string>) => {
    try {
      notify.success(await accion())
      return true
    } catch (err) {
      notify.error(getErrorMessage(err))
      return false
    }
  }

  const onGuardarBarbero = useCallback(
    async (datos: DatosBarbero) => {
      if (await conAviso(() => handleUpdateBarbero(barberoId, datos))) {
        setEditando(false)
        void recargar()
      }
    },
    [barberoId, handleUpdateBarbero, recargar]
  )

  /**
   * Retirar de la agenda o devolver a ella. Al retirar se abre el detalle de lo
   * que quedó comprometido: las citas futuras siguen en pie y hay que avisar a
   * cada cliente uno por uno.
   */
  const onAlternarActivo = useCallback(async () => {
    if (!barbero) return
    try {
      const { mensaje, retiro: resultado } = await handleToggleBarbero(barbero)
      notify.success(mensaje)
      if (resultado) setRetiro(resultado)
      void recargar()
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }, [barbero, handleToggleBarbero, recargar])

  /**
   * El catálogo se pide al abrir la oferta y no al cargar la pantalla: solo hace
   * falta dentro del modal, y traerlo antes sería un viaje por cada visita.
   */
  const abrirOferta = useCallback(() => {
    setEnOferta(true)
    void fetchServicios({ paginar: false, soloActivos: true })
    void fetchOferta(barberoId)
  }, [fetchServicios, fetchOferta, barberoId])

  const onGuardarOferta = useCallback(
    async (datos: DatosOferta) => {
      if (await conAviso(() => handleReplaceOferta(barberoId, datos))) {
        setEnOferta(false)
        // La ficha enseña qué ofrece: cambia con la oferta.
        void recargar()
      }
    },
    [barberoId, handleReplaceOferta, recargar]
  )

  const onGuardarJornada = useCallback(
    async (tramos: { diaSemana: number; inicio: string; fin: string }[]) => {
      await conAviso(() => handleReplaceJornada(barberoId, { tramos }))
    },
    [barberoId, handleReplaceJornada]
  )

  const onGuardarAusencia = useCallback(
    async (datos: DatosAusencia) => {
      if (await conAviso(() => handleCreateAusencia(barberoId, datos))) {
        setCreandoAusencia(false)
        void fetchDisponibilidad(barberoId)
        // La ausencia puede volver "de vacaciones" a la persona: la ficha lo pinta.
        void recargar()
      }
    },
    [barberoId, handleCreateAusencia, fetchDisponibilidad, recargar]
  )

  const onGuardarExcepcion = useCallback(
    async (datos: DatosExcepcion) => {
      if (await conAviso(() => handleGuardarExcepcion(barberoId, datos))) {
        setCreandoExcepcion(false)
        setExcepcionEnEdicion(null)
        void fetchDisponibilidad(barberoId)
      }
    },
    [barberoId, handleGuardarExcepcion, fetchDisponibilidad]
  )

  const onEliminarExcepcion = useCallback(
    async (excepcion: ExcepcionJornada) => {
      if (await conAviso(() => handleEliminarExcepcion(barberoId, excepcion.id))) {
        void fetchDisponibilidad(barberoId)
      }
    },
    [barberoId, handleEliminarExcepcion, fetchDisponibilidad]
  )

  const onAusenciaTocada = useCallback(
    async (accion: () => Promise<string>) => {
      if (await conAviso(accion)) {
        void fetchDisponibilidad(barberoId)
        void recargar()
      }
    },
    [barberoId, fetchDisponibilidad, recargar]
  )

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="self-start"
        render={<Link href="/dashboard/personas" />}
      >
        <ArrowLeft className="size-4" aria-hidden />
        Personas
      </Button>

      {loadingLista && <DataSkeleton variant="card" />}

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {!loadingLista && !error && barbero && (
        <BarberosDetail
          barbero={barbero}
          jornada={jornada}
          gestiona={gestiona}
          onEditar={() => setEditando(true)}
          onDisponibilidad={() => setEnDisponibilidad(true)}
          onOferta={abrirOferta}
          onAlternarActivo={() => void onAlternarActivo()}
        />
      )}

      <Modal
        open={editando}
        onOpenChange={setEditando}
        titulo={barbero?.nombrePublico ?? "Ficha"}
        descripcion="Lo que el cliente ve al reservar, y el acuerdo con el que se liquida."
        size="lg"
      >
        {barbero && (
          <BarberosForm barbero={barbero} cargando={loadingAction} onSubmit={onGuardarBarbero} />
        )}
      </Modal>

      <Modal
        open={retiro !== null}
        onOpenChange={(abierto) => !abierto && setRetiro(null)}
        titulo="Fuera de la agenda"
        descripcion="Ya no recibe reservas. Sus citas futuras siguen en pie: hay que avisar a cada cliente."
        size="lg"
      >
        {retiro && (
          <PersonasRetiroDetail
            nombre={retiro.nombrePublico}
            citasComprometidas={retiro.citasComprometidas}
            citasPendientes={retiro.citasPendientes}
            onCerrar={() => setRetiro(null)}
          />
        )}
      </Modal>

      <Modal
        open={enDisponibilidad}
        onOpenChange={setEnDisponibilidad}
        titulo={`Disponibilidad de ${barbero?.nombrePublico ?? ""}`}
        descripcion="Cuándo atiende y qué días no."
        size="lg"
      >
        <Tabs defaultValue="jornada">
          <TabsList>
            <TabsTrigger value="jornada">Jornada</TabsTrigger>
            <TabsTrigger value="dias-especiales">Días especiales</TabsTrigger>
            <TabsTrigger value="ausencias">Ausencias</TabsTrigger>
          </TabsList>

          <TabsContent value="jornada" className="mt-4">
            <BarberosJornadaForm
              key={`${barberoId}-${jornada?.tramos.length ?? 0}`}
              jornada={jornada}
              cargando={loadingAction || loadingDisponibilidad}
              soloLectura={!gestiona}
              onSubmit={onGuardarJornada}
            />
          </TabsContent>

          <TabsContent value="dias-especiales" className="mt-4 flex flex-col gap-3">
            {gestiona && (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="self-end"
                onClick={() => setCreandoExcepcion(true)}
              >
                <Plus className="size-4" aria-hidden />
                Agregar día especial
              </Button>
            )}

            <BarberosExcepcionesList
              excepciones={excepciones}
              loading={loadingDisponibilidad}
              gestiona={gestiona}
              onEditar={setExcepcionEnEdicion}
              onEliminar={(excepcion) => void onEliminarExcepcion(excepcion)}
            />
          </TabsContent>

          <TabsContent value="ausencias" className="mt-4 flex flex-col gap-3">
            {gestiona && (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="self-end"
                onClick={() => setCreandoAusencia(true)}
              >
                <Plus className="size-4" aria-hidden />
                Programar ausencia
              </Button>
            )}

            <BarberosAusenciasList
              ausencias={ausencias}
              tiposAusencia={catalogos?.tiposAusencia ?? []}
              loading={loadingDisponibilidad}
              gestiona={gestiona}
              onAprobar={(ausencia: Ausencia) =>
                void onAusenciaTocada(() => handleApproveAusencia(barberoId, ausencia.id))
              }
              onCancelar={(ausencia: Ausencia) =>
                void onAusenciaTocada(() => handleCancelAusencia(barberoId, ausencia.id))
              }
            />
          </TabsContent>
        </Tabs>
      </Modal>

      <Modal
        open={enOferta}
        onOpenChange={setEnOferta}
        titulo={`Oferta de ${barbero?.nombrePublico ?? ""}`}
        descripcion="Qué hace, a qué precio y en cuánto tiempo. Es lo que el cliente reserva."
        size="lg"
      >
        <ServiciosOfertaForm
          servicios={servicios}
          oferta={oferta}
          cargando={guardandoOferta || loadingOferta}
          soloLectura={!gestiona}
          onSubmit={onGuardarOferta}
        />
      </Modal>

      <Modal
        open={creandoAusencia}
        onOpenChange={setCreandoAusencia}
        titulo="Programar ausencia"
        descripcion="Bloquea a esta persona en ese rango. No cancela las citas que ya tenía."
      >
        <BarberosAusenciaForm
          tiposAusencia={catalogos?.tiposAusencia ?? []}
          cargando={loadingAction}
          onSubmit={onGuardarAusencia}
        />
      </Modal>

      <Modal
        open={creandoExcepcion || excepcionEnEdicion !== null}
        onOpenChange={(abierto) => {
          if (!abierto) {
            setCreandoExcepcion(false)
            setExcepcionEnEdicion(null)
          }
        }}
        titulo={
          excepcionEnEdicion ? `Día especial del ${excepcionEnEdicion.fecha}` : "Nuevo día especial"
        }
        descripcion="Reemplaza la jornada normal solo ese día."
      >
        <BarberosExcepcionForm
          key={excepcionEnEdicion?.id ?? "nuevo"}
          excepcion={excepcionEnEdicion}
          cargando={loadingAction}
          onSubmit={onGuardarExcepcion}
        />
      </Modal>
    </>
  )
}
