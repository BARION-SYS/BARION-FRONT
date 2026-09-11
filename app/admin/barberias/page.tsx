"use client"

import { useCallback, useEffect, useState } from "react"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { Modal } from "@shared/components/modals/Modal"
import { Button } from "@shared/components/ui/button"
import { notify } from "@shared/services/notify"
import { getErrorMessage } from "@shared/utils/error"
import { puede } from "@features/auth/utils/permisos"
import { useAuthStore } from "@store/auth.store"
import { usePlataforma } from "@features/plataforma/hooks/usePlataforma"
import {
  ConfirmacionEstado,
  type CambioEstadoPendiente,
} from "@features/plataforma/components/ConfirmacionEstado"
import { PlataformaEntrega } from "@features/plataforma/components/PlataformaEntrega"
import { PlataformaForm } from "@features/plataforma/components/PlataformaForm"
import { PlataformaList } from "@features/plataforma/components/PlataformaList"
import { PlataformaToolbar } from "@features/plataforma/components/PlataformaToolbar"
import type { DatosAltaBarberia } from "@features/plataforma/schemas/plataforma.schema"
import type {
  BarberiaInventario,
  EstadoBarberia,
} from "@features/plataforma/types/plataforma.types"

/**
 * El inventario de clientes de Barion.
 *
 * El flujo completo del negocio cabe en esta pantalla: se da de alta la
 * barbería, se copia el enlace de entrada y se le pasa al cliente. A partir de
 * ahí él crea sus barberos, su catálogo y su código QR, y Barion solo vuelve
 * para consultar su ficha —una página propia, `/admin/barberias/[id]`—, cobrar
 * o suspender.
 */
export default function AdminBarberiasPage() {
  const {
    barberias,
    paginacion,
    total,
    planes,
    recienCreada,
    loadingLista,
    loadingAction,
    error,
    fetchBarberias,
    fetchPlanes,
    handleCreateBarberia,
    handleChangeEstadoBarberia,
    limpiarRecienCreada,
  } = usePlataforma()

  /**
   * El staff de Barion también se reparte: quien solo consulta el inventario no
   * tiene por qué encontrar el alta ni el cambio de estado.
   */
  const sesion = useAuthStore((estado) => estado.sesion)
  const gestiona = puede(sesion, "plataforma.barberias.gestionar")

  // Estado de UI: vive en el contenedor, nunca en el hook.
  const [busqueda, setBusqueda] = useState("")
  const [estado, setEstado] = useState<EstadoBarberia | "todas">("todas")
  const [pagina, setPagina] = useState(1)
  const [creando, setCreando] = useState(false)
  const [cambio, setCambio] = useState<(CambioEstadoPendiente & { id: string }) | null>(null)
  // Se conserva para mostrarlo en la entrega: la API no lo devuelve, y con razón
  // —es dato del propietario, no de la barbería— pero quien acaba de darla de
  // alta necesita tenerlo a mano para copiarlo junto al enlace.
  const [correoEntregado, setCorreoEntregado] = useState("")

  const cargar = useCallback(() => {
    void fetchBarberias({
      busqueda: busqueda || undefined,
      estado: estado === "todas" ? undefined : estado,
      page: pagina,
    })
  }, [fetchBarberias, busqueda, estado, pagina])

  useEffect(() => {
    cargar()
  }, [cargar])

  // El catálogo se pide una vez: lo necesita el alta para elegir plan, y cambia
  // como mucho una vez al mes.
  useEffect(() => {
    void fetchPlanes()
  }, [fetchPlanes])

  // Filtrar reinicia la página: quedarse en la 3 de un resultado que ahora tiene
  // una sola es enseñar un vacío que parece un error.
  const onBuscar = useCallback((valor: string) => {
    setBusqueda(valor)
    setPagina(1)
  }, [])

  const onFiltrarEstado = useCallback((valor: EstadoBarberia | "todas") => {
    setEstado(valor)
    setPagina(1)
  }, [])

  const onLimpiar = useCallback(() => {
    setBusqueda("")
    setEstado("todas")
    setPagina(1)
  }, [])

  const onCrear = useCallback(
    async (datos: DatosAltaBarberia) => {
      try {
        const mensaje = await handleCreateBarberia(datos)
        setCorreoEntregado(datos.propietarioEmail)
        setCreando(false)
        notify.success(mensaje)
        cargar()
      } catch (err) {
        notify.error(getErrorMessage(err))
      }
    },
    [handleCreateBarberia, cargar]
  )

  const onPedirCambio = useCallback((barberia: BarberiaInventario, destino: EstadoBarberia) => {
    setCambio({
      id: barberia.id,
      nombre: barberia.nombreComercial,
      actual: barberia.estado,
      destino,
    })
  }, [])

  const onConfirmarCambio = useCallback(async () => {
    if (!cambio) return
    try {
      const mensaje = await handleChangeEstadoBarberia(cambio.id, { estado: cambio.destino })
      notify.success(mensaje)
      setCambio(null)
      cargar()
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }, [cambio, handleChangeEstadoBarberia, cargar])

  return (
    <main className="scroll-fino flex-1 overflow-y-auto p-4 sm:p-6">
      <SectionCard titulo="Barberías" subtitulo="Alta, ficha, estado y plan de cada cliente">
        <div className="flex flex-col gap-5">
          <PlataformaToolbar
            busqueda={busqueda}
            estado={estado}
            total={total}
            onBuscar={onBuscar}
            onFiltrarEstado={onFiltrarEstado}
            onLimpiar={onLimpiar}
            gestiona={gestiona}
            onCrear={() => setCreando(true)}
          />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <PlataformaList
            barberias={barberias}
            loading={loadingLista}
            gestiona={gestiona}
            paginacion={paginacion}
            onPagina={setPagina}
            onCambiarEstado={onPedirCambio}
          />
        </div>
      </SectionCard>

      <Modal
        open={creando}
        onOpenChange={setCreando}
        titulo="Nueva barbería"
        descripcion="Se crea con su sede y su propietario: queda lista para entregar."
        size="lg"
      >
        <PlataformaForm planes={planes} cargando={loadingAction} onSubmit={onCrear} />
      </Modal>

      <ConfirmacionEstado
        cambio={cambio}
        cargando={loadingAction}
        onConfirmar={() => void onConfirmarCambio()}
        onCerrar={() => setCambio(null)}
      />

      <Modal
        open={recienCreada !== null}
        onOpenChange={(abierto) => !abierto && limpiarRecienCreada()}
        titulo="Entrégasela a tu cliente"
        size="lg"
        footer={
          <Button type="button" onClick={limpiarRecienCreada}>
            Listo
          </Button>
        }
      >
        {recienCreada && (
          <PlataformaEntrega barberia={recienCreada} correoPropietario={correoEntregado} />
        )}
      </Modal>
    </main>
  )
}
