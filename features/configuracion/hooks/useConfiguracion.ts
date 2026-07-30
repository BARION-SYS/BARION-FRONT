"use client"

import { useCallback, useState } from "react"
import type {
  DatosFicha,
  DatosGeneral,
  DatosSeguridad,
} from "@features/configuracion/schemas/configuracion.schema"
import { configuracionService } from "@features/configuracion/services/configuracion.service"
import type {
  Barberia,
  InfoCanalNotificacion,
  SeccionConfiguracion,
} from "@features/configuracion/types/configuracion.types"
import { getErrorMessage } from "@shared/utils/error"

// Solo estado de API — el estado de UI (sección activa, color, edición) vive en el padre.
export function useConfiguracion() {
  const [secciones, setSecciones] = useState<SeccionConfiguracion[]>([])
  const [barberia, setBarberia] = useState<Barberia | null>(null)
  const [coloresPreset, setColoresPreset] = useState<string[]>([])
  const [canales, setCanales] = useState<InfoCanalNotificacion[]>([])
  const [loadingConfiguracion, setLoadingConfiguracion] = useState(false)
  const [loadingAction, setLoadingAction] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchConfiguracion = useCallback(async () => {
    setLoadingConfiguracion(true)
    setError(null)
    try {
      const [resSecciones, resBarberia, resColores, resCanales] = await Promise.all([
        configuracionService.obtenerSecciones(),
        configuracionService.obtenerBarberia(),
        configuracionService.obtenerColoresPreset(),
        configuracionService.obtenerCanales(),
      ])
      setSecciones(resSecciones.data)
      setBarberia(resBarberia.data)
      setColoresPreset(resColores.data)
      setCanales(resCanales.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingConfiguracion(false)
    }
  }, [])

  /**
   * La API devuelve la barbería completa, así que se refresca el estado en vez
   * de volver a pedirla: un refetch dejaría la pantalla un instante con el valor
   * viejo justo después de guardarlo.
   */
  const handleGuardarGeneral = useCallback(async (payload: DatosGeneral): Promise<string> => {
    setLoadingAction(true)
    try {
      const res = await configuracionService.guardarGeneral(payload)
      setBarberia(res.data)
      return res.message
    } catch (err) {
      throw new Error(getErrorMessage(err))
    } finally {
      setLoadingAction(false)
    }
  }, [])

  const handleGuardarFicha = useCallback(async (payload: DatosFicha): Promise<string> => {
    setLoadingAction(true)
    try {
      const res = await configuracionService.guardarFicha(payload)
      setBarberia(res.data)
      return res.message
    } catch (err) {
      throw new Error(getErrorMessage(err))
    } finally {
      setLoadingAction(false)
    }
  }, [])

  const handleActualizarContrasena = useCallback(
    async (payload: DatosSeguridad): Promise<string> => {
      setLoadingAction(true)
      try {
        const res = await configuracionService.actualizarContrasena(payload)
        return res.message
      } catch (err) {
        // Se relanza: devolver el mensaje de error haría que el padre lo
        // celebrara con un toast de éxito sobre una contraseña que no cambió.
        throw new Error(getErrorMessage(err))
      } finally {
        setLoadingAction(false)
      }
    },
    []
  )

  return {
    secciones,
    barberia,
    coloresPreset,
    canales,
    loadingConfiguracion,
    loadingAction,
    error,
    fetchConfiguracion,
    handleGuardarGeneral,
    handleGuardarFicha,
    handleActualizarContrasena,
  }
}
