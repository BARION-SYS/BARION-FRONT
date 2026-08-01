import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { rutasPublicas, rutasWeb } from "@routes/rutasPublicas"
import { LogoBarion } from "@shared/components/brand/LogoBarion"
import { Button } from "@shared/components/ui/button"

/**
 * 404 de la aplicación. No hereda cabecera de nadie —el panel tiene la suya y
 * detrás de sesión, y aquí puede no haberla— así que lleva su propia marca: sin
 * ella, una dirección equivocada deja al visitante en una pantalla en blanco con
 * dos palabras, sin manera de saber siquiera dónde está.
 *
 * «Volver al inicio» sale a OTRO dominio (el sitio público, repo BARION-WEB):
 * por eso es `<a>` y no `next/link`.
 */
export default function NoEncontrada() {
  return (
    <section className="flex min-h-dvh flex-col items-center justify-center px-6 py-32 text-center">
      <LogoBarion variante="completo" className="h-7" />
      <p className="mt-12 text-xs font-medium tracking-widest text-primary uppercase">Error 404</p>
      <h1 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight text-balance sm:text-4xl">
        Esta página no existe
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
        Puede que el enlace esté mal escrito o que la página se haya movido.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button
          render={<a href={rutasWeb.inicio} />}
          size="lg"
          className="h-12 rounded-xl px-6 font-semibold"
        >
          <ArrowLeft aria-hidden />
          Volver al inicio
        </Button>
        <Button
          render={<Link href={rutasPublicas.entrar} />}
          variant="outline"
          size="lg"
          className="h-12 rounded-xl px-6 font-semibold"
        >
          Iniciar sesión
        </Button>
      </div>
    </section>
  )
}
