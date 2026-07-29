"use client"

import { useCallback, useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Modal } from "@shared/components/modals/Modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/components/ui/tabs"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"
import { notify } from "@shared/services/notify"
import { getErrorMessage } from "@shared/utils/error"
import { useAuthStore } from "@store/auth.store"
import { puede } from "@features/auth/utils/permisos"
import { useBarberos } from "@features/barberos/hooks/useBarberos"
import { BarberosAusenciaForm } from "@features/barberos/components/BarberosAusenciaForm"
import { BarberosAusenciasList } from "@features/barberos/components/BarberosAusenciasList"
import { BarberosCard } from "@features/barberos/components/BarberosCard"
import { BarberosDetail } from "@features/barberos/components/BarberosDetail"
import { BarberosForm } from "@features/barberos/components/BarberosForm"
import { BarberosJornadaForm } from "@features/barberos/components/BarberosJornadaForm"
import type { DatosAusencia, DatosBarbero } from "@features/barberos/schemas/barberos.schema"
import type { Ausencia, Barbero } from "@features/barberos/types/barberos.types"

/**
 * Quién ATIENDE, y cuándo.
 *
 * No confundir con Equipo, que es quién ENTRA al sistema: el barbero sin cuenta
 * existe aquí y no allá. Por eso el alta no pide credenciales — dar acceso es
 * otra decisión, y se toma en Equipo.
 */
