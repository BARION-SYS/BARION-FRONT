"use client"

import { use, useEffect, useRef, useState } from "react"
import { MotionConfig } from "motion/react"
import {
  RegistroVerificacion,
  type EstadoVerificacion,
} from "@features/registro/components/RegistroVerificacion"
import { useRegistro } from "@features/registro/hooks/useRegistro"
import { ThemeToggle } from "@shared/layout/ThemeToggle"
import { getErrorMessage } from "@shared/utils/error"

/**
 * A dónde apunta el enlace del correo de registro.
 *
 * El token va en la RUTA y no en la query porque esto no es un formulario: lo
 * abre un navegador desde una bandeja de entrada, sin sesión.
 *
 * Confirmar aquí **abre el escaparate** `/b/{slug}`: hasta este momento el panel
 * funcionaba con normalidad pero la página pública no se servía a nadie.
 *
 * No abre sesión. Quien tenga el enlace de un correo ajeno no entra a nada.
 */
export default function VerificarRegistroPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const { handleVerificarCorreoRegistro } = useRegistro()

  const [estado, setEstado] = useState<EstadoVerificacion>("verificando")
  const [mensaje, setMensaje] = useState<string | null>(null)

  // El token es de un solo uso: en desarrollo React monta dos veces y el segundo
  // intento recibiría "enlace inservible" sobre una verificación que SÍ funcionó.
  const verificado = useRef(false)

  useEffect(() => {
    if (verificado.current) return
    verificado.current = true

    void handleVerificarCorreoRegistro(token)
      .then((respuesta) => {
        setMensaje(respuesta)
        setEstado("listo")
      })
      .catch((err: unknown) => {
        setMensaje(getErrorMessage(err))
        setEstado("invalido")
      })
  }, [handleVerificarCorreoRegistro, token])

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative">
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>
        <RegistroVerificacion estado={estado} mensaje={mensaje} />
      </div>
    </MotionConfig>
  )
}
