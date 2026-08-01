"use client"

import { useCallback, useState } from "react"
import { citasService } from "@features/citas/services/citas.service"
import { getErrorMessage } from "@shared/utils/error"
import type {
  DatosCita,
  DatosEstadoCita,
  DatosReprogramar,
} from "@features/citas/schemas/citas.schema"
import type {
  AsientoHistorialCita,
  Cita,
  Disponibilidad,
  FiltrosCitas,
} from "@features/citas/types/citas.types"

/**
 * Solo estado de API — el estado de UI (vista, semana activa, selección,
 * modales) vive en el padre.
 *
 * La disponibilidad va aquí y no en una feature aparte: no existe sin lo que se
 * quiere reservar, y quien la pide es el mismo formulario que crea la cita.
 */
export function useCitas() {
  const [citas, setCitas] = useState<Cita[]>([])
  const [disponibilidad, setDisponibilidad] = useState<Disponibilidad | null>(null)
  const [historial, setHistorial] = useState<AsientoHistorialCita[]>([])
  const [loadingLista, setLoadingLista] = useState(false)
  const [loadingDisponibilidad, setLoadingDisponibilidad] = useState(false)
  const [loadingAction, setLoadingAction] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCitas = useCallback(async (filtros: FiltrosCitas = {}) => {
    setLoadingLista(true)
    setError(null)
    try {
      // `paginar=false`: la grilla pinta la ventana entera, y pedirla por
      // páginas dejaría media semana sin citas hasta el segundo viaje.
      const res = await citasService.obtenerCitas({ paginar: false, ...filtros })
      setCitas(res.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingLista(false)
    }
  }, [])

  const fetchDisponibilidad = useCallback(
    async (params: {
      sedeId: string
      ofertaIds: string[]
      desde: string
      barberoId?: string
      dias?: number
    }) => {
      setLoadingDisponibilidad(true)
      try {
        const res = await citasService.obtenerDisponibilidad(params)
        setDisponibilidad(res.data)
      } catch (err) {
        setError(getErrorMessage(err))
        setDisponibilidad(null)
      } finally {
        setLoadingDisponibilidad(false)
      }
    },
    []
  )

  const limpiarDisponibilidad = useCallback(() => setDisponibilidad(null), [])

  const fetchHistorial = useCallback(async (citaId: string) => {
    try {
      const res = await citasService.obtenerHistorial(citaId)
      setHistorial(res.data)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }, [])

  const handleCreateCita = useCallback(async (payload: DatosCita): Promise<string> => {
    setLoadingAction(true)
    try {
      const res = await citasService.crearCita(payload)
      return res.message
    } catch (err) {
      // Un 409 aquí significa que alguien se adelantó: el mensaje de la api ya
      // lo dice, y el padre vuelve a pedir disponibilidad.
      throw new Error(getErrorMessage(err))
    } finally {
      setLoadingAction(false)
    }
  }, [])

  const handleReprogramarCita = useCallback(
    async (citaId: string, payload: DatosReprogramar): Promise<string> => {
      setLoadingAction(true)
      try {
        const res = await citasService.reprogramarCita(citaId, payload)
        return res.message
      } catch (err) {
        throw new Error(getErrorMessage(err))
      } finally {
        setLoadingAction(false)
      }
    },
    []
  )

  const handleCambiarEstadoCita = useCallback(
    async (citaId: string, payload: DatosEstadoCita): Promise<string> => {
      setLoadingAction(true)
      try {
        const res = await citasService.cambiarEstadoCita(citaId, payload)
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
    citas,
    disponibilidad,
    historial,
    loadingLista,
    loadingDisponibilidad,
    loadingAction,
    error,
    fetchCitas,
    fetchDisponibilidad,
    limpiarDisponibilidad,
    fetchHistorial,
    handleCreateCita,
    handleReprogramarCita,
    handleCambiarEstadoCita,
  }
}
