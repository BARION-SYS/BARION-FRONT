"use client"

import { useCallback, useState } from "react"
import { serviciosService } from "@features/servicios/services/servicios.service"
import { getErrorMessage } from "@shared/utils/error"
import type { DatosOferta, DatosServicio } from "@features/servicios/schemas/servicios.schema"
import type {
  FiltrosServicios,
  LineaOferta,
  Servicio,
} from "@features/servicios/types/servicios.types"

/**
 * Solo estado de API — el estado de UI (modales, selección, filtros) vive en el
 * padre.
 *
 * El catálogo y la oferta van en el mismo hook porque son el mismo dominio: la
 * oferta no existe sin el servicio del que cuelga, y la pantalla que la edita
 * necesita las dos listas a la vez.
 */
export function useServicios() {
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [oferta, setOferta] = useState<LineaOferta[]>([])
  const [loadingLista, setLoadingLista] = useState(false)
  const [loadingOferta, setLoadingOferta] = useState(false)
  const [loadingAction, setLoadingAction] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchServicios = useCallback(async (filtros: FiltrosServicios = {}) => {
    setLoadingLista(true)
    setError(null)
    try {
      const res = await serviciosService.obtenerServicios(filtros)
      setServicios(res.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingLista(false)
    }
  }, [])

  const fetchOferta = useCallback(async (barberoId: string) => {
    setLoadingOferta(true)
    try {
      const res = await serviciosService.obtenerOferta(barberoId)
      setOferta(res.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingOferta(false)
    }
  }, [])

  const handleCreateServicio = useCallback(async (payload: DatosServicio): Promise<string> => {
    setLoadingAction(true)
    try {
      // El mensaje distingue el alta publicada de la PROPUESTA de un barbero:
      // la api ya lo escribe, y reescribirlo aquí perdería esa diferencia.
      const res = await serviciosService.crearServicio(payload)
      return res.message
    } catch (err) {
      throw new Error(getErrorMessage(err))
    } finally {
      setLoadingAction(false)
    }
  }, [])

  const handleUpdateServicio = useCallback(
    async (id: string, payload: DatosServicio): Promise<string> => {
      setLoadingAction(true)
      try {
        const res = await serviciosService.actualizarServicio(id, payload)
        return res.message
      } catch (err) {
        throw new Error(getErrorMessage(err))
      } finally {
        setLoadingAction(false)
      }
    },
    []
  )

  const handleToggleServicio = useCallback(async (servicio: Servicio): Promise<string> => {
    setLoadingAction(true)
    try {
      const res = servicio.activo
        ? await serviciosService.desactivarServicio(servicio.id)
        : await serviciosService.activarServicio(servicio.id)
      return res.message
    } catch (err) {
      throw new Error(getErrorMessage(err))
    } finally {
      setLoadingAction(false)
    }
  }, [])

  const handleReplaceOferta = useCallback(
    async (barberoId: string, payload: DatosOferta): Promise<string> => {
      setLoadingAction(true)
      try {
        const res = await serviciosService.reemplazarOferta(barberoId, payload)
        setOferta(res.data)
        return res.message
      } catch (err) {
        throw new Error(getErrorMessage(err))
      } finally {
        setLoadingAction(false)
      }
    },
    []
  )

  return {
    servicios,
    oferta,
    loadingLista,
    loadingOferta,
    loadingAction,
    error,
    fetchServicios,
    fetchOferta,
    handleCreateServicio,
    handleUpdateServicio,
    handleToggleServicio,
    handleReplaceOferta,
  }
}
