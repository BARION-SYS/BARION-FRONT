"use client"

import { useCallback, useState } from "react"
import { equipoService } from "@features/equipo/services/equipo.service"
import { getErrorMessage } from "@shared/utils/error"
import type { DatosCambioRol, DatosInvitacion } from "@features/equipo/schemas/equipo.schema"
import type { FiltrosEquipo, Miembro } from "@features/equipo/types/equipo.types"

export function useEquipo() {
  const [miembros, setMiembros] = useState<Miembro[]>([])
  const [loadingLista, setLoadingLista] = useState(false)
  const [loadingAction, setLoadingAction] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMiembros = useCallback(async (filtros: FiltrosEquipo = {}) => {
    setLoadingLista(true)
    setError(null)
    try {
      const res = await equipoService.obtenerMiembros(filtros)
      setMiembros(res.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingLista(false)
    }
  }, [])

  const handleInviteMiembro = useCallback(async (payload: DatosInvitacion): Promise<string> => {
    setLoadingAction(true)
    try {
      const res = await equipoService.invitarMiembro(payload)
      return res.message
    } catch (err) {
      throw new Error(getErrorMessage(err))
    } finally {
      setLoadingAction(false)
    }
  }, [])

  const handleChangeRolMiembro = useCallback(
    async (membresiaId: string, payload: DatosCambioRol): Promise<string> => {
      setLoadingAction(true)
      try {
        const res = await equipoService.cambiarRolMiembro(membresiaId, payload)
        return res.message
      } catch (err) {
        throw new Error(getErrorMessage(err))
      } finally {
        setLoadingAction(false)
      }
    },
    []
  )

  const handleRevokeMiembro = useCallback(async (membresiaId: string): Promise<string> => {
    setLoadingAction(true)
    try {
      const res = await equipoService.revocarMiembro(membresiaId)
      return res.message
    } catch (err) {
      throw new Error(getErrorMessage(err))
    } finally {
      setLoadingAction(false)
    }
  }, [])

  return {
    miembros,
    loadingLista,
    loadingAction,
    error,
    fetchMiembros,
    handleInviteMiembro,
    handleChangeRolMiembro,
    handleRevokeMiembro,
  }
}
