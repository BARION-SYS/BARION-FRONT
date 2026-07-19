"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { Scissors } from "lucide-react"
import { Login } from "@features/auth/components/Login"
import { PanelMarca } from "@features/auth/components/PanelMarca"
import { useAuth } from "@features/auth/hooks/useAuth"
import { ThemeToggle } from "@shared/layout/ThemeToggle"
import type { DatosLogin } from "@features/auth/schemas/auth.schema"

// Contenedor: instancia el hook UNA vez y reparte datos + callbacks por props.
export default function LoginPage() {
  const router = useRouter()
  const { loadingLogin, error, handleLoginAuth } = useAuth()

  const onSubmitLogin = useCallback(
    async (datos: DatosLogin) => {
      try {
        await handleLoginAuth(datos)
        router.push("/dashboard")
      } catch {
        // El error ya queda en `error` del hook y se muestra en el form.
      }
    },
    [handleLoginAuth, router]
  )

  return (
    <div className="relative flex min-h-dvh bg-background">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      <PanelMarca />

      <div className="flex flex-1 flex-col items-center justify-center p-8">
        <div className="mb-8 flex w-full max-w-sm items-center gap-2 self-start lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Scissors className="h-4 w-4 text-primary-foreground" aria-hidden />
          </div>
          <span className="text-base font-bold text-foreground">TRIMLY</span>
        </div>
        <Login onSubmit={onSubmitLogin} cargando={loadingLogin} error={error} />
      </div>
    </div>
  )
}
