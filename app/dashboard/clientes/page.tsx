"use client"

import { useEffect, useState } from "react"
import { ClientesToolbar } from "@features/clientes/components/ClientesToolbar"
import { ClientesList } from "@features/clientes/components/ClientesList"
import { ClientesDetail } from "@features/clientes/components/ClientesDetail"
import { ClientesForm } from "@features/clientes/components/ClientesForm"
import { useClientes } from "@features/clientes/hooks/useClientes"
import type { DatosCliente } from "@features/clientes/schemas/clientes.schema"
import type { Cliente, FiltroEtiqueta } from "@features/clientes/types/clientes.types"
import { Button } from "@shared/components/ui/button"
import { Modal } from "@shared/components/modals/Modal"
import { Loadable } from "@shared/components/feedback/Loadable"
import { notify } from "@shared/services/notify"
import { getErrorMessage } from "@shared/utils/error"

// Contenedor: ÚNICA instancia del hook del feat; los hijos reciben datos + callbacks por props.
export default function ClientesPage() {
  const {
    clientes,
    historial,
    resumen,
    loadingLista,
    loadingHistorial,
    loadingAction,
    error,
    fetchClientes,
    fetchHistorial,
    handleCreateCliente,
    handleUpdateCliente,
    handleDeleteCliente,
  } = useClientes()

  const [busqueda, setBusqueda] = useState("")
  const [filtro, setFiltro] = useState<FiltroEtiqueta>("Todos")
  const [seleccionadoId, setSeleccionadoId] = useState<Cliente["id"] | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [clienteEnEdicion, setClienteEnEdicion] = useState<Cliente | null>(null)
  const [clienteAEliminar, setClienteAEliminar] = useState<Cliente | null>(null)

  useEffect(() => {
    void fetchClientes()
  }, [fetchClientes])

  const seleccionado = clientes.find((c) => c.id === seleccionadoId) ?? clientes[0] ?? null
  const idActual = seleccionado ? seleccionado.id : null

  useEffect(() => {
    if (idActual !== null) void fetchHistorial(idActual)
  }, [idActual, fetchHistorial])

  const filtrados = clientes.filter(
    (c) =>
      (filtro === "Todos" || c.etiqueta === filtro) &&
      (c.nombre.toLowerCase().includes(busqueda.toLowerCase()) || c.telefono.includes(busqueda))
  )

  const abrirCrear = () => {
    setClienteEnEdicion(null)
    setFormOpen(true)
  }

  const abrirEditar = (cliente: Cliente) => {
    setClienteEnEdicion(cliente)
    setFormOpen(true)
  }

  // Crea o edita según haya cliente en edición; el message viene de la mutación.
  const onSubmitCliente = async (datos: DatosCliente) => {
    try {
      const message = clienteEnEdicion
        ? await handleUpdateCliente(clienteEnEdicion.id, datos)
        : await handleCreateCliente(datos)
      notify.success(message)
      setFormOpen(false)
      setClienteEnEdicion(null)
      void fetchClientes()
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }

  const onConfirmarEliminar = async () => {
    if (!clienteAEliminar) return
    try {
      const message = await handleDeleteCliente(clienteAEliminar.id)
      notify.success(message)
      setClienteAEliminar(null)
      setSeleccionadoId(null)
      void fetchClientes()
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }

  return (
    // Móvil: scroll de página. lg+: app-like — alto fijo, lista y detalle scrollean por dentro.
    <main className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 md:p-6 lg:flex-row lg:overflow-hidden">
      <section
        className="flex shrink-0 flex-col gap-3 lg:min-h-0 lg:w-80"
        aria-label="Directorio de clientes"
      >
        <ClientesToolbar
          busqueda={busqueda}
          onBusquedaChange={setBusqueda}
          filtro={filtro}
          onFiltroChange={setFiltro}
          resumen={resumen ?? { totalClientes: 0, nuevosHoy: 0 }}
        />
        <Loadable loading={loadingLista} variant="list" count={6}>
          <ClientesList
            clientes={filtrados}
            seleccionadoId={idActual ?? 0}
            onSeleccionar={setSeleccionadoId}
            onNuevo={abrirCrear}
          />
        </Loadable>
      </section>

      <section
        className="scroll-fino min-w-0 flex-1 lg:min-h-0 lg:overflow-y-auto"
        aria-label="Detalle del cliente"
      >
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : seleccionado ? (
          <ClientesDetail
            cliente={seleccionado}
            historial={historial}
            cargandoHistorial={loadingHistorial}
            onEditar={abrirEditar}
            onEliminar={setClienteAEliminar}
          />
        ) : null}
      </section>

      <ClientesForm
        open={formOpen}
        onOpenChange={setFormOpen}
        cliente={clienteEnEdicion}
        onSubmit={onSubmitCliente}
        guardando={loadingAction}
      />

      {/* Confirmación de eliminación */}
      <Modal
        open={!!clienteAEliminar}
        onOpenChange={(open) => !open && setClienteAEliminar(null)}
        size="sm"
        titulo="Eliminar cliente"
        descripcion="Esta acción no se puede deshacer."
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setClienteAEliminar(null)}
              disabled={loadingAction}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => void onConfirmarEliminar()}
              disabled={loadingAction}
              className="cursor-pointer"
            >
              Eliminar
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          Se eliminará a {clienteAEliminar?.nombre} junto con su información.
        </p>
      </Modal>
    </main>
  )
}
