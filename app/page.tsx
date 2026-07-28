"use client"

import { Suspense, useCallback, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AnimatePresence, MotionConfig, motion } from "motion/react"
import { Login } from "@features/auth/components/Login"
import { PanelMarca } from "@features/auth/components/PanelMarca"
import { SelectorBarberia } from "@features/auth/components/SelectorBarberia"
import { useAuth } from "@features/auth/hooks/useAuth"
import { ThemeToggle } from "@shared/layout/ThemeToggle"
import { mensajeDeErrorOauth } from "@features/auth/utils/errores-oauth"
import type { DatosLogin } from "@features/auth/schemas/auth.schema"

/**
 * `useSearchParams` obliga a que quien lo use viva bajo un `Suspense`: sin él,
 * Next no puede prerenderizar la página y el build falla. Se aísla en este
 * envoltorio para que el límite quede donde tiene que estar y no se pierda al
 * tocar el contenedor.
 */
export default function LoginPage() {
  return (
    <Suspense>
      <ContenedorLogin />
    </Suspense>
  )
}

/**
 * PUERTA GLOBAL. Es la de rescate: sirve a quien no recuerda la dirección de su
 * barbería y al staff de la plataforma, que no pertenece a ninguna.
 *
 * Por eso es la única que puede acabar pidiendo elegir — quien entra por
 * `/b/{slug}/entrar` trae la barbería resuelta desde la ruta.
 */
function ContenedorLogin() {
  const router = useRouter()
  const parametros = useSearchParams()
  const { barberiasParaElegir, loadingLogin, error, handleLoginAuth } = useAuth()

  // El acceso con Google vuelve al panel por una navegación, no por una petición
  // del código, así que su fallo no puede llegar por el estado del hook: viaja
  // en la URL. Sin esto la persona vuelve a la pantalla de entrada sin saber por
  // qué no entró.
  const errorOauth = mensajeDeErrorOauth(parametros.get("error"))
  // Salida coordinada: al autenticar, la tarjeta anima su despedida y recién ahí navegamos.
  const [saliendo, setSaliendo] = useState(false)
  // Se conservan para repetir el envío con la barbería elegida. Vive aquí y no
  // en el hook porque es estado de esta pantalla, no de la API.
  const [credenciales, setCredenciales] = useState<DatosLogin | null>(null)

  const entrar = useCallback(
    async (datos: DatosLogin, slug?: string) => {
      try {
        const haySesion = await handleLoginAuth(datos, slug)
        if (haySesion) setSaliendo(true)
      } catch {
        // El error ya queda en `error` del hook y se muestra en el form.
      }
    },
    [handleLoginAuth]
  )

  const onSubmitLogin = useCallback(
    async (datos: DatosLogin) => {
      setCredenciales(datos)
      await entrar(datos)
    },
    [entrar]
  )

  const onElegirBarberia = useCallback(
    (slug: string) => {
      if (credenciales) void entrar(credenciales, slug)
    },
    [credenciales, entrar]
  )

  const eligiendo = barberiasParaElegir.length > 0

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative flex min-h-dvh bg-background">
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>
        <PanelMarca />

        <main className="relative flex flex-1 items-center justify-center overflow-hidden p-6 sm:p-8">
          {/* Empapelado diagonal sutil, eco del panel de marca */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, var(--foreground) 0 2px, transparent 2px 26px)",
            }}
            aria-hidden
          />

          {/* Resplandor dorado con flotación lenta */}
          <motion.div
            className="pointer-events-none absolute -top-24 right-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl"
            animate={{ y: [0, 28, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden
          />

          <AnimatePresence onExitComplete={() => router.push("/dashboard")}>
            {!saliendo &&
              (eligiendo ? (
                <SelectorBarberia
                  key="selector"
                  barberias={barberiasParaElegir}
                  cargando={loadingLogin}
                  onElegir={onElegirBarberia}
                />
              ) : (
                <Login
                  key="login"
                  onSubmit={onSubmitLogin}
                  cargando={loadingLogin}
                  error={error ?? errorOauth}
                />
              ))}
          </AnimatePresence>
        </main>
      </div>
    </MotionConfig>
  )
}
