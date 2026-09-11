"use client"

import { Suspense, useCallback, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { NuevaContrasena } from "@features/auth/components/NuevaContrasena"
import { PuertaAcceso } from "@features/auth/components/PuertaAcceso"
import { useAuth } from "@features/auth/hooks/useAuth"
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
        const { mensaje, slug: suya } = await handleConfirmarRecuperacionAuth(token, datos)
        notify.success(mensaje)
        // El de la dirección manda —viene de la puerta por la que se pidió— y
        // detrás el que devuelve la api, que es el del propio enlace: el correo
        // no puede llevarlo porque se emite antes de saber por dónde se abrirá.
        const puerta = slug || suya
        router.replace(puerta ? `/b/${puerta}/entrar` : "/entrar")
      } catch (err) {
        setError(getErrorMessage(err))
      }
    },
    [handleConfirmarRecuperacionAuth, token, slug, router]
  )

  return (
    <PuertaAcceso>
      <NuevaContrasena
        tokenPresente={token.length > 0}
        cargando={loadingContrasena}
        error={error}
        onSubmit={guardar}
      />
    </PuertaAcceso>
  )
}
