"use client"

import { Suspense, useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AnimatePresence } from "motion/react"
import { Login } from "@features/auth/components/Login"
import { PuertaAcceso } from "@features/auth/components/PuertaAcceso"
import { SelectorBarberia } from "@features/auth/components/SelectorBarberia"
import { useAuth } from "@features/auth/hooks/useAuth"
import { appDeSesion } from "@features/auth/utils/permisos"
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
  const {
    barberiasParaElegir,
    loadingLogin,
    demoDisponible,
    loadingDemo,
    error,
    handleLoginAuth,
    handleEntrarDemoAuth,
    fetchEstadoDemo,
    fetchSesion,
  } = useAuth()

  // El botón de la demo solo se enseña si la API la ofrece en este entorno.
  useEffect(() => {
    void fetchEstadoDemo()
  }, [fetchEstadoDemo])

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

  /**
   * Con la cookie ya puesta: resuelve quién entró y anima la salida al panel.
   *
   * A dónde entra lo decide el TIPO de actor, no la ruta desde la que llamó: el
   * staff de Barion no tiene barbería y el panel se le pintaría vacío. Se
   * resuelve aquí, con la sesión ya en la mano, en vez de navegar y que el área
   * de destino rebote. Lo comparten el login y la demo: entrar por una puerta u
   * otra no debe cambiar lo que pasa después.
   */
  const abrirPanel = useCallback(async () => {
    const sesion = await fetchSesion()
    setDestino(appDeSesion(sesion) === "admin" ? "/admin" : "/dashboard")
    setSaliendo(true)
  }, [fetchSesion])

  const entrar = useCallback(
    async (datos: DatosLogin, slug?: string) => {
      try {
        const haySesion = await handleLoginAuth(datos, slug)
        if (!haySesion) return
        await abrirPanel()
      } catch {
        // El error ya queda en `error` del hook y se muestra en el form.
      }
    },
    [handleLoginAuth, abrirPanel]
  )

  const entrarDemo = useCallback(async () => {
    try {
      await handleEntrarDemoAuth()
      await abrirPanel()
    } catch {
      // Igual que el login: el error queda en `error` y lo pinta la tarjeta.
    }
  }, [handleEntrarDemoAuth, abrirPanel])

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

  // El marco —panel de marca, textura, columna que desplaza— es el mismo de las
  // demás pantallas de acceso y vive en `PuertaAcceso`.
  return (
    <PuertaAcceso>
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
              cargando={loadingLogin || loadingDemo}
              error={error ?? errorOauth}
              demo={demoDisponible ? { onEntrar: entrarDemo, cargando: loadingDemo } : undefined}
            />
          ))}
      </AnimatePresence>
    </PuertaAcceso>
  )
}
