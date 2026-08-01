"use client"

import { Suspense, useCallback, useState } from "react"
import { useSearchParams } from "next/navigation"
import { MotionConfig } from "motion/react"
import { RecuperarAcceso } from "@features/auth/components/RecuperarAcceso"
import { useAuth } from "@features/auth/hooks/useAuth"
import { ThemeToggle } from "@shared/layout/ThemeToggle"
import { notify } from "@shared/services/notify"
import { getErrorMessage } from "@shared/utils/error"
import type { DatosSolicitudRecuperacion } from "@features/auth/schemas/auth.schema"

/**
 * `useSearchParams` obliga a vivir bajo un `Suspense` o el build no prerenderiza.
 */
export default function RecuperarPage() {
  return (
    <Suspense>
      <ContenedorRecuperar />
    </Suspense>
  )
}

/**
 * Pedir el enlace para volver a entrar. Es la salida de quien no tiene a nadie
 * que le regenere la contraseña — al resto del staff se la vuelve a dar su admin
 * desde *Equipo*.
 *
 * El `slug` viaja para poder devolver a la puerta correcta: quien llegó desde
 * `/b/{slug}/entrar` tiene que volver ahí, no a la entrada global.
 */
function ContenedorRecuperar() {
  const parametros = useSearchParams()
  const slug = parametros.get("slug")
  const { loadingContrasena, handleSolicitarRecuperacionAuth } = useAuth()
  const [enviado, setEnviado] = useState(false)

  const volverA = slug ? `/b/${slug}/entrar` : "/entrar"

  const solicitar = useCallback(
    async (datos: DatosSolicitudRecuperacion) => {
      try {
        const mensaje = await handleSolicitarRecuperacionAuth(datos)
        setEnviado(true)
        notify.success(mensaje)
      } catch (err) {
        notify.error(getErrorMessage(err))
      }
    },
    [handleSolicitarRecuperacionAuth]
  )

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative">
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>
        <RecuperarAcceso
          cargando={loadingContrasena}
          enviado={enviado}
          volverA={volverA}
          onSubmit={solicitar}
        />
      </div>
    </MotionConfig>
  )
}
