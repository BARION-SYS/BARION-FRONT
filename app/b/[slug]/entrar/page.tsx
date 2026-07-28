"use client"

import { Suspense, use, useCallback, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AnimatePresence, MotionConfig, motion } from "motion/react"
import { Login } from "@features/auth/components/Login"
import { useAuth } from "@features/auth/hooks/useAuth"
import { mensajeDeErrorOauth } from "@features/auth/utils/errores-oauth"
import { ThemeToggle } from "@shared/layout/ThemeToggle"
import type { DatosLogin } from "@features/auth/schemas/auth.schema"

/**
 * PUERTA DE UNA BARBERÍA — `/b/{slug}/entrar`.
 *
 * La barbería sale de la RUTA y jamás de un campo del formulario: la persona
 * escribe correo y contraseña, igual que siempre, y el identificador viaja como
 * contexto. Eso es lo que permite que el mismo correo trabaje en dos barberías
 * sin ambigüedad — lo que decide a dónde entra es la puerta, no el correo.
 *
 * Aquí NUNCA hay que elegir barbería: ya está elegida. El selector solo aparece
 * en la puerta global.
 *
 * El identificador no es un secreto ni concede nada: el portal ya lo publica.
 * Entrar sigue exigiendo credenciales válidas y acceso activo en esa barbería.
 */
export default function EntrarBarberiaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  return (
    <Suspense>
      <ContenedorEntrar slug={slug} />
    </Suspense>
  )
}

function ContenedorEntrar({ slug }: { slug: string }) {
  const router = useRouter()
  const parametros = useSearchParams()
  const { loadingLogin, error, handleLoginAuth } = useAuth()

  const errorOauth = mensajeDeErrorOauth(parametros.get("error"))
  const [saliendo, setSaliendo] = useState(false)

  const onSubmitLogin = useCallback(
    async (datos: DatosLogin) => {
      try {
        // Con la barbería resuelta la respuesta nunca pide elegir, así que el
        // valor de vuelta siempre es «hay sesión».
        await handleLoginAuth(datos, slug)
        setSaliendo(true)
      } catch {
        // El error ya queda en `error` del hook y se muestra en el form.
      }
    },
    [handleLoginAuth, slug]
  )

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative flex min-h-dvh items-center justify-center overflow-hidden p-6 sm:p-8">
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>

        <motion.div
          className="pointer-events-none absolute -top-24 right-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl"
          animate={{ y: [0, 28, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        />

        <AnimatePresence onExitComplete={() => router.push("/dashboard")}>
          {!saliendo && (
            <Login
              key="login"
              onSubmit={onSubmitLogin}
              cargando={loadingLogin}
              error={error ?? errorOauth}
              slug={slug}
            />
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  )
}
