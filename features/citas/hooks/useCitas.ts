"use client"

import { useCallback, useState } from "react"
import { citasService } from "@features/citas/services/citas.service"
import { getErrorMessage } from "@shared/utils/error"
import type { DatosCita } from "@features/citas/schemas/citas.schema"
import type { CitaCalendario, SemanaCalendario } from "@features/citas/types/citas.types"

// Solo estado de API — el estado de UI vive en el contenedor que lo instancia.
export function useCitas() {
  const [semana, setSemana] = useState<SemanaCalendario | null>(null)
  const [citas, setCitas] = useState<CitaCalendario[]>([])
  const [loadingCitas, setLoadingCitas] = useState(false)
  const [loadingAction, setLoadingAction] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCitas = useCallback(async () => {
    setLoadingCitas(true)
    setError(null)
    try {
      const [resSemana, resCitas] = await Promise.all([
        citasService.obtenerSemanaCalendario(),
        citasService.obtenerCitasCalendario(),
      ])
      setSemana(resSemana.data)
      setCitas(resCitas.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingCitas(false)
    }
  }, [])

  const handleCreateCita = useCallback(async (payload: DatosCita): Promise<string> => {
    setLoadingAction(true)
    try {
      const res = await citasService.crearCita(payload)
      return res.message
    } catch (err) {
      setError(getErrorMessage(err))
      throw err
    } finally {
      setLoadingAction(false)
    }
  }, [])

  const handleReagendarCita = useCallback(
    async (id: number, payload: DatosCita): Promise<string> => {
      setLoadingAction(true)
      try {
        const res = await citasService.reagendarCita(id, payload)
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

  const handleCancelarCita = useCallback(async (id: number): Promise<string> => {
    setLoadingAction(true)
    try {
      const res = await citasService.cancelarCita(id)
      return res.message
    } catch (err) {
      setError(getErrorMessage(err))
      throw err
    } finally {
      setLoadingAction(false)
    }
  }, [])

  const handleDeleteCita = useCallback(async (id: number): Promise<string> => {
    setLoadingAction(true)
    try {
      const res = await citasService.eliminarCita(id)
      return res.message
    } catch (err) {
      setError(getErrorMessage(err))
      throw err
    } finally {
      setLoadingAction(false)
    }
  }, [])

  return {
    semana,
    citas,
    loadingCitas,
    loadingAction,
    error,
    fetchCitas,
    handleCreateCita,
    handleReagendarCita,
    handleCancelarCita,
    handleDeleteCita,
  }
}
