"use client"

import { Suspense, useCallback, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AnimatePresence, MotionConfig, motion } from "motion/react"
import { Login } from "@features/auth/components/Login"
import { PanelMarca } from "@features/auth/components/PanelMarca"
import { SelectorBarberia } from "@features/auth/components/SelectorBarberia"
import { useAuth } from "@features/auth/hooks/useAuth"
import { appDeSesion } from "@features/auth/utils/permisos"
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
  const { barberiasParaElegir, loadingLogin, error, handleLoginAuth, fetchSesion } = useAuth()

  // El acceso con Google vuelve al panel por una navegación, no por una petición
  // del código, así que su fallo no puede llegar por el estado del hook: viaja
  // en la URL. Sin esto la persona vuelve a la pantalla de entrada sin saber por
  // qué no entró.
  const errorOauth = mensajeDeErrorOauth(parametros.get("error"))
  // Salida coordinada: al autenticar, la tarjeta anima su despedida y recién ahí navegamos.
  const [saliendo, setSaliendo] = useState(false)
  const [destino, setDestino] = useState("/dashboard")
  // Se conservan para repetir el envío con la barbería elegida. Vive aquí y no
  // en el hook porque es estado de esta pantalla, no de la API.
  const [credenciales, setCredenciales] = useState<DatosLogin | null>(null)

  const entrar = useCallback(
    async (datos: DatosLogin, slug?: string) => {
      try {
        const haySesion = await handleLoginAuth(datos, slug)
        if (!haySesion) return
        // A dónde entra lo decide el TIPO de actor, no la ruta desde la que
        // llamó: el staff de Barion no tiene barbería y el panel se le pintaría
        // vacío. Se resuelve aquí, con la sesión ya en la mano, en vez de
        // navegar y que el área de destino rebote.
        const sesion = await fetchSesion()
        setDestino(appDeSesion(sesion) === "admin" ? "/admin" : "/dashboard")
        setSaliendo(true)
      } catch {
        // El error ya queda en `error` del hook y se muestra en el form.
      }
    },
    [handleLoginAuth, fetchSesion]
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
      {/*
        La pantalla ocupa la ventana exacta y quien desplaza, si hace falta, es
        la columna del formulario — no la página. Antes crecía con `min-h-dvh` y
        la tarjeta empujaba el documento entero: en un portátil de 768px el
        botón de entrar quedaba por debajo del borde y la mitad de marca se iba
        con él. Y el `overflow-hidden` que envolvía el formulario no salvaba
        nada: recortaba lo que sobresalía en vez de dejar llegar hasta ello.

        `m-auto` en el envoltorio de la tarjeta centra mientras sobra sitio y
        deja de centrar cuando no — con `items-center` el desbordamiento se
        recorta por arriba y esa parte no se puede alcanzar con el scroll.
      */}
      <div className="relative flex h-dvh overflow-hidden bg-background">
        <div className="absolute top-4 right-4 z-20">
          <ThemeToggle />
        </div>
        <PanelMarca />

        <main className="scroll-fino relative flex flex-1 flex-col overflow-y-auto">
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

          <div className="relative z-10 m-auto w-full max-w-md px-4 py-6 sm:px-6">
            <AnimatePresence onExitComplete={() => router.push(destino)}>
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
          </div>
        </main>
      </div>
    </MotionConfig>
  )
}
