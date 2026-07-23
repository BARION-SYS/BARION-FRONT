"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, MotionConfig, motion } from "motion/react"
import { Login } from "@features/auth/components/Login"
import { PanelMarca } from "@features/auth/components/PanelMarca"
import { useAuth } from "@features/auth/hooks/useAuth"
import { ThemeToggle } from "@shared/layout/ThemeToggle"
import type { DatosLogin } from "@features/auth/schemas/auth.schema"

// Contenedor: instancia el hook UNA vez y reparte datos + callbacks por props.
export default function LoginPage() {
  const router = useRouter()
  const { loadingLogin, error, handleLoginAuth } = useAuth()
  // Salida coordinada: al autenticar, la tarjeta anima su despedida y recién ahí navegamos.
  const [saliendo, setSaliendo] = useState(false)

  const onSubmitLogin = useCallback(
    async (datos: DatosLogin) => {
      try {
        await handleLoginAuth(datos)
        setSaliendo(true)
      } catch {
        // El error ya queda en `error` del hook y se muestra en el form.
      }
    },
    [handleLoginAuth]
  )

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
            {!saliendo && (
              <Login key="login" onSubmit={onSubmitLogin} cargando={loadingLogin} error={error} />
            )}
          </AnimatePresence>
        </main>
      </div>
    </MotionConfig>
  )
}
