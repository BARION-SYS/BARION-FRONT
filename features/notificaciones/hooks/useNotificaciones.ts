"use client"

import { useCallback, useState } from "react"
import { notificacionesService } from "@features/notificaciones/services/notificaciones.service"
import { getErrorMessage } from "@shared/utils/error"
import type {
  FiltrosNotificaciones,
  Notificacion,
} from "@features/notificaciones/types/notificaciones.types"

// Solo estado de API — el estado de UI vive en quien lo instancia.
export function useNotificaciones() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [noLeidas, setNoLeidas] = useState(0)
  const [loadingNotificaciones, setLoadingNotificaciones] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNotificaciones = useCallback(async (filtros: FiltrosNotificaciones = {}) => {
    setLoadingNotificaciones(true)
    setError(null)
    try {
      // El conteo viene aparte porque el badge no depende de la página que se
      // esté mirando: con 40 sin leer y 20 por página, contarlas en cliente
      // daría 20.
      const [resLista, resConteo] = await Promise.all([
        notificacionesService.obtenerNotificaciones(filtros),
        notificacionesService.obtenerNoLeidas(),
      ])
      setNotificaciones(resLista.data)
      setNoLeidas(resConteo.data.noLeidas)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingNotificaciones(false)
    }
  }, [])

  const handleMarcarLeidaNotificacion = useCallback(async (id: string): Promise<string> => {
    const res = await notificacionesService.marcarLeida(id)
    return res.message
  }, [])

  const handleMarcarTodasLeidasNotificaciones = useCallback(async (): Promise<string> => {
    const res = await notificacionesService.marcarTodasLeidas()
    return res.message
  }, [])

  return {
    notificaciones,
    noLeidas,
    loadingNotificaciones,
    error,
    fetchNotificaciones,
    handleMarcarLeidaNotificacion,
    handleMarcarTodasLeidasNotificaciones,
  }
}
