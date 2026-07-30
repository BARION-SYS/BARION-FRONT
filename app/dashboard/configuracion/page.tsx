"use client"

import { useEffect, useState } from "react"
import { Apariencia } from "@features/configuracion/components/Apariencia"
import { FichaPublica } from "@features/configuracion/components/FichaPublica"
import { General } from "@features/configuracion/components/General"
import { ConfiguracionNav } from "@features/configuracion/components/ConfiguracionNav"
import { Notificaciones } from "@features/configuracion/components/Notificaciones"
import { Seguridad } from "@features/configuracion/components/Seguridad"
import { useConfiguracion } from "@features/configuracion/hooks/useConfiguracion"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"
import { notify } from "@shared/services/notify"
import { useAuthStore } from "@store/auth.store"
import { puede } from "@features/auth/utils/permisos"
import { getErrorMessage } from "@shared/utils/error"
import type {
  DatosFicha,
  DatosGeneral,
  DatosSeguridad,
} from "@features/configuracion/schemas/configuracion.schema"
import type {
  CanalNotificacion,
  CanalesNotificacion,
  IdSeccionConfiguracion,
} from "@features/configuracion/types/configuracion.types"

// Contenedor: instancia el hook UNA vez; UI state y mutaciones viven aquí, los hijos reciben props.
export default function ConfiguracionPage() {
  const {
    secciones,
    barberia,
    canales,
    loadingConfiguracion,
    loadingAction,
    fetchConfiguracion,
    handleGuardarGeneral,
    handleGuardarFicha,
    handleActualizarContrasena,
  } = useConfiguracion()

  /**
   * Ocultar el botón no es seguridad —la api revalida el permiso en cada
   * petición—, pero evita ofrecer un guardado que va a terminar en 403.
   */
  const sesion = useAuthStore((estado) => estado.sesion)
  const gestiona = puede(sesion, "barberias.gestionar")

  const [seccionActiva, setSeccionActiva] = useState<IdSeccionConfiguracion>("general")
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

  const onSubmitFicha = async (datos: DatosFicha) => {
    try {
      notify.success(await handleGuardarFicha(datos))
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
          <>
            <General
              barberia={barberia}
              soloLectura={!gestiona}
              cargando={loadingAction}
              onSubmit={onSubmitGeneral}
            />
            <FichaPublica
              barberia={barberia}
              soloLectura={!gestiona}
              cargando={loadingAction}
              onSubmit={onSubmitFicha}
            />
          </>
        )}
        {seccionActiva === "apariencia" && barberia && (
          <Apariencia nombreBarberia={barberia.nombreComercial} />
        )}
        {seccionActiva === "notificaciones" && (
          <Notificaciones canales={canales} activos={canalesActivos} alAlternar={alternarCanal} />
        )}
        {seccionActiva === "seguridad" && <Seguridad onSubmit={onSubmitSeguridad} />}
      </div>
    </main>
  )
}
