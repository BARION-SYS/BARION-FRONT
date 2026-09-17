"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { CambioObligatorio } from "@features/auth/components/CambioObligatorio"
import { useAuth } from "@features/auth/hooks/useAuth"
import { appDeSesion } from "@features/auth/utils/permisos"
import { obtenerRutaActiva, rutasDe, rutasVisibles } from "@routes/rutasDashboard"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"
import { notify } from "@shared/services/notify"
import { getErrorMessage } from "@shared/utils/error"
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
 *
 * Y una quinta, que se comprueba antes que el área: la sesión que arrastra una
 * contraseña puesta por otro. Ahí la API responde 403 a todo lo demás, así que
 * en lugar de navegar a una ruta —que también sería una ruta bloqueada— se pinta
 * la pantalla de cambio EN LUGAR del panel. La dirección no cambia; lo que no se
 * pinta es nada más.
 */
export function AuthProvider({
  children,
  area = "panel",
}: {
  children: React.ReactNode
  area?: Area
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { fetchSesion, handleCambiarContrasenaAuth, handleLogoutAuth, loadingContrasena } =
    useAuth()
  const sesion = useAuthStore((s) => s.sesion)
  const hidratada = useAuthStore((s) => s.hidratada)
  // UI state de la pantalla de cambio obligatorio: vive en el padre, que es
  // quien hace la mutación, y el formulario solo lo pinta.
  const [errorCambio, setErrorCambio] = useState<string | null>(null)

  const areaDeLaSesion = appDeSesion(sesion)
  const enSuArea = areaDeLaSesion === area

  // Ocultar la entrada del menú no impide escribir la dirección a mano. Aquí se
  // cierra el otro lado: una sección que esta sesión no puede abrir devuelve a
  // la primera que sí. Sigue sin ser la defensa real —esa es la API, que
  // revalida el permiso en cada petición— pero evita una pantalla de errores.
  const visibles = rutasVisibles(rutasDe(pathname), sesion?.permisos ?? [])
  const rutaActual = obtenerRutaActiva(pathname)
  const puedeVerla = !rutaActual || visibles.some((r) => r.href === rutaActual.href)

  useEffect(() => {
    void fetchSesion()
  }, [fetchSesion])

  useEffect(() => {
    if (!hidratada) return
    if (!sesion) {
      router.replace("/entrar")
      return
    }
    if (!enSuArea && areaDeLaSesion) {
      router.replace(RUTA_DE_AREA[areaDeLaSesion] ?? "/")
      return
    }
    // Sin ninguna sección visible no hay a dónde mandarla: se deja pasar y que
    // la API responda. Redirigir en bucle sería peor que una pantalla vacía.
    if (!puedeVerla && visibles.length > 0) {
      router.replace(visibles[0].href)
    }
  }, [hidratada, sesion, enSuArea, areaDeLaSesion, puedeVerla, visibles, router])

  if (!hidratada || !sesion || !enSuArea) {
    return (
      <div className="flex h-dvh flex-col gap-4 p-6">
        <DataSkeleton variant="stats" />
        <DataSkeleton variant="table" />
      </div>
    )
  }

  if (sesion.debeCambiarContrasena) {
    return (
      <CambioObligatorio
        nombre={sesion.usuario.nombre}
        email={sesion.usuario.email}
        exigeActual={sesion.exigeContrasenaActual}
        cargando={loadingContrasena}
        error={errorCambio}
        onSubmit={async (datos) => {
          // El rechazo se CAPTURA aquí: sin esto la promesa rechazada acababa
          // dentro del `void handleSubmit(...)` del formulario, y una contraseña
          // actual equivocada no dejaba nada en pantalla — el botón volvía a
          // estar listo como si no hubiera pasado nada.
          setErrorCambio(null)
          try {
            const mensaje = await handleCambiarContrasenaAuth(datos, {
              exigeActual: sesion.exigeContrasenaActual,
            })
            notify.success(mensaje)
          } catch (err) {
            setErrorCambio(getErrorMessage(err))
          }
        }}
        onSalir={() => {
          void handleLogoutAuth().then(() => router.replace("/entrar"))
        }}
      />
    )
  }

  return <>{children}</>
}
