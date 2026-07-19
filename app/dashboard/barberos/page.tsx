"use client"

import { useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Modal } from "@shared/components/modals/Modal"
import { BarberosCard } from "@features/barberos/components/BarberosCard"
import { BarberosDetail } from "@features/barberos/components/BarberosDetail"
import { BarberosForm } from "@features/barberos/components/BarberosForm"
import { useBarberos } from "@features/barberos/hooks/useBarberos"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"
import { notify } from "@shared/services/notify"
import { getErrorMessage } from "@shared/utils/error"
import type { DatosBarbero } from "@features/barberos/schemas/barberos.schema"
import type { Barbero } from "@features/barberos/types/barberos.types"

// Contenedor: única instancia del hook; reparte datos y callbacks por props.
export default function BarberosPage() {
  const {
    barberos,
    loadingLista,
    loadingAction,
    error,
    fetchBarberos,
    handleCreateBarbero,
    handleUpdateBarbero,
    handleDeleteBarbero,
  } = useBarberos()
  const [seleccionadoId, setSeleccionadoId] = useState<number | null>(null)
  const [formAbierto, setFormAbierto] = useState(false)
  const [barberoEditar, setBarberoEditar] = useState<Barbero | null>(null)
  const [barberoEliminar, setBarberoEliminar] = useState<Barbero | null>(null)
  const seleccionado = barberos.find((barbero) => barbero.id === seleccionadoId) ?? barberos[0]

  useEffect(() => {
    void fetchBarberos()
  }, [fetchBarberos])

  const abrirCrear = () => {
    setBarberoEditar(null)
    setFormAbierto(true)
  }

  const abrirEditar = (barbero: Barbero) => {
    setBarberoEditar(barbero)
    setFormAbierto(true)
  }

  const guardarBarbero = async (datos: DatosBarbero) => {
    try {
      const message = barberoEditar
        ? await handleUpdateBarbero(barberoEditar.id, datos)
        : await handleCreateBarbero(datos)
      notify.success(message)
      setFormAbierto(false)
      void fetchBarberos()
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }

  const eliminarBarbero = async () => {
    if (!barberoEliminar) return
    try {
      const message = await handleDeleteBarbero(barberoEliminar.id)
      notify.success(message)
      // Si se eliminó el seleccionado, vuelve al primero de la lista.
      if (barberoEliminar.id === seleccionado?.id) setSeleccionadoId(null)
      setBarberoEliminar(null)
      void fetchBarberos()
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6">
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

      {!loadingLista && !error && seleccionado && (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <aside
            className="flex w-full shrink-0 flex-col gap-3 lg:w-80"
            aria-label="Equipo de barberos"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Equipo ({barberos.length})</h2>
              <Button size="sm" className="h-9 text-xs font-semibold" onClick={abrirCrear}>
                <Plus aria-hidden /> Agregar
              </Button>
            </div>

            <ul className="flex flex-col gap-3">
              {barberos.map((barbero) => (
                <li key={barbero.id}>
                  <BarberosCard
                    barbero={barbero}
                    seleccionado={barbero.id === seleccionado.id}
                    onSeleccionar={() => setSeleccionadoId(barbero.id)}
                  />
                </li>
              ))}
            </ul>
          </aside>

          <section className="min-w-0 flex-1" aria-label="Detalle del barbero">
            <BarberosDetail
              barbero={seleccionado}
              onEditar={() => abrirEditar(seleccionado)}
              onEliminar={() => setBarberoEliminar(seleccionado)}
            />
          </section>
        </div>
      )}

      <BarberosForm
        open={formAbierto}
        onOpenChange={setFormAbierto}
        barbero={barberoEditar}
        onSubmit={guardarBarbero}
        guardando={loadingAction}
      />

      {/* Confirmación de eliminación — la mutación vive aquí, en el padre. */}
      <Modal
        open={barberoEliminar !== null}
        onOpenChange={(abierta) => !abierta && setBarberoEliminar(null)}
        size="sm"
        titulo="Eliminar barbero"
        descripcion="Esta acción no se puede deshacer."
        footer={
          <>
            <Button variant="outline" onClick={() => setBarberoEliminar(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={loadingAction}
              onClick={() => void eliminarBarbero()}
            >
              Eliminar
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          {barberoEliminar?.nombre} saldrá del equipo.
        </p>
      </Modal>
    </main>
  )
}
