"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { ArrowRight, Loader2 } from "lucide-react"
import { PuertaAcceso } from "@features/auth/components/PuertaAcceso"
import { useAuth } from "@features/auth/hooks/useAuth"
import { buttonVariants } from "@shared/components/ui/button"
import { useTextos } from "@shared/textos/useTextos"
import { rutasPublicas } from "@routes/rutasPublicas"
import { cn } from "@shared/utils/cn"

/**
 * ENTRADA DE UN CLIC A LA DEMO. Es el destino del «Ver demo» del sitio.
 *
 * Hasta ahora la demo solo se abría con el botón del talón de `/entrar`, y quien
 * venía de la página de venta tenía que encontrarlo ahí. Esta ruta pide la
 * sesión de solo lectura en cuanto se abre y entra al panel: el visitante no ve
 * ni un formulario.
 *
 * Usa el mismo `POST /auth/demo` que el botón. Si la API no la ofrece en este
 * entorno (404) o falla, se queda aquí con la salida a la puerta normal y al
 * registro, en vez de rebotar a una pantalla que no explica nada.
 *
 * El `useRef` evita la doble petición del modo estricto de React en desarrollo:
 * dos sesiones seguidas no rompen nada, pero gastan el límite por IP.
 */
export default function DemoPage() {
  const router = useRouter()
  const t = useTextos()
  const { handleEntrarDemoAuth, fetchSesion } = useAuth()
  const pedida = useRef(false)
  const [fallo, setFallo] = useState(false)

  useEffect(() => {
    if (pedida.current) return
    pedida.current = true
    void (async () => {
      try {
        await handleEntrarDemoAuth()
        await fetchSesion()
        router.replace("/dashboard")
      } catch {
        setFallo(true)
      }
    })()
  }, [handleEntrarDemoAuth, fetchSesion, router])

  return (
    <PuertaAcceso>
      <motion.div
        className="flex flex-col items-center gap-4 text-center"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.5, bounce: 0 }}
        role="status"
        aria-live="polite"
      >
        {fallo ? (
          <>
            <h1 className="text-xl font-semibold tracking-tight">{t("auth.demo.noDisponible")}</h1>
            <p className="text-sm text-muted-foreground">{t("auth.demo.noDisponibleDetalle")}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              <Link href={rutasPublicas.registro} className={cn(buttonVariants(), "gap-1.5")}>
                {t("auth.demo.crear")}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link href={rutasPublicas.entrar} className={buttonVariants({ variant: "outline" })}>
                {t("auth.demo.irEntrar")}
              </Link>
            </div>
          </>
        ) : (
          <>
            <Loader2 className="size-6 animate-spin text-primary" aria-hidden />
            <h1 className="text-xl font-semibold tracking-tight">{t("auth.demo.abriendo")}</h1>
            <p className="text-sm text-muted-foreground">{t("auth.login.demoAviso")}</p>
          </>
        )}
      </motion.div>
    </PuertaAcceso>
  )
}
