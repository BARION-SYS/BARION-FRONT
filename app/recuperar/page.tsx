"use client"

import { Suspense, useCallback, useState } from "react"
import { useSearchParams } from "next/navigation"
import { AnimatePresence } from "motion/react"
import { PuertaAcceso } from "@features/auth/components/PuertaAcceso"
import { RecuperarAcceso } from "@features/auth/components/RecuperarAcceso"
import { useAuth } from "@features/auth/hooks/useAuth"
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
  // A qué correo se pidió. Se guarda para decírselo en la confirmación: «revisa
  // tu correo» sin decir cuál no le sirve a quien tiene dos.
  const [correoEnviado, setCorreoEnviado] = useState<string | null>(null)

  const volverA = slug ? `/b/${slug}/entrar` : "/entrar"

  const solicitar = useCallback(
    async (datos: DatosSolicitudRecuperacion) => {
      try {
        await handleSolicitarRecuperacionAuth(datos)
        // Sin aviso flotante: la tarjeta entera pasa a la confirmación, y un
        // segundo mensaje diciendo lo mismo es ruido.
        setCorreoEnviado(datos.email.trim())
      } catch (err) {
        notify.error(getErrorMessage(err))
      }
    },
    [handleSolicitarRecuperacionAuth]
  )

  return (
    <PuertaAcceso>
      <AnimatePresence mode="wait">
        <RecuperarAcceso
          key={correoEnviado ? "enviado" : "pedir"}
          cargando={loadingContrasena}
          correoEnviado={correoEnviado}
          volverA={volverA}
          onSubmit={solicitar}
          onOtroCorreo={() => setCorreoEnviado(null)}
        />
      </AnimatePresence>
    </PuertaAcceso>
  )
}
