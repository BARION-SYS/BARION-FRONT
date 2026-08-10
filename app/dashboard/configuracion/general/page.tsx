"use client"

import { useEffect } from "react"
import { FichaPublica } from "@features/configuracion/components/FichaPublica"
import { General } from "@features/configuracion/components/General"
import { useConfiguracion } from "@features/configuracion/hooks/useConfiguracion"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"
import { notify } from "@shared/services/notify"
import { puede } from "@features/auth/utils/permisos"
import { useAuthStore } from "@store/auth.store"
import { getErrorMessage } from "@shared/utils/error"
import type { DatosFicha, DatosGeneral } from "@features/configuracion/schemas/configuracion.schema"

/**
 * Los datos del negocio y el texto de su portal.
 *
 * Son dos endpoints distintos —la identidad fiscal y la cara pública se tocan por
 * separado— pero la misma pantalla: quien entra a «General» viene a describir su
 * barbería, y partirlo en dos apartados obligaría a adivinar en cuál está el
 * eslogan.
 */
export default function ConfiguracionGeneralPage() {
  const {
    barberia,
    loadingBarberia,
    loadingAction,
    fetchBarberia,
    handleGuardarGeneral,
    handleGuardarFicha,
  } = useConfiguracion()

  /**
   * Ocultar el botón no es seguridad —la api revalida el permiso en cada
   * petición—, pero evita ofrecer un guardado que va a terminar en 403.
   */
  const sesion = useAuthStore((estado) => estado.sesion)
  const gestiona = puede(sesion, "barberias.gestionar")

  useEffect(() => {
    void fetchBarberia()
  }, [fetchBarberia])

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

  if (loadingBarberia) return <DataSkeleton variant="form" count={4} />
  if (!barberia) return null

  return (
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
  )
}