export default function BarberosPage() {
  const {
    barberos,
    jornada,
    ausencias,
    loadingLista,
    loadingDisponibilidad,
    loadingAction,
    error,
    fetchBarberos,
    fetchDisponibilidad,
    handleCreateBarbero,
    handleUpdateBarbero,
    handleToggleBarbero,
    handleReplaceJornada,
    handleCreateAusencia,
    handleApproveAusencia,
    handleCancelAusencia,
  } = useBarberos()

  /**
   * Ocultar un botón no es seguridad —la api revalida el permiso en cada
   * petición—, pero evita ofrecer acciones que terminan en 403.
   */
  const sesion = useAuthStore((estado) => estado.sesion)
  const gestiona = puede(sesion, "barberos.gestionar")

  // Estado de UI: vive en el contenedor.
  const [seleccionadoId, setSeleccionadoId] = useState<string | null>(null)
  const [creando, setCreando] = useState(false)
  const [barberoEnEdicion, setBarberoEnEdicion] = useState<Barbero | null>(null)
  const [barberoEnDisponibilidad, setBarberoEnDisponibilidad] = useState<Barbero | null>(null)
  const [creandoAusencia, setCreandoAusencia] = useState(false)

  const seleccionado = barberos.find((barbero) => barbero.id === seleccionadoId) ?? barberos[0]

  useEffect(() => {
    void fetchBarberos()
  }, [fetchBarberos])

  // El detalle enseña la jornada del seleccionado, así que se trae con él.
  useEffect(() => {
    if (seleccionado) void fetchDisponibilidad(seleccionado.id)
  }, [seleccionado?.id, fetchDisponibilidad]) // eslint-disable-line react-hooks/exhaustive-deps

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
      const guardado = barberoEnEdicion
        ? await conAviso(() => handleUpdateBarbero(barberoEnEdicion.id, datos))
        : await conAviso(() => handleCreateBarbero(datos))

      if (guardado) {
        setBarberoEnEdicion(null)
        setCreando(false)
        void fetchBarberos()
      }
    },
    [barberoEnEdicion, handleUpdateBarbero, handleCreateBarbero, fetchBarberos] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const onAlternarActivo = useCallback(
    async (barbero: Barbero) => {
      if (await conAviso(() => handleToggleBarbero(barbero))) void fetchBarberos()
    },
    [handleToggleBarbero, fetchBarberos] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const abrirDisponibilidad = useCallback(
    (barbero: Barbero) => {
      setBarberoEnDisponibilidad(barbero)
      void fetchDisponibilidad(barbero.id)
    },
    [fetchDisponibilidad]
  )

  const onGuardarJornada = useCallback(
    async (tramos: { diaSemana: number; inicio: string; fin: string }[]) => {
      if (!barberoEnDisponibilidad) return
      await conAviso(() => handleReplaceJornada(barberoEnDisponibilidad.id, { tramos }))
    },
    [barberoEnDisponibilidad, handleReplaceJornada] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const onGuardarAusencia = useCallback(
    async (datos: DatosAusencia) => {
      if (!barberoEnDisponibilidad) return
      const guardada = await conAviso(() => handleCreateAusencia(barberoEnDisponibilidad.id, datos))
      if (guardada) {
        setCreandoAusencia(false)
        void fetchDisponibilidad(barberoEnDisponibilidad.id)
        // La ausencia puede volver "de vacaciones" al barbero: la tarjeta lo pinta.
        void fetchBarberos()
      }
    },
    [barberoEnDisponibilidad, handleCreateAusencia, fetchDisponibilidad, fetchBarberos] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const onAusenciaTocada = useCallback(
    async (accion: () => Promise<string>) => {
      if ((await conAviso(accion)) && barberoEnDisponibilidad) {
        void fetchDisponibilidad(barberoEnDisponibilidad.id)
        void fetchBarberos()
      }
    },
    [barberoEnDisponibilidad, fetchDisponibilidad, fetchBarberos] // eslint-disable-line react-hooks/exhaustive-deps
  )

  return (
    <main className="scroll-fino flex-1 overflow-y-auto p-4 sm:p-6">
      {loadingLista && (
        <div className="flex flex-col gap-4 lg:flex-row">
          <DataSkeleton variant="list" count={3} className="shrink-0 lg:w-80" />
          <DataSkeleton variant="card" className="flex-1" />
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {!loadingLista && !error && (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <aside
            className="flex w-full shrink-0 flex-col gap-3 lg:w-80"
            aria-label="Equipo de barberos"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">
                Barberos ({barberos.length})
              </h2>
              {gestiona && (
                <Button
                  size="sm"
                  className="h-9 text-xs font-semibold"
                  onClick={() => setCreando(true)}
                >
                  <Plus aria-hidden /> Agregar
                </Button>
              )}
            </div>

            {barberos.length === 0 ? (
              <p className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
                Todavía no hay barberos. Crea el primero con el botón de arriba.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {barberos.map((barbero) => (
                  <li key={barbero.id}>
                    <BarberosCard
                      barbero={barbero}
                      seleccionado={barbero.id === seleccionado?.id}
                      onSeleccionar={() => setSeleccionadoId(barbero.id)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </aside>

          {seleccionado && (
            <section className="min-w-0 flex-1" aria-label="Detalle del barbero">
              <BarberosDetail
                barbero={seleccionado}
                jornada={jornada}
                gestiona={gestiona}
                onEditar={() => setBarberoEnEdicion(seleccionado)}
                onDisponibilidad={() => abrirDisponibilidad(seleccionado)}
                onAlternarActivo={() => void onAlternarActivo(seleccionado)}
              />
            </section>
          )}
        </div>
      )}

      <Modal
        open={creando || barberoEnEdicion !== null}
        onOpenChange={(abierto) => {
          if (!abierto) {
            setCreando(false)
            setBarberoEnEdicion(null)
          }
        }}
        titulo={barberoEnEdicion ? barberoEnEdicion.nombrePublico : "Nuevo barbero"}
        descripcion="El perfil de quien atiende. Dar acceso al sistema se decide en Equipo."
        size="lg"
      >
        <BarberosForm
          key={barberoEnEdicion?.id ?? "nuevo"}
          barbero={barberoEnEdicion}
          cargando={loadingAction}
          onSubmit={onGuardarBarbero}
        />
      </Modal>

      <Modal
        open={barberoEnDisponibilidad !== null}
        onOpenChange={(abierto) => !abierto && setBarberoEnDisponibilidad(null)}
        titulo={`Disponibilidad de ${barberoEnDisponibilidad?.nombrePublico ?? ""}`}
        descripcion="Cuándo atiende y qué días no."
        size="lg"
      >
        {barberoEnDisponibilidad && (
          <Tabs defaultValue="jornada">
            <TabsList>
              <TabsTrigger value="jornada">Jornada</TabsTrigger>
              <TabsTrigger value="ausencias">Ausencias</TabsTrigger>
            </TabsList>

            <TabsContent value="jornada" className="mt-4">
              <BarberosJornadaForm
                key={`${barberoEnDisponibilidad.id}-${jornada?.tramos.length ?? 0}`}
                jornada={jornada}
                cargando={loadingAction || loadingDisponibilidad}
                soloLectura={!gestiona}
                onSubmit={onGuardarJornada}
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
                loading={loadingDisponibilidad}
                gestiona={gestiona}
                onAprobar={(ausencia: Ausencia) =>
                  void onAusenciaTocada(() =>
                    handleApproveAusencia(barberoEnDisponibilidad.id, ausencia.id)
                  )
                }
                onCancelar={(ausencia: Ausencia) =>
                  void onAusenciaTocada(() =>
                    handleCancelAusencia(barberoEnDisponibilidad.id, ausencia.id)
                  )
                }
              />
            </TabsContent>
          </Tabs>
        )}
      </Modal>

      <Modal
        open={creandoAusencia}
        onOpenChange={setCreandoAusencia}
        titulo="Programar ausencia"
        descripcion="Bloquea al barbero en ese rango. No cancela las citas que ya tenía."
      >
        <BarberosAusenciaForm cargando={loadingAction} onSubmit={onGuardarAusencia} />
      </Modal>
    </main>
  )
}
