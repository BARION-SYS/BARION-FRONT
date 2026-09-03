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
      {/*
        Misma estructura que la puerta global: la ventana no crece, desplaza la
        columna del formulario. Centrar con `m-auto` y no con `items-center` es
        lo que permite alcanzar la tarjeta entera cuando la ventana es más baja
        que ella — con el centrado del flex, lo que sobresale por arriba se
        recorta y no hay scroll que lo devuelva.
      */}
      <div className="scroll-fino relative flex h-dvh flex-col overflow-y-auto">
        <div className="absolute top-4 right-4 z-20">
          <ThemeToggle />
        </div>

        <motion.div
          className="pointer-events-none absolute -top-24 right-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl"
          animate={{ y: [0, 28, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        />

        <div className="relative z-10 m-auto w-full max-w-md px-4 py-6 sm:px-6">
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
      </div>
    </MotionConfig>
  )
}
