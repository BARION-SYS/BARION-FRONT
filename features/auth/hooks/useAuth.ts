"use client"

import { useCallback, useState } from "react"
import type { DatosLogin } from "@features/auth/schemas/auth.schema"
import { authService } from "@features/auth/services/auth.service"
import { useAuthStore } from "@store/auth.store"
import { getErrorMessage } from "@shared/utils/error"

// Solo estado de API. La sesión vive en el store global (auth.store) y entra
// ahí por UN solo camino: `fetchSesion`.
export function useAuth() {
  const setSesion = useAuthStore((s) => s.setSesion)
  const setHidratada = useAuthStore((s) => s.setHidratada)
  const limpiarSesion = useAuthStore((s) => s.cerrarSesion)
  const [loadingLogin, setLoadingLogin] = useState(false)
  const [loadingSesion, setLoadingSesion] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Autentica y NADA MÁS: al volver, la cookie está puesta y el store sigue
   * vacío. Quién entró lo resuelve `fetchSesion` contra `/auth/me`.
   *
   * No se llena el store con la respuesta del login a propósito: sería una
   * segunda fuente de la sesión, con su propia forma y congelada en el instante
   * de entrar. Con una sola, recargar la página y entrar por primera vez pasan
   * exactamente por el mismo camino — y lo que se rompa, se rompe en los dos.
   */
  const handleLoginAuth = useCallback(async (datos: DatosLogin): Promise<string> => {
    setLoadingLogin(true)
    setError(null)
    try {
      const res = await authService.login(datos)
      return res.message
    } catch (err) {
      setError(getErrorMessage(err))
      throw err
    } finally {
      setLoadingLogin(false)
    }
  }, [])

  /**
   * Resuelve la sesión desde la cookie. Es el ÚNICO camino por el que la sesión
   * entra al store: lo llama el AuthProvider al montar y después de entrar.
   *
   * Un 401 aquí es la respuesta NORMAL de quien no ha entrado: no es un error
   * que mostrar, solo significa que no hay sesión.
   */
  const fetchSesion = useCallback(async (): Promise<void> => {
    setLoadingSesion(true)
    try {
      const res = await authService.sesionActual()
      setSesion(res.data)
    } catch {
      limpiarSesion()
    } finally {
      setHidratada(true)
      setLoadingSesion(false)
    }
  }, [setSesion, setHidratada, limpiarSesion])

  /**
   * La cookie solo la puede borrar quien la puso, así que se limpia el estado
   * local pase lo que pase con la petición: si el servidor no responde, dejar la
   * sesión pintada sería peor que cerrarla de más.
   */
  const handleLogoutAuth = useCallback(async (): Promise<string> => {
    try {
      const res = await authService.logout()
      return res.message
    } finally {
      limpiarSesion()
    }
  }, [limpiarSesion])

  return {
    loadingLogin,
    loadingSesion,
    error,
    handleLoginAuth,
    handleLogoutAuth,
    fetchSesion,
  }
}
