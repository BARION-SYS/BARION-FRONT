"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@features/auth/hooks/useAuth"
import { appDeSesion } from "@features/auth/utils/permisos"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"
import { useAuthStore } from "@store/auth.store"

/** A qué área pertenece el árbol que este provider protege. */
type Area = "panel" | "admin"

const RUTA_DE_AREA: Record<string, string> = {
  panel: "/dashboard",
  admin: "/admin",
  portal: "/",
}

/**
 * Compuerta de sesión: pregunta `/auth/me` al montar y no deja pasar a nadie sin
 * sesión — ni a quien tiene una sesión de otro tipo.
 *
 * Por qué aquí y no en el login: la cookie sobrevive a la recarga y el estado
 * del front no, así que entrar por primera vez y refrescar F5 tienen que acabar
 * en el mismo sitio. Colgando la sesión de este punto, los dos casos recorren el
 * MISMO camino — el login solo deja la cookie y se va.
 *
 * Los cuatro estados son distintos y se tratan distinto:
 *  · sin hidratar → todavía no se sabe: skeleton. Redirigir aquí expulsaría al
 *    usuario en CADA recarga, con sesión válida y todo.
 *  · hidratada sin sesión → al login, reemplazando la entrada del historial para
 *    que el botón «atrás» no devuelva a un panel que no se puede ver.
 *  · hidratada con sesión de OTRA área → a la suya. El staff de Barion no tiene
 *    barbería y el panel se le pintaría vacío; un propietario en el área de
 *    plataforma recibiría un 403 en cada llamada.
 *  · hidratada y en su área → children.
 */
export function AuthProvider({
  children,
  area = "panel",
}: {
  children: React.ReactNode
  area?: Area
}) {
  const router = useRouter()
  const { fetchSesion } = useAuth()
  const sesion = useAuthStore((s) => s.sesion)
  const hidratada = useAuthStore((s) => s.hidratada)

  const areaDeLaSesion = appDeSesion(sesion)
  const enSuArea = areaDeLaSesion === area

  useEffect(() => {
    void fetchSesion()
  }, [fetchSesion])

  useEffect(() => {
    if (!hidratada) return
    if (!sesion) {
      router.replace("/")
      return
    }
    if (!enSuArea && areaDeLaSesion) {
      router.replace(RUTA_DE_AREA[areaDeLaSesion] ?? "/")
    }
  }, [hidratada, sesion, enSuArea, areaDeLaSesion, router])

  if (!hidratada || !sesion || !enSuArea) {
    return (
      <div className="flex h-dvh flex-col gap-4 p-6">
        <DataSkeleton variant="stats" />
        <DataSkeleton variant="table" />
      </div>
    )
  }

  return <>{children}</>
}
