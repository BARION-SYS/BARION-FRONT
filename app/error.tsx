"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, RotateCw } from "lucide-react"
import { LogoBarion } from "@shared/components/brand/LogoBarion"
import { Button } from "@shared/components/ui/button"

/**
 * Lo que se ve cuando una pantalla revienta en el navegador.
 *
 * **Existe porque su ausencia se notaba.** Sin este archivo, Next sirve su
 * pantalla de fábrica —«This page couldn't load», en inglés, sin marca y sin
 * decir de qué producto es—, que es exactamente la forma que tiene un sitio de
 * parecer abandonado: quien la ve no sabe si se rompió Barion, su conexión o el
 * enlace por el que llegó.
 *
 * Cubre TODAS las superficies —panel, escaparate, alta, admin—, así que no puede
 * mandar a nadie a un sitio concreto: un cliente del portal empujado a `/entrar`
 * acabaría ante una contraseña que no tiene. Por eso las dos salidas son
 * neutrales: reintentar donde estaba, o volver de donde vino.
 *
 * `reset()` vuelve a montar el segmento sin recargar la página, así que un fallo
 * pasajero —una petición que se cayó— se arregla sin perder el estado del resto
 * de la aplicación.
 *
 * **Se enseña el `digest` y no el mensaje**, y es deliberado: en producción React
 * borra el texto del error para no filtrar detalles del servidor, y lo único que
 * queda es ese identificador. Es lo que hace que «me salió un error» se pueda
 * cruzar con una línea de registro concreta.
 */
export default function ErrorAplicacion({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  return (
    <section className="flex min-h-dvh flex-col items-center justify-center px-6 py-32 text-center">
      <LogoBarion variante="completo" className="h-7" />
      <p className="mt-12 text-xs font-medium tracking-widest text-primary uppercase">
        Algo se rompió
      </p>
      <h1 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight text-balance sm:text-4xl">
        Esta pantalla no se pudo mostrar
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
        No es culpa tuya y no se perdió nada de lo que ya estaba guardado. Vuelve a intentarlo: la
        mayoría de las veces es un tropiezo pasajero.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button onClick={reset} size="lg" className="h-12 rounded-xl px-6 font-semibold">
          <RotateCw aria-hidden />
          Reintentar
        </Button>
        <Button
          onClick={() => router.back()}
          variant="outline"
          size="lg"
          className="h-12 rounded-xl px-6 font-semibold"
        >
          <ArrowLeft aria-hidden />
          Volver atrás
        </Button>
      </div>

      {error.digest && (
        <p className="mt-10 text-xs text-muted-foreground">
          Si vuelve a pasar, dile a soporte este código:{" "}
          <span className="font-medium text-foreground tabular-nums">{error.digest}</span>
        </p>
      )}
    </section>
  )
}
