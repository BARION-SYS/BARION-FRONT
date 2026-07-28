"use client"

import { useCallback, useState } from "react"
import type { DatosLogin } from "@features/auth/schemas/auth.schema"
import type { BarberiaParaElegir } from "@features/auth/types/auth.types"
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
  // Dato de la API, no estado de UI: son las barberías que ella devuelve cuando
  // la cuenta tiene más de una y no se dijo por cuál puerta se entraba.
  const [barberiasParaElegir, setBarberiasParaElegir] = useState<BarberiaParaElegir[]>([])
  const [loadingSesion, setLoadingSesion] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Autentica y casi nada más: al volver, la cookie está puesta y el store
   * sigue vacío. Quién entró lo resuelve `fetchSesion` contra `/auth/me`.
   *
   * Devuelve si HAY sesión. Cuando la cuenta tiene varias barberías y no se
   * entró por la puerta de ninguna, la API responde con la lista en vez de con
   * una sesión: eso no es un error, es un paso más, y hasta que se elige no hay
   * cookie que valga.
   *
   * No se llena el store con la respuesta del login a propósito: sería una
   * segunda fuente de la sesión, con su propia forma y congelada en el instante
   * de entrar. Con una sola, recargar la página y entrar por primera vez pasan
   * exactamente por el mismo camino — y lo que se rompa, se rompe en los dos.
   */
  const handleLoginAuth = useCallback(
    async (datos: DatosLogin, slug?: string): Promise<boolean> => {
      setLoadingLogin(true)
      setError(null)
      try {
        const res = await authService.login(datos, slug)
        // Entrar por la puerta de una barbería nunca pide elegir; por la global
        // sí, cuando la persona trabaja en varias. Mientras haya que elegir NO
        // hay cookie, así que el contenedor no debe navegar al panel.
        if (res.data.requiereSeleccion) {
          setBarberiasParaElegir(res.data.barberias)
          return false
        }
        setBarberiasParaElegir([])
        return true
      } catch (err) {
        setError(getErrorMessage(err))
        throw err
      } finally {
        setLoadingLogin(false)
      }
    },
    []
  )

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
    barberiasParaElegir,
    loadingLogin,
    loadingSesion,
    error,
    handleLoginAuth,
    handleLogoutAuth,
    fetchSesion,
  }
}
