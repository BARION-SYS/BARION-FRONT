"use client"

import { Suspense, useCallback, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { MotionConfig } from "motion/react"
import { NuevaContrasena } from "@features/auth/components/NuevaContrasena"
import { useAuth } from "@features/auth/hooks/useAuth"
import { ThemeToggle } from "@shared/layout/ThemeToggle"
import { notify } from "@shared/services/notify"
import { getErrorMessage } from "@shared/utils/error"
import type { DatosNuevaContrasena } from "@features/auth/schemas/auth.schema"

export default function ConfirmarRecuperacionPage() {
  return (
    <Suspense>
      <ContenedorConfirmar />
    </Suspense>
  )
}

/**
 * A dónde apunta el enlace del correo. El token viaja en la dirección y no se
 * teclea: la página lo entrega al formulario, que solo pide la contraseña.
 *
 * Al guardarla NO se abre sesión: la contraseña nueva se usa para entrar por la
 * puerta de siempre. Abrirla aquí daría acceso a cualquiera que abriera el
 * enlace desde un correo ajeno.
 */
function ContenedorConfirmar() {
  const router = useRouter()
  const parametros = useSearchParams()
  const token = parametros.get("token") ?? ""
  const slug = parametros.get("slug")
  const { loadingContrasena, handleConfirmarRecuperacionAuth } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const guardar = useCallback(
    async (datos: DatosNuevaContrasena) => {
      setError(null)
      try {
        const mensaje = await handleConfirmarRecuperacionAuth(token, datos)
        notify.success(mensaje)
        router.replace(slug ? `/b/${slug}/entrar` : "/entrar")
      } catch (err) {
        setError(getErrorMessage(err))
      }
    },
    [handleConfirmarRecuperacionAuth, token, slug, router]
  )

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative">
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>
        <NuevaContrasena
          tokenPresente={token.length > 0}
          cargando={loadingContrasena}
          error={error}
          onSubmit={guardar}
        />
      </div>
    </MotionConfig>
  )
}
