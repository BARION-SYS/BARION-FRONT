"use client"

import { motion } from "motion/react"
import { Clock3 } from "lucide-react"
import { env } from "@config/env"
import { LogoGoogle } from "@shared/components/brand/LogoGoogle"
import { buttonVariants } from "@shared/components/ui/button"
import { cn } from "@shared/utils/cn"

/**
 * Lo que se enseña cuando el pase de Google muere con el formulario ya montado.
 *
 * **Existe porque el mensaje solo no bastaba.** La api responde «vuelve a
 * empezar el registro con Google» y eso es correcto, pero salía como una línea
 * roja al pie de un formulario que seguía en pantalla: cada envío devolvía el
 * mismo 401 y no había en ningún sitio el botón con el que empezar de nuevo.
 * Un error sin camino de vuelta se lee como un sitio roto.
 *
 * Se ramifica por el `motivo` de la api, no por su frase — ver
 * `useRegistro.handleRegistrarConGoogle`.
 *
 * **Lo escrito no se conserva**, y se dice: el pase transporta la identidad
 * comprobada, y al rehacerlo Google vuelve a traer el correo pero no el nombre
 * de la barbería ni el teléfono. Prometer que se guardan sería mentir; callarlo,
 * peor.
 */
export function RegistroPaseCaducado() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 24 }}
      className="space-y-6 text-center"
      role="alert"
    >
      <span
        className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-(--advertencia)/10 text-(--advertencia)"
        aria-hidden
      >
        <Clock3 className="size-6" />
      </span>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold tracking-tight">Tu verificación con Google caducó</h2>
        <p className="mx-auto max-w-[38ch] text-sm leading-relaxed text-muted-foreground">
          Pasó demasiado tiempo desde que volviste de Google. No se creó ninguna barbería y no se
          cobró nada: entra otra vez con tu cuenta y sigues donde estabas.
        </p>
      </div>

      <a
        href={`${env.apiUrl}/auth/oauth/google/registro`}
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-12 w-full rounded-xl text-base font-semibold"
        )}
      >
        <LogoGoogle aria-hidden />
        Continuar con Google
      </a>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Tendrás que volver a escribir el nombre de tu barbería y tu teléfono.
      </p>
    </motion.div>
  )
}
