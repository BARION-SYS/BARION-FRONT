"use client"

import { useCallback, useState } from "react"
import { barberosService } from "@features/barberos/services/barberos.service"
import { getErrorMessage } from "@shared/utils/error"
import type { DatosBarbero } from "@features/barberos/schemas/barberos.schema"
import type { Barbero } from "@features/barberos/types/barberos.types"

// Solo estado de API — el estado de UI (selección, modales) vive en el contenedor.
export function useBarberos() {
  const [barberos, setBarberos] = useState<Barbero[]>([])
  const [loadingLista, setLoadingLista] = useState(false)
  const [loadingAction, setLoadingAction] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBarberos = useCallback(async () => {
    setLoadingLista(true)
    setError(null)
    try {
      const { data } = await barberosService.obtenerBarberos()
      setBarberos(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingLista(false)
    }
  }, [])

  const handleCreateBarbero = useCallback(async (payload: DatosBarbero): Promise<string> => {
    setLoadingAction(true)
    try {
      const res = await barberosService.crearBarbero(payload)
      return res.message
    } catch (err) {
      throw new Error(getErrorMessage(err))
    } finally {
      setLoadingAction(false)
    }
  }, [])

  const handleUpdateBarbero = useCallback(
    async (id: number, payload: DatosBarbero): Promise<string> => {
      setLoadingAction(true)
      try {
        const res = await barberosService.actualizarBarbero(id, payload)
        return res.message
      } catch (err) {
        throw new Error(getErrorMessage(err))
      } finally {
        setLoadingAction(false)
      }
    },
    []
  )

  const handleDeleteBarbero = useCallback(async (id: number): Promise<string> => {
    setLoadingAction(true)
    try {
      const res = await barberosService.eliminarBarbero(id)
      return res.message
    } catch (err) {
      throw new Error(getErrorMessage(err))
    } finally {
      setLoadingAction(false)
    }
  }, [])

  return {
    barberos,
    loadingLista,
    loadingAction,
    error,
    fetchBarberos,
    handleCreateBarbero,
    handleUpdateBarbero,
    handleDeleteBarbero,
  }
}
