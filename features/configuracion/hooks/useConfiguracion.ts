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

/**
 * Solo estado de API — el estado de UI (modales, edición) vive en el padre.
 *
 * Las lecturas van por SEPARADO y no en un único `fetchConfiguracion` porque cada
 * apartado de Configuración es ahora su propia ruta: el menú necesita el catálogo
 * de apartados, «General» la barbería y «Notificaciones» los canales. Pedirlo todo
 * junto significaría que el chrome del apartado y su contenido se disputan la
 * misma llamada, y que entrar a «Seguridad» pide una barbería que nadie va a
 * mirar.
 */
export function useConfiguracion() {
  const [secciones, setSecciones] = useState<SeccionConfiguracion[]>([])
  const [barberia, setBarberia] = useState<Barberia | null>(null)
  const [canales, setCanales] = useState<InfoCanalNotificacion[]>([])
  const [loadingSecciones, setLoadingSecciones] = useState(false)
  const [loadingBarberia, setLoadingBarberia] = useState(false)
  const [loadingCanales, setLoadingCanales] = useState(false)
  const [loadingAction, setLoadingAction] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSecciones = useCallback(async () => {
    setLoadingSecciones(true)
    try {
      const res = await configuracionService.obtenerSecciones()
      setSecciones(res.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingSecciones(false)
    }
  }, [])

  const fetchBarberia = useCallback(async () => {
    setLoadingBarberia(true)
    setError(null)
    try {
      const res = await configuracionService.obtenerBarberia()
      setBarberia(res.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingBarberia(false)
    }
  }, [])

  const fetchCanales = useCallback(async () => {
    setLoadingCanales(true)
    try {
      const res = await configuracionService.obtenerCanales()
      setCanales(res.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingCanales(false)
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

  /** Otro enlace para publicar la barbería: los correos se pierden. */
  const handleReenviarVerificacion = useCallback(async (): Promise<string> => {
    setLoadingAction(true)
    try {
      const res = await configuracionService.reenviarVerificacion()
      return res.message
    } finally {
      setLoadingAction(false)
    }
  }, [])

  return {
    handleReenviarVerificacion,
    secciones,
    barberia,
    canales,
    loadingSecciones,
    loadingBarberia,
    loadingCanales,
    loadingAction,
    error,
    fetchSecciones,
    fetchBarberia,
    fetchCanales,
    handleGuardarGeneral,
    handleGuardarFicha,
    handleActualizarContrasena,
  }
}
