"use client"

import { useCallback, useState } from "react"
import type {
  DatosGeneral,
  DatosSeguridad,
  DatosServicio,
} from "@features/configuracion/schemas/configuracion.schema"
import { configuracionService } from "@features/configuracion/services/configuracion.service"
import type {
  Barberia,
  InfoCanalNotificacion,
  SeccionConfiguracion,
  Servicio,
} from "@features/configuracion/types/configuracion.types"
import { getErrorMessage } from "@shared/utils/error"

// Solo estado de API — el estado de UI (sección activa, color, edición) vive en el padre.
export function useConfiguracion() {
  const [secciones, setSecciones] = useState<SeccionConfiguracion[]>([])
  const [barberia, setBarberia] = useState<Barberia | null>(null)
  const [coloresPreset, setColoresPreset] = useState<string[]>([])
  const [canales, setCanales] = useState<InfoCanalNotificacion[]>([])
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [loadingConfiguracion, setLoadingConfiguracion] = useState(false)
  const [loadingAction, setLoadingAction] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchConfiguracion = useCallback(async () => {
    setLoadingConfiguracion(true)
    setError(null)
    try {
      const [resSecciones, resBarberia, resColores, resCanales, resServicios] = await Promise.all([
        configuracionService.obtenerSecciones(),
        configuracionService.obtenerBarberia(),
        configuracionService.obtenerColoresPreset(),
        configuracionService.obtenerCanales(),
        configuracionService.obtenerServicios(),
      ])
      setSecciones(resSecciones.data)
      setBarberia(resBarberia.data)
      setColoresPreset(resColores.data)
      setCanales(resCanales.data)
      setServicios(resServicios.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingConfiguracion(false)
    }
  }, [])

  const handleGuardarGeneral = useCallback(async (payload: DatosGeneral): Promise<string> => {
    setLoadingAction(true)
    setError(null)
    try {
      const res = await configuracionService.guardarGeneral(payload)
      return res.message
    } catch (err) {
      const mensaje = getErrorMessage(err)
      setError(mensaje)
      return mensaje
    } finally {
      setLoadingAction(false)
    }
  }, [])

  const handleActualizarContrasena = useCallback(
    async (payload: DatosSeguridad): Promise<string> => {
      setLoadingAction(true)
      setError(null)
      try {
        const res = await configuracionService.actualizarContrasena(payload)
        return res.message
      } catch (err) {
        const mensaje = getErrorMessage(err)
        setError(mensaje)
        return mensaje
      } finally {
        setLoadingAction(false)
      }
    },
    []
  )

  const handleCreateServicio = useCallback(async (payload: DatosServicio): Promise<string> => {
    setLoadingAction(true)
    setError(null)
    try {
      const res = await configuracionService.crearServicio(payload)
      return res.message
    } catch (err) {
      setError(getErrorMessage(err))
      throw err
    } finally {
      setLoadingAction(false)
    }
  }, [])

  const handleUpdateServicio = useCallback(
    async (id: number, payload: DatosServicio): Promise<string> => {
      setLoadingAction(true)
      setError(null)
      try {
        const res = await configuracionService.actualizarServicio(id, payload)
        return res.message
      } catch (err) {
        setError(getErrorMessage(err))
        throw err
      } finally {
        setLoadingAction(false)
      }
    },
    []
  )

  const handleDeleteServicio = useCallback(async (id: number): Promise<string> => {
    setLoadingAction(true)
    setError(null)
    try {
      const res = await configuracionService.eliminarServicio(id)
      return res.message
    } catch (err) {
      setError(getErrorMessage(err))
      throw err
    } finally {
      setLoadingAction(false)
    }
  }, [])

  return {
    secciones,
    barberia,
    coloresPreset,
    canales,
    servicios,
    loadingConfiguracion,
    loadingAction,
    error,
    fetchConfiguracion,
    handleGuardarGeneral,
    handleActualizarContrasena,
    handleCreateServicio,
    handleUpdateServicio,
    handleDeleteServicio,
  }
}
