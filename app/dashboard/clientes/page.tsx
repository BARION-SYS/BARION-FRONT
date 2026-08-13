"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@shared/components/ui/button"
import { Modal } from "@shared/components/modals/Modal"
import { notify } from "@shared/services/notify"
import { getErrorMessage } from "@shared/utils/error"
import { useAuthStore } from "@store/auth.store"
import { puede } from "@features/auth/utils/permisos"
import { useSedeActual } from "@store/sede.store"
import { useBarberos } from "@features/barberos/hooks/useBarberos"
import { useClientes } from "@features/clientes/hooks/useClientes"
import {
  ClientesBloqueoForm,
  ID_FORM_BLOQUEO,
} from "@features/clientes/components/ClientesBloqueoForm"
import type { DatosBloqueo } from "@features/clientes/schemas/clientes.schema"
import { ClientesDetail } from "@features/clientes/components/ClientesDetail"
import { ClientesForm } from "@features/clientes/components/ClientesForm"
import { ClientesList } from "@features/clientes/components/ClientesList"
import { ClientesToolbar } from "@features/clientes/components/ClientesToolbar"
import type { DatosCliente } from "@features/clientes/schemas/clientes.schema"
import type { Cliente, TipoConsentimiento } from "@features/clientes/types/clientes.types"

/** La versión de la política que se está aceptando hoy. Viaja con cada registro:
 *  parte de la prueba es saber QUÉ aceptó, no solo que aceptó. */
const VERSION_POLITICA = "2026-07-01"

/**
 * La base de clientes.
 *
 * Un endpoint, dos alcances: con `clientes.ver` se ve la barbería entera; con
 * `clientes.ver_propios`, solo a quienes ese barbero atendió. El filtro lo aplica
 * la api — de la LISTA aquí no hay nada que decidir. Su ficha tampoco: visitas y
 * permisos de comunicación llegan con ese mismo alcance.
 *
 * Lo que sí se decide aquí son los **catálogos auxiliares**, que no son del
 * cliente sino de otras capacidades: los segmentos son de `clientes.ver` y los
 * barberos de `barberos.ver`. Pedirlos igual llenaba de 403 una pantalla que el
 * barbero abre con razón, así que van condicionados y la pantalla se adapta.
 */
