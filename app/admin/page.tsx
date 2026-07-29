"use client"

import { useCallback, useEffect, useState } from "react"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { Modal } from "@shared/components/modals/Modal"
import { Button } from "@shared/components/ui/button"
import { notify } from "@shared/services/notify"
import { useAuthStore } from "@store/auth.store"
import { puede } from "@features/auth/utils/permisos"
import { getErrorMessage } from "@shared/utils/error"
import { usePlataforma } from "@features/plataforma/hooks/usePlataforma"
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
 * Inventario de barberías — lo que ve el staff de Barion.
 *
 * El flujo completo del negocio cabe en esta pantalla: se da de alta la
 * barbería, se copia el enlace de entrada y se le pasa al cliente. A partir de
 * ahí él crea sus barberos, su catálogo y su código QR, y Barion solo vuelve
 * para cobrar o para suspender.
 */
export default function AdminPage() {
  const {
    barberias,
    total,
    recienCreada,
    loadingLista,
    loadingAction,
    error,
    fetchBarberias,
    handleCreateBarberia,
    handleChangeEstadoBarberia,
    limpiarRecienCreada,
  } = usePlataforma()

  // Estado de UI: vive en el contenedor, nunca en el hook.
  /**
   * El staff de Barion también se reparte: quien solo consulta el inventario no
   * tiene por qué encontrar el alta ni el cambio de estado.
   */
  const sesion = useAuthStore((estado) => estado.sesion)
  const gestiona = puede(sesion, "plataforma.barberias.gestionar")

  const [busqueda, setBusqueda] = useState("")
  const [estado, setEstado] = useState<EstadoBarberia | "todas">("todas")
  const [creando, setCreando] = useState(false)
  // Se conserva para mostrarlo en la entrega: la API no lo devuelve, y con razón
  // —es dato del propietario, no de la barbería— pero quien acaba de darla de
  // alta necesita tenerlo a mano para copiarlo junto al enlace.
  const [correoEntregado, setCorreoEntregado] = useState("")

  const cargar = useCallback(() => {
    void fetchBarberias({
      busqueda: busqueda || undefined,
      estado: estado === "todas" ? undefined : estado,
    })
  }, [fetchBarberias, busqueda, estado])

  useEffect(() => {
    cargar()
  }, [cargar])

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

  const onCambiarEstado = useCallback(
    async (barberia: BarberiaInventario, destino: EstadoBarberia) => {
      try {
        const mensaje = await handleChangeEstadoBarberia(barberia.id, { estado: destino })
        notify.success(mensaje)
        cargar()
      } catch (err) {
        notify.error(getErrorMessage(err))
      }
    },
    [handleChangeEstadoBarberia, cargar]
  )

  return (
    <main className="scroll-fino flex-1 overflow-y-auto p-4 sm:p-6">
      <SectionCard titulo="Barberías" subtitulo="Alta, estado y plan de cada cliente">
        <div className="flex flex-col gap-5">
          <PlataformaToolbar
            busqueda={busqueda}
            estado={estado}
            total={total}
            onBuscar={setBusqueda}
            onFiltrarEstado={setEstado}
            gestiona={gestiona}
            onCrear={() => setCreando(true)}
          />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <PlataformaList
            barberias={barberias}
            loading={loadingLista}
            gestiona={gestiona}
            onCambiarEstado={(barberia, destino) => void onCambiarEstado(barberia, destino)}
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
        <PlataformaForm cargando={loadingAction} onSubmit={onCrear} />
      </Modal>

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
