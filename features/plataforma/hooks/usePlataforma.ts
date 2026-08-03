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
  PlanPlataforma,
} from "@features/plataforma/types/plataforma.types"
import type { PaginationInfo } from "@shared/types/api.types"

// Solo estado de API — el estado de UI (modales, filtros, selección) vive en el
// contenedor.
export function usePlataforma() {
  const [barberias, setBarberias] = useState<BarberiaInventario[]>([])
  const [paginacion, setPaginacion] = useState<PaginationInfo | null>(null)
  const [total, setTotal] = useState(0)
  // La ficha de la barbería abierta. Es una lectura aparte porque la fila de la
  // lista no trae ni su huso, ni su moneda, ni cuándo se le acaba la prueba.
  const [ficha, setFicha] = useState<BarberiaFicha | null>(null)
  const [planes, setPlanes] = useState<PlanPlataforma[]>([])
  // La barbería recién creada: de ella sale el enlace que se le entrega al
  // cliente. Es dato de la API, no estado de pantalla.
  const [recienCreada, setRecienCreada] = useState<BarberiaFicha | null>(null)
  const [loadingLista, setLoadingLista] = useState(false)
  const [loadingFicha, setLoadingFicha] = useState(false)
  const [loadingPlanes, setLoadingPlanes] = useState(false)
  const [loadingAction, setLoadingAction] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBarberias = useCallback(async (filtros: FiltrosInventario = {}) => {
    setLoadingLista(true)
    setError(null)
    try {
      const res = await plataformaService.obtenerBarberias(filtros)
      setBarberias(res.data)
      setPaginacion(res.pagination ?? null)
      setTotal(res.pagination?.total ?? res.data.length)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingLista(false)
    }
  }, [])

  const fetchBarberia = useCallback(async (id: string) => {
    setLoadingFicha(true)
    try {
      const res = await plataformaService.obtenerBarberia(id)
      setFicha(res.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingFicha(false)
    }
  }, [])

  const fetchPlanes = useCallback(async () => {
    setLoadingPlanes(true)
    try {
      const res = await plataformaService.obtenerPlanes()
      setPlanes(res.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingPlanes(false)
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
        // La respuesta ES la ficha actualizada: si la abierta es esa, se
        // refresca sin una segunda vuelta a la API.
        setFicha((actual) => (actual?.id === id ? res.data : actual))
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

  /** Cierra la ficha. Se limpia para que la siguiente no enseñe la anterior. */
  const limpiarFicha = useCallback(() => setFicha(null), [])

  return {
    barberias,
    paginacion,
    total,
    ficha,
    planes,
    recienCreada,
    loadingLista,
    loadingFicha,
    loadingPlanes,
    loadingAction,
    error,
    fetchBarberias,
    fetchBarberia,
    fetchPlanes,
    handleCreateBarberia,
    handleChangeEstadoBarberia,
    limpiarRecienCreada,
    limpiarFicha,
  }
}
