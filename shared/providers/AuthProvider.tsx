"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@features/auth/hooks/useAuth"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"
import { useAuthStore } from "@store/auth.store"

/**
 * Compuerta de sesión del panel: pregunta `/auth/me` al montar y no deja pasar
 * a nadie sin sesión.
 *
 * Por qué aquí y no en el login: la cookie sobrevive a la recarga y el estado
 * del front no, así que entrar por primera vez y refrescar F5 tienen que acabar
 * en el mismo sitio. Colgando la sesión de este punto, los dos casos recorren el
 * MISMO camino — el login solo deja la cookie y se va.
 *
 * Los tres estados son distintos y se tratan distinto:
 *  · sin hidratar  → todavía no se sabe: skeleton. Redirigir aquí expulsaría al
 *    usuario en CADA recarga, con sesión válida y todo.
 *  · hidratada sin sesión → al login, reemplazando la entrada del historial para
 *    que el botón «atrás» no devuelva a un panel que no se puede ver.
 *  · hidratada con sesión → children.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { fetchSesion } = useAuth()
  const sesion = useAuthStore((s) => s.sesion)
  const hidratada = useAuthStore((s) => s.hidratada)

  useEffect(() => {
    void fetchSesion()
  }, [fetchSesion])

  useEffect(() => {
    if (hidratada && !sesion) router.replace("/")
  }, [hidratada, sesion, router])

  if (!hidratada || !sesion) {
    return (
      <div className="flex h-dvh flex-col gap-4 p-6">
        <DataSkeleton variant="stats" />
        <DataSkeleton variant="table" />
      </div>
    )
  }

  return <>{children}</>
}
