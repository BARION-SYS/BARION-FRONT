import Link from "next/link"
import { MailCheck } from "lucide-react"
import { rutasWeb } from "@routes/rutasPublicas"
import type { RegistroVista } from "@features/registro/types/registro.types"
import { Button } from "@shared/components/ui/button"

interface RegistroExitoProps {
  registro: RegistroVista
}

/**
 * Después del alta NO hay sesión: se entra por la puerta de la barbería, como
 * todo el mundo. Que el registro no abra sesión es deliberado en la api —
 * evita dos caminos distintos hacia el mismo sitio— y aquí se dice claro para
 * que nadie se quede esperando a que el panel aparezca solo.
 */
export function RegistroExito({ registro }: RegistroExitoProps) {
  return (
    <div className="text-center">
      <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
        <MailCheck className="size-6" aria-hidden />
      </span>
      <h1 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">
        {registro.nombreComercial} ya existe
      </h1>
      <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
        Te enviamos un enlace de verificación a{" "}
        <span className="font-medium text-foreground">{registro.correoVerificacion}</span>. Hasta
        que lo abras, tu panel funciona pero tu escaparate público todavía no se publica.
      </p>

      <div className="mx-auto mt-8 max-w-md rounded-2xl border border-border bg-card p-5 text-left">
        <p className="text-xs font-medium tracking-widest text-primary uppercase">Tu dirección</p>
        <p className="mt-2 font-medium break-all">barion.app/b/{registro.slug}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Es el enlace que compartes con tus clientes, y también tu puerta de entrada al panel.
        </p>
      </div>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button
          render={<Link href={`/b/${registro.slug}/entrar`} />}
          size="lg"
          className="h-12 rounded-xl px-6 font-semibold"
        >
          Entrar a mi barbería
        </Button>
        <Button
          render={<a href={rutasWeb.inicio} />}
          variant="outline"
          size="lg"
          className="h-12 rounded-xl px-6 font-semibold"
        >
          Volver al inicio
        </Button>
      </div>
    </div>
  )
}