export default function ClientesPage() {
  const {
    clientes,
    segmentos,
    historial,
    consentimientos,
    loadingLista,
    loadingHistorial,
    loadingAction,
    error,
    fetchClientes,
    fetchSegmentos,
    fetchFicha,
    handleCreateCliente,
    handleUpdateCliente,
    handleRegistrarConsentimiento,
    handleAnonimizarCliente,
    handleBloquearCliente,
    handleDesbloquearCliente,
  } = useClientes()

  const { barberos, fetchBarberos } = useBarberos()
  const sedeActual = useSedeActual()

  const sesion = useAuthStore((estado) => estado.sesion)
  const gestiona = puede(sesion, "clientes.gestionar")
  const puedeAnonimizar = puede(sesion, "clientes.anonimizar")
  /** La base entera. Sin esto se entra con `clientes.ver_propios`, y la pantalla
   *  se queda con lo que ese alcance sí da. */
  const veBase = puede(sesion, "clientes.ver")
  const veEquipo = puede(sesion, "barberos.ver")

  // Estado de UI: vive en el contenedor.
  const [buscar, setBuscar] = useState("")
  const [segmentoId, setSegmentoId] = useState("")
  const [seleccionadoId, setSeleccionadoId] = useState<string | null>(null)
  const [creando, setCreando] = useState(false)
  const [clienteEnEdicion, setClienteEnEdicion] = useState<Cliente | null>(null)
  const [clienteAAnonimizar, setClienteAAnonimizar] = useState<Cliente | null>(null)
  const [clienteABloquear, setClienteABloquear] = useState<Cliente | null>(null)

  // La búsqueda y la etiqueta las filtra la API: la base de clientes crece sin
  // techo y traerla entera para filtrarla aquí dejaría de funcionar sola.
  const cargar = useCallback(
    () => fetchClientes({ buscar: buscar || undefined, segmentoId: segmentoId || undefined }),
    [fetchClientes, buscar, segmentoId]
  )

  useEffect(() => {
    void cargar()
  }, [cargar])

  /**
   * Los dos catálogos auxiliares, cada uno detrás de la capacidad que lo abre.
   *
   * - **Segmentos** (`clientes.ver`): son la segmentación de la base ENTERA, con
   *   el conteo de miembros de cada etiqueta. Quien solo ve a los suyos no los
   *   pide, y su lista se queda sin el filtro por etiqueta. No pierde el dato:
   *   la etiqueta de cada cliente ya viene resuelta en su fila.
   * - **Barberos** (`barberos.ver`): solo los usa el formulario, para el «se
   *   atiende con». Se piden con las DOS: sin `clientes.gestionar` no hay
   *   formulario que abrir, y sin `barberos.ver` la api no los daría — el caso
   *   real es el administrador al que le revocaron una de las dos.
   */
  useEffect(() => {
    if (veBase) void fetchSegmentos()
    if (veEquipo && gestiona) void fetchBarberos({ sedeId: sedeActual?.id, soloActivos: true })
  }, [veBase, veEquipo, gestiona, fetchSegmentos, fetchBarberos, sedeActual?.id])

  const seleccionado = clientes.find((c) => c.id === seleccionadoId) ?? clientes[0] ?? null
  const idActual = seleccionado?.id ?? null
  // La api resuelve QUÉ etiqueta gana; de dónde sale lo dice su segmento, que ya
  // está cargado para el filtro.
  const segmentoEtiqueta =
    segmentos.find((segmento) => segmento.id === seleccionado?.etiqueta?.id) ?? null

  useEffect(() => {
    if (idActual) void fetchFicha(idActual)
  }, [idActual, fetchFicha])

  const conAviso = async (accion: () => Promise<string>) => {
    try {
      notify.success(await accion())
      return true
    } catch (err) {
      notify.error(getErrorMessage(err))
      return false
    }
  }

  const onGuardar = useCallback(
    async (datos: DatosCliente) => {
      const guardado = clienteEnEdicion
        ? await conAviso(() => handleUpdateCliente(clienteEnEdicion.id, datos))
        : await conAviso(() => handleCreateCliente(datos))

      if (guardado) {
        setClienteEnEdicion(null)
        setCreando(false)
        void cargar()
      }
    },
    [clienteEnEdicion, handleUpdateCliente, handleCreateCliente, cargar]
  )

  const onConsentimiento = useCallback(
    (tipo: TipoConsentimiento, otorgado: boolean) => {
      if (!seleccionado) return
      void conAviso(() =>
        handleRegistrarConsentimiento(seleccionado.id, {
          tipo,
          otorgado,
          origen: "admin",
          versionPolitica: VERSION_POLITICA,
        })
      )
    },
    [seleccionado, handleRegistrarConsentimiento]
  )

  const onConfirmarAnonimizar = useCallback(async () => {
    if (!clienteAAnonimizar) return
    if (await conAviso(() => handleAnonimizarCliente(clienteAAnonimizar.id))) {
      setClienteAAnonimizar(null)
      void cargar()
    }
  }, [clienteAAnonimizar, handleAnonimizarCliente, cargar])

  const onBloquear = useCallback(
    async (datos: DatosBloqueo) => {
      if (!clienteABloquear) return
      try {
        notify.success(await handleBloquearCliente(clienteABloquear.id, datos))
        setClienteABloquear(null)
        void cargar()
      } catch (err) {
        notify.error(getErrorMessage(err))
      }
    },
    [clienteABloquear, handleBloquearCliente, cargar]
  )

  const onDesbloquear = useCallback(
    async (cliente: Cliente) => {
      try {
        notify.success(await handleDesbloquearCliente(cliente.id))
        void cargar()
      } catch (err) {
        notify.error(getErrorMessage(err))
      }
    },
    [handleDesbloquearCliente, cargar]
  )

  return (
    // Móvil: scroll de página. lg+: app-like — alto fijo, lista y detalle
    // scrollean por dentro.
    <main className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 md:p-6 lg:flex-row lg:overflow-hidden">
      <section
        className="flex shrink-0 flex-col gap-3 lg:min-h-0 lg:w-80"
        aria-label="Directorio de clientes"
      >
        <ClientesToolbar
          buscar={buscar}
          segmentoId={segmentoId}
          segmentos={segmentos.filter((segmento) => segmento.esEtiqueta)}
          total={clientes.length}
          onBuscar={setBuscar}
          onSegmento={setSegmentoId}
        />

        <ClientesList
          clientes={clientes}
          loading={loadingLista}
          seleccionadoId={idActual}
          gestiona={gestiona}
          onSeleccionar={setSeleccionadoId}
          onNuevo={() => setCreando(true)}
        />
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
            segmentoEtiqueta={segmentoEtiqueta}
            historial={historial}
            consentimientos={consentimientos}
            cargandoFicha={loadingHistorial}
            gestiona={gestiona}
            puedeAnonimizar={puedeAnonimizar}
            onEditar={() => setClienteEnEdicion(seleccionado)}
            onBloquear={() => setClienteABloquear(seleccionado)}
            onDesbloquear={() => void onDesbloquear(seleccionado)}
            onAnonimizar={() => setClienteAAnonimizar(seleccionado)}
            onConsentimiento={onConsentimiento}
          />
        ) : null}
      </section>

      <Modal
        open={creando || clienteEnEdicion !== null}
        onOpenChange={(abierto) => {
          if (!abierto) {
            setCreando(false)
            setClienteEnEdicion(null)
          }
        }}
        titulo={clienteEnEdicion ? clienteEnEdicion.nombre : "Registrar un cliente"}
        descripcion={
          clienteEnEdicion
            ? "Teléfono y correo son únicos en la barbería: la misma persona dos veces parte su historial."
            : "La ficha de quien atiendes en el local. No es una cuenta y no le da acceso a nada."
        }
        size="lg"
      >
        <ClientesForm
          key={clienteEnEdicion?.id ?? "nuevo"}
          cliente={clienteEnEdicion}
          barberos={barberos}
          cargando={loadingAction}
          onSubmit={onGuardar}
        />
      </Modal>

      <Modal
        open={clienteABloquear !== null}
        onOpenChange={(abierto) => !abierto && setClienteABloquear(null)}
        size="sm"
        titulo="Bloquear la reserva en línea"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setClienteABloquear(null)}
              disabled={loadingAction}
            >
              Cancelar
            </Button>
            <Button type="submit" form={ID_FORM_BLOQUEO} disabled={loadingAction}>
              Bloquear
            </Button>
          </>
        }
      >
        {clienteABloquear && (
          <ClientesBloqueoForm
            nombre={clienteABloquear.nombre}
            onSubmit={(datos) => void onBloquear(datos)}
          />
        )}
      </Modal>

      <Modal
        open={clienteAAnonimizar !== null}
        onOpenChange={(abierto) => !abierto && setClienteAAnonimizar(null)}
        size="sm"
        titulo="Anonimizar cliente"
        descripcion="Es irreversible."
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setClienteAAnonimizar(null)}
              disabled={loadingAction}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => void onConfirmarAnonimizar()}
              disabled={loadingAction}
            >
              Anonimizar
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          Se borran los datos personales de {clienteAAnonimizar?.nombre} y la ficha se queda: sus
          citas y liquidaciones son registro contable del negocio. Después no se podrá modificar ni
          recuperar.
        </p>
      </Modal>
    </main>
  )
}
