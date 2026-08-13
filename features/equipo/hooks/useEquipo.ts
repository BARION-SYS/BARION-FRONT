"use client"

import { useCallback, useState } from "react"
import { equipoService } from "@features/equipo/services/equipo.service"
import { getErrorMessage } from "@shared/utils/error"
import type { DatosAltaMiembro, DatosCambioRol } from "@features/equipo/schemas/equipo.schema"
import type {
  AltaMiembro,
  FiltrosEquipo,
  Miembro,
  RevocacionMiembro,
} from "@features/equipo/types/equipo.types"

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

  /**
   * Devuelve el alta ENTERA y no solo el mensaje, a diferencia del resto de
   * mutaciones: la contraseña inicial viaja ahí y viaja una sola vez. Perderla
   * aquí obligaría a regenerarla antes de que nadie la haya usado.
   */
  const handleCreateMiembro = useCallback(
    async (payload: DatosAltaMiembro): Promise<AltaMiembro> => {
      setLoadingAction(true)
      try {
        const res = await equipoService.crearMiembro(payload)
        return res.data
      } catch (err) {
        throw new Error(getErrorMessage(err))
      } finally {
        setLoadingAction(false)
      }
    },
    []
  )

  /** Misma razón: lo que hay que enseñar es la contraseña, no el mensaje. */
  const handleRegenerateContrasenaMiembro = useCallback(
    async (membresiaId: string): Promise<string> => {
      setLoadingAction(true)
      try {
        const res = await equipoService.regenerarContrasena(membresiaId)
        return res.data.contrasenaInicial
      } catch (err) {
        throw new Error(getErrorMessage(err))
      } finally {
        setLoadingAction(false)
      }
    },
    []
  )

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

  /**
   * Devuelve la revocación entera y no solo el mensaje: quitar el acceso retira
   * también de la agenda, y sus citas futuras siguen en pie. Quien revoca tiene
   * que ver a cuántos clientes hay que llamar.
   */
  const handleRevokeMiembro = useCallback(
    async (membresiaId: string): Promise<{ mensaje: string; revocacion: RevocacionMiembro }> => {
      setLoadingAction(true)
      try {
        const res = await equipoService.revocarMiembro(membresiaId)
        return { mensaje: res.message, revocacion: res.data }
      } catch (err) {
        throw new Error(getErrorMessage(err))
      } finally {
        setLoadingAction(false)
      }
    },
    []
  )

  /** Otro enlace para poner la contraseña: los correos se pierden. */
  const handleResendInvitacion = useCallback(async (membresiaId: string): Promise<string> => {
    setLoadingAction(true)
    try {
      const res = await equipoService.reenviarInvitacion(membresiaId)
      return res.message
    } finally {
      setLoadingAction(false)
    }
  }, [])

  return {
    handleResendInvitacion,
    miembros,
    loadingLista,
    loadingAction,
    error,
    fetchMiembros,
    handleCreateMiembro,
    handleRegenerateContrasenaMiembro,
    handleChangeRolMiembro,
    handleRevokeMiembro,
  }
}
