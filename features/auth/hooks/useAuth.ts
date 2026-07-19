"use client"

import { useCallback, useState } from "react"
import type { DatosLogin } from "@features/auth/schemas/auth.schema"
import { authService } from "@features/auth/services/auth.service"
import { useAuthStore } from "@store/auth.store"
import { getErrorMessage } from "@shared/utils/error"

// Solo estado de API — lo instancia SOLO el contenedor (app/page.tsx).
// La sesión vive en el store global (auth.store).
export function useAuth() {
  const setSesion = useAuthStore((s) => s.setSesion)
  const [loadingLogin, setLoadingLogin] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLoginAuth = useCallback(
    async (datos: DatosLogin): Promise<string> => {
      setLoadingLogin(true)
      setError(null)
      try {
        const res = await authService.login(datos)
        setSesion(res.data)
        return res.message
      } catch (err) {
        setError(getErrorMessage(err))
        throw err
      } finally {
        setLoadingLogin(false)
      }
    },
    [setSesion]
  )

  return { loadingLogin, error, handleLoginAuth }
}
