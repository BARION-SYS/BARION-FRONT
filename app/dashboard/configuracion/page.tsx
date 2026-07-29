"use client"

import { useEffect, useState } from "react"
import { Apariencia } from "@features/configuracion/components/Apariencia"
import { General } from "@features/configuracion/components/General"
import { ConfiguracionNav } from "@features/configuracion/components/ConfiguracionNav"
import { Notificaciones } from "@features/configuracion/components/Notificaciones"
import { Seguridad } from "@features/configuracion/components/Seguridad"
import { Servicios } from "@features/configuracion/components/Servicios"
import { ServiciosForm } from "@features/configuracion/components/ServiciosForm"
import { useConfiguracion } from "@features/configuracion/hooks/useConfiguracion"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"
import { Button } from "@shared/components/ui/button"
import { Modal } from "@shared/components/modals/Modal"
import { notify } from "@shared/services/notify"
import { getErrorMessage } from "@shared/utils/error"
import type {
  DatosGeneral,
  DatosSeguridad,
  DatosServicio,
} from "@features/configuracion/schemas/configuracion.schema"
import type {
  CanalNotificacion,
  CanalesNotificacion,
  IdSeccionConfiguracion,
  Servicio,
} from "@features/configuracion/types/configuracion.types"

// Contenedor: instancia el hook UNA vez; UI state y mutaciones viven aquí, los hijos reciben props.
export default function ConfiguracionPage() {
  const {
    secciones,
    barberia,
    coloresPreset,
    canales,
    servicios,
    loadingConfiguracion,
    loadingAction,
    fetchConfiguracion,
    handleGuardarGeneral,
    handleActualizarContrasena,
    handleCreateServicio,
    handleUpdateServicio,
    handleDeleteServicio,
  } = useConfiguracion()

  const [seccionActiva, setSeccionActiva] = useState<IdSeccionConfiguracion>("general")
  const [servicioFormOpen, setServicioFormOpen] = useState(false)
  const [servicioEnEdicion, setServicioEnEdicion] = useState<Servicio | null>(null)
  const [servicioAEliminar, setServicioAEliminar] = useState<Servicio | null>(null)
  const [canalesActivos, setCanalesActivos] = useState<CanalesNotificacion>({
    whatsapp: false,
    sms: false,
    correo: false,
    interno: false,
  })

  useEffect(() => {
    void fetchConfiguracion()
  }, [fetchConfiguracion])

  // Estado inicial de los toggles según lo que reporta la API
  useEffect(() => {
    setCanalesActivos((activos) => {
      const siguientes = { ...activos }
      for (const canal of canales) siguientes[canal.canal] = canal.activo
      return siguientes
    })
  }, [canales])

  const alternarCanal = (canal: CanalNotificacion) =>
    setCanalesActivos((activos) => ({ ...activos, [canal]: !activos[canal] }))

  const onSubmitGeneral = async (datos: DatosGeneral) => {
    try {
      notify.success(await handleGuardarGeneral(datos))
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }

  const onSubmitSeguridad = async (datos: DatosSeguridad) => {
    try {
      notify.success(await handleActualizarContrasena(datos))
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }

  const abrirNuevoServicio = () => {
    setServicioEnEdicion(null)
    setServicioFormOpen(true)
  }

  const abrirEdicionServicio = (servicio: Servicio) => {
    setServicioEnEdicion(servicio)
    setServicioFormOpen(true)
  }

  const cerrarFormServicio = (abierto: boolean) => {
    setServicioFormOpen(abierto)
    if (!abierto) setServicioEnEdicion(null)
  }

  // Crear o actualizar según haya servicio en edición; refetch para que el cambio se vea
  const onSubmitServicio = async (datos: DatosServicio) => {
    try {
      const message = servicioEnEdicion
        ? await handleUpdateServicio(servicioEnEdicion.id, datos)
        : await handleCreateServicio(datos)
      notify.success(message)
      cerrarFormServicio(false)
      void fetchConfiguracion()
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }

  const confirmarEliminarServicio = async () => {
    if (!servicioAEliminar) return
    try {
      const message = await handleDeleteServicio(servicioAEliminar.id)
      notify.success(message)
      setServicioAEliminar(null)
      void fetchConfiguracion()
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }

  if (loadingConfiguracion) {
    return (
      <main className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 md:flex-row md:items-start md:p-6">
        <DataSkeleton variant="list" count={6} className="shrink-0 md:w-56" />
        <DataSkeleton variant="form" count={4} className="w-full flex-1" />
      </main>
    )
  }

  return (
    <main className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 md:flex-row md:items-start md:p-6">
      <ConfiguracionNav
        secciones={secciones}
        activa={seccionActiva}
        alSeleccionar={setSeccionActiva}
      />

      <div className="w-full min-w-0 flex-1 space-y-4">
        {seccionActiva === "general" && barberia && (
          <General barberia={barberia} onSubmit={onSubmitGeneral} />
        )}
        {seccionActiva === "apariencia" && barberia && (
          <Apariencia nombreBarberia={barberia.nombre} />
        )}
        {seccionActiva === "notificaciones" && (
          <Notificaciones canales={canales} activos={canalesActivos} alAlternar={alternarCanal} />
        )}
        {seccionActiva === "precios" && (
          <Servicios
            servicios={servicios}
            onNuevo={abrirNuevoServicio}
            onEditar={abrirEdicionServicio}
            onEliminar={setServicioAEliminar}
          />
        )}
        {seccionActiva === "seguridad" && <Seguridad onSubmit={onSubmitSeguridad} />}
      </div>

      <ServiciosForm
        open={servicioFormOpen}
        onOpenChange={cerrarFormServicio}
        servicio={servicioEnEdicion}
        onSubmit={onSubmitServicio}
        guardando={loadingAction}
      />

      <Modal
        open={!!servicioAEliminar}
        onOpenChange={(abierto) => !abierto && setServicioAEliminar(null)}
        size="sm"
        titulo="Eliminar servicio"
        descripcion="Esta acción no se puede deshacer."
        footer={
          <>
            <Button variant="outline" onClick={() => setServicioAEliminar(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={loadingAction}
              onClick={() => void confirmarEliminarServicio()}
            >
              Eliminar
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          {`Se eliminará "${servicioAEliminar?.nombre ?? ""}" del catálogo.`}
        </p>
      </Modal>
    </main>
  )
}
