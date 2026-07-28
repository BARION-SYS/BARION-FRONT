"use client"

import { useCallback, useState } from "react"
import { plataformaService } from "@features/plataforma/services/plataforma.service"
import { getErrorMessage } from "@shared/utils/error"
import type {
  DatosAltaBarberia,
  DatosCambioEstado,
} from "@features/plataforma/schemas/plataforma.schema"
import type {
  BarberiaFicha,
  BarberiaInventario,
  FiltrosInventario,
} from "@features/plataforma/types/plataforma.types"

// Solo estado de API — el estado de UI (modales, filtros, selección) vive en el
// contenedor.
export function usePlataforma() {
  const [barberias, setBarberias] = useState<BarberiaInventario[]>([])
  const [total, setTotal] = useState(0)
  // La barbería recién creada: de ella sale el enlace que se le entrega al
  // cliente. Es dato de la API, no estado de pantalla.
  const [recienCreada, setRecienCreada] = useState<BarberiaFicha | null>(null)
  const [loadingLista, setLoadingLista] = useState(false)
  const [loadingAction, setLoadingAction] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBarberias = useCallback(async (filtros: FiltrosInventario = {}) => {
    setLoadingLista(true)
    setError(null)
    try {
      const res = await plataformaService.obtenerBarberias(filtros)
      setBarberias(res.data)
      setTotal(res.pagination?.total ?? res.data.length)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingLista(false)
    }
  }, [])

  const handleCreateBarberia = useCallback(async (payload: DatosAltaBarberia): Promise<string> => {
    setLoadingAction(true)
    try {
      const res = await plataformaService.crearBarberia(payload)
      setRecienCreada(res.data)
      return res.message
    } catch (err) {
      throw new Error(getErrorMessage(err))
    } finally {
      setLoadingAction(false)
    }
  }, [])

  const handleChangeEstadoBarberia = useCallback(
    async (id: string, payload: DatosCambioEstado): Promise<string> => {
      setLoadingAction(true)
      try {
        const res = await plataformaService.cambiarEstadoBarberia(id, payload)
        return res.message
      } catch (err) {
        throw new Error(getErrorMessage(err))
      } finally {
        setLoadingAction(false)
      }
    },
    []
  )

  /** Cierra la entrega: la barbería ya se comunicó y vuelve al inventario. */
  const limpiarRecienCreada = useCallback(() => setRecienCreada(null), [])

  return {
    barberias,
    total,
    recienCreada,
    loadingLista,
    loadingAction,
    error,
    fetchBarberias,
    handleCreateBarberia,
    handleChangeEstadoBarberia,
    limpiarRecienCreada,
  }
}
