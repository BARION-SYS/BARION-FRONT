"use client"

import Link from "next/link"
import { motion, type Variants } from "motion/react"
import { ArrowRight, MailCheck } from "lucide-react"
import { rutasWeb } from "@routes/rutasPublicas"
import type { RegistroVista } from "@features/registro/types/registro.types"
import { EnlaceCopiable } from "@shared/components/enlaces/EnlaceCopiable"
import { Button } from "@shared/components/ui/button"

interface RegistroExitoProps {
  registro: RegistroVista
  /** Dominio por el que se sirve la aplicación, para dar la dirección real. */
  origen: string
}

const bloque: Variants = {
  oculto: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 140, damping: 22 } },
}

const cascada: Variants = {
  oculto: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

/**
 * Después del alta NO hay sesión: se entra por la puerta de la barbería, como
 * todo el mundo. Que el registro no abra sesión es deliberado en la api —evita
 * dos caminos distintos hacia el mismo sitio— y aquí se dice claro para que
 * nadie se quede esperando a que el panel aparezca solo.
 *
 * Lo que sigue va numerado porque son dos cosas distintas y solo una depende del
 * correo: al panel se entra YA; el escaparate no se sirve hasta abrir el enlace,
 * y sin decirlo la barbería parece rota el día que un cliente ve un 404.
 */
export function RegistroExito({ registro, origen }: RegistroExitoProps) {
  const enlacePortal = `${origen}/b/${registro.slug}`

  return (
    <motion.div
      className="mx-auto max-w-xl text-center"
      variants={cascada}
      initial="oculto"
      animate="visible"
    >
      <motion.span
        className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground"
        variants={bloque}
      >
        <MailCheck className="size-6" aria-hidden />
      </motion.span>

      <motion.h1 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl" variants={bloque}>
        {registro.nombreComercial} ya existe
      </motion.h1>

      <motion.p
        className="mx-auto mt-4 text-base leading-relaxed text-balance text-muted-foreground"
        variants={bloque}
      >
        Te enviamos un enlace de verificación a{" "}
        <span className="font-medium text-foreground">{registro.correoVerificacion}</span>.
      </motion.p>

      <motion.ol className="mt-8 space-y-3 text-left" variants={bloque} aria-label="Lo que sigue">
        <li className="flex gap-3 rounded-2xl border border-border bg-card p-4">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            1
          </span>
          <p className="text-sm leading-relaxed">
            <span className="font-medium">Entra a tu panel y móntalo.</span>{" "}
            <span className="text-muted-foreground">
              Sedes, servicios y equipo funcionan desde ahora mismo.
            </span>
          </p>
        </li>

        <li className="flex gap-3 rounded-2xl border border-border bg-card p-4">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
            2
          </span>
          <div className="min-w-0 flex-1 space-y-3">
            <p className="text-sm leading-relaxed">
              <span className="font-medium">Abre el correo para publicar tu escaparate.</span>{" "}
              <span className="text-muted-foreground">
                Hasta que lo hagas, esta dirección no se le sirve a nadie.
              </span>
            </p>
            <EnlaceCopiable
              etiqueta="Tu dirección pública"
              descripcion="Es la que compartes con tus clientes."
              valor={enlacePortal}
            />
          </div>
        </li>
      </motion.ol>

      <motion.div
        className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        variants={bloque}
      >
        <Button
          render={<Link href={`/b/${registro.slug}/entrar`} />}
          size="lg"
          className="h-12 w-full rounded-xl px-6 font-semibold sm:w-auto"
        >
          Entrar a mi barbería
          <ArrowRight aria-hidden />
        </Button>
        {/* Otro dominio: <a>, no next/link */}
        <Button
          render={<a href={rutasWeb.inicio} />}
          variant="outline"
          size="lg"
          className="h-12 w-full rounded-xl px-6 font-semibold sm:w-auto"
        >
          Volver al inicio
        </Button>
      </motion.div>
    </motion.div>
  )
}
