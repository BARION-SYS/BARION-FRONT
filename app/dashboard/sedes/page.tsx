"use client"

import { useCallback, useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { Modal } from "@shared/components/modals/Modal"
import { Button } from "@shared/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/components/ui/tabs"
import { notify } from "@shared/services/notify"
import { getErrorMessage } from "@shared/utils/error"
import { useAuthStore } from "@store/auth.store"
import { puede } from "@features/auth/utils/permisos"
import { useSedes } from "@features/sedes/hooks/useSedes"
import { SedesCierreForm } from "@features/sedes/components/SedesCierreForm"
import { SedesCierresList } from "@features/sedes/components/SedesCierresList"
import { SedesForm } from "@features/sedes/components/SedesForm"
import { SedesHorarioForm } from "@features/sedes/components/SedesHorarioForm"
import { SedesList } from "@features/sedes/components/SedesList"
import type { DatosCierre, DatosSede } from "@features/sedes/schemas/sedes.schema"
import type { Cierre, Sede } from "@features/sedes/types/sedes.types"

/**
 * Las sedes de la barbería y el calendario de cada una.
 *
 * El calendario vive aquí y no en Configuración porque no es de la barbería: el
 * horario y los cierres son de la SEDE, y una cadena que abre en dos ciudades
 * tiene dos semanas distintas que no se pueden editar en un único formulario.
 */
export default function SedesPage() {
  const {
    sedes,
    horario,
    cierres,
    loadingLista,
    loadingCalendario,
    loadingAction,
    fetchSedes,
    fetchCalendario,
    handleCreateSede,
    handleUpdateSede,
    handleToggleSede,
    handleReplaceHorario,
    handleCreateCierre,
    handleUpdateCierre,
    handleCancelCierre,
  } = useSedes()

  /**
   * Ocultar un botón no es seguridad —la api revalida el permiso en cada
   * petición—, pero evita ofrecer acciones que terminan en un 403: un
   * administrador con `sedes.ver` y sin `sedes.gestionar` entra aquí a consultar, no a configurar.
   */
  const sesion = useAuthStore((estado) => estado.sesion)
  const gestiona = puede(sesion, "sedes.gestionar")

  // Estado de UI: vive en el contenedor.
  const [creandoSede, setCreandoSede] = useState(false)
  const [sedeEnEdicion, setSedeEnEdicion] = useState<Sede | null>(null)
  const [sedeEnCalendario, setSedeEnCalendario] = useState<Sede | null>(null)
  const [cierreEnEdicion, setCierreEnEdicion] = useState<Cierre | null>(null)
  const [creandoCierre, setCreandoCierre] = useState(false)

  useEffect(() => {
    void fetchSedes()
  }, [fetchSedes])

  const conAviso = async (accion: () => Promise<string>) => {
    try {
      notify.success(await accion())
      return true
    } catch (err) {
      notify.error(getErrorMessage(err))
      return false
    }
  }

  const onGuardarSede = useCallback(
    async (datos: DatosSede) => {
      const guardada = sedeEnEdicion
        ? await conAviso(() => handleUpdateSede(sedeEnEdicion.id, datos))
        : await conAviso(() => handleCreateSede(datos))

      if (guardada) {
        setSedeEnEdicion(null)
        setCreandoSede(false)
        void fetchSedes()
      }
    },
    [sedeEnEdicion, handleUpdateSede, handleCreateSede, fetchSedes]
  )

  const onAlternarActiva = useCallback(
    async (sede: Sede) => {
      if (await conAviso(() => handleToggleSede(sede))) void fetchSedes()
    },
    [handleToggleSede, fetchSedes]
  )

  const abrirCalendario = useCallback(
    (sede: Sede) => {
      setSedeEnCalendario(sede)
      void fetchCalendario(sede.id)
    },
    [fetchCalendario]
  )

  const onGuardarHorario = useCallback(
    async (tramos: { diaSemana: number; abre: string; cierra: string }[]) => {
      if (!sedeEnCalendario) return
      await conAviso(() => handleReplaceHorario(sedeEnCalendario.id, { tramos }))
    },
    [sedeEnCalendario, handleReplaceHorario]
  )

  const onGuardarCierre = useCallback(
    async (datos: DatosCierre) => {
      if (!sedeEnCalendario) return
      const guardado = cierreEnEdicion
        ? await conAviso(() => handleUpdateCierre(sedeEnCalendario.id, cierreEnEdicion.id, datos))
        : await conAviso(() => handleCreateCierre(sedeEnCalendario.id, datos))

      if (guardado) {
        setCierreEnEdicion(null)
        setCreandoCierre(false)
        void fetchCalendario(sedeEnCalendario.id)
      }
    },
    [sedeEnCalendario, cierreEnEdicion, handleUpdateCierre, handleCreateCierre, fetchCalendario]
  )

  const onCancelarCierre = useCallback(
    async (cierre: Cierre) => {
      if (!sedeEnCalendario) return
      if (await conAviso(() => handleCancelCierre(sedeEnCalendario.id, cierre.id))) {
        void fetchCalendario(sedeEnCalendario.id)
      }
    },
    [sedeEnCalendario, handleCancelCierre, fetchCalendario]
  )

  return (
    <main className="scroll-fino flex-1 overflow-y-auto p-4 sm:p-6">
      <SectionCard
        titulo="Sedes"
        subtitulo="Dónde opera la barbería. Cada sede tiene su hora, su horario y sus cierres"
        accion={
          gestiona ? (
            <Button type="button" size="sm" onClick={() => setCreandoSede(true)}>
              <Plus className="size-4" aria-hidden />
              Nueva sede
            </Button>
          ) : undefined
        }
      >
        <SedesList
          sedes={sedes}
          loading={loadingLista}
          gestiona={gestiona}
          onEditar={setSedeEnEdicion}
          onCalendario={abrirCalendario}
          onAlternarActiva={(sede) => void onAlternarActiva(sede)}
        />
      </SectionCard>

      <Modal
        open={creandoSede || sedeEnEdicion !== null}
        onOpenChange={(abierto) => {
          if (!abierto) {
            setCreandoSede(false)
            setSedeEnEdicion(null)
          }
        }}
        titulo={sedeEnEdicion ? sedeEnEdicion.nombre : "Nueva sede"}
        descripcion="La zona horaria es de la sede: es la hora en la que se lee su agenda."
        size="lg"
      >
        <SedesForm
          key={sedeEnEdicion?.id ?? "nueva"}
          sede={sedeEnEdicion}
          cargando={loadingAction}
          onSubmit={onGuardarSede}
        />
      </Modal>

      <Modal
        open={sedeEnCalendario !== null}
        onOpenChange={(abierto) => !abierto && setSedeEnCalendario(null)}
        titulo={`Calendario de ${sedeEnCalendario?.nombre ?? ""}`}
        descripcion="Cuándo abre la sede y qué días no."
        size="lg"
      >
        {sedeEnCalendario && (
          <Tabs defaultValue="horario">
            <TabsList>
              <TabsTrigger value="horario">Horario</TabsTrigger>
              <TabsTrigger value="cierres">Cierres</TabsTrigger>
            </TabsList>

            <TabsContent value="horario" className="mt-4">
              <SedesHorarioForm
                key={`${sedeEnCalendario.id}-${horario?.tramos.length ?? 0}`}
                sede={sedeEnCalendario}
                horario={horario}
                cargando={loadingAction || loadingCalendario}
                soloLectura={!gestiona}
                onSubmit={onGuardarHorario}
              />
            </TabsContent>

            <TabsContent value="cierres" className="mt-4 flex flex-col gap-3">
              {gestiona && (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="self-end"
                  onClick={() => setCreandoCierre(true)}
                >
                  <Plus className="size-4" aria-hidden />
                  Programar cierre
                </Button>
              )}

              <SedesCierresList
                cierres={cierres}
                loading={loadingCalendario}
                gestiona={gestiona}
                onEditar={setCierreEnEdicion}
                onCancelar={(cierre) => void onCancelarCierre(cierre)}
              />
            </TabsContent>
          </Tabs>
        )}
      </Modal>

      <Modal
        open={creandoCierre || cierreEnEdicion !== null}
        onOpenChange={(abierto) => {
          if (!abierto) {
            setCreandoCierre(false)
            setCierreEnEdicion(null)
          }
        }}
        titulo={cierreEnEdicion ? "Editar cierre" : "Programar cierre"}
        descripcion="Cierra la sede completa, y con ella la agenda de todos sus barberos."
      >
        <SedesCierreForm
          key={cierreEnEdicion?.id ?? "nuevo"}
          cierre={cierreEnEdicion}
          cargando={loadingAction}
          onSubmit={onGuardarCierre}
        />
      </Modal>
    </main>
  )
}
