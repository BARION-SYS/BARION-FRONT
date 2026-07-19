"use client"

import { useCallback, useState } from "react"
import { notificacionesService } from "@features/notificaciones/services/notificaciones.service"
import { getErrorMessage } from "@shared/utils/error"
import type { Notificacion } from "@features/notificaciones/types/notificaciones.types"

// Solo estado de API — el estado de UI vive en quien lo instancia.
export function useNotificaciones() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [loadingNotificaciones, setLoadingNotificaciones] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNotificaciones = useCallback(async () => {
    setLoadingNotificaciones(true)
    setError(null)
    try {
      const res = await notificacionesService.obtenerNotificaciones()
      setNotificaciones(res.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingNotificaciones(false)
    }
  }, [])

  const handleMarcarLeida = useCallback(async (id: number): Promise<string> => {
    const res = await notificacionesService.marcarLeida(id)
    return res.message
  }, [])

  const handleMarcarTodasLeidas = useCallback(async (): Promise<string> => {
    const res = await notificacionesService.marcarTodasLeidas()
    return res.message
  }, [])

  return {
    notificaciones,
    loadingNotificaciones,
    error,
    fetchNotificaciones,
    handleMarcarLeida,
    handleMarcarTodasLeidas,
  }
}
