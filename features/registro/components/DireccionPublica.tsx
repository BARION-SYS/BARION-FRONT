"use client"

import { AnimatePresence, motion } from "motion/react"
import { Check, Link2, Wand2 } from "lucide-react"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"

interface DireccionPublicaProps {
  /** Dominio por el que se sirve la aplicación. Vacío en el primer render. */
  origen: string
  /** Identificador ya comprobado contra la API. `null` mientras no lo haya. */
  slug: string | null
  /** El que salía del nombre estaba tomado y la API entregó otro. */
  ajustado: boolean
  resolviendo: boolean
}

/**
 * La dirección pública que le va a quedar a la barbería.
 *
 * No es un campo: **no se pregunta**. Pedir un identificador es pedirle una
 * decisión técnica a quien vino a montar una barbería, y la mitad de las veces
 * acaba en algo con espacios o tildes que hay que rechazar. Se calcula del
 * nombre, se comprueba contra la API y se enseña ya resuelto — pero se enseña,
 * porque es lo que esa persona va a repartir entre sus clientes.
 *
 * El dominio sale del navegador y no de una constante: escrito a mano enseñaría
 * una dirección de otro despliegue, y quien la copiara compartiría un enlace que
 * no existe. Hasta que el cliente monta, se pinta solo la ruta.
 */
export function DireccionPublica({ origen, slug, ajustado, resolviendo }: DireccionPublicaProps) {
  const dominio = origen.replace(/^https?:\/\//, "")

  return (
    <div className="rounded-xl border border-border bg-secondary/50 px-3.5 py-3" aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        {resolviendo ? (
          <motion.div
            key="resolviendo"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            className="flex items-center gap-2.5"
          >
            <Link2 className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <DataSkeleton variant="text" count={1} className="flex-1" />
            <span className="sr-only">Buscando una dirección libre</span>
          </motion.div>
        ) : slug ? (
          <motion.div
            key="resuelta"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="space-y-1.5"
          >
            <p className="flex items-start gap-2.5 text-sm">
              <Check className="mt-0.5 size-4 shrink-0 text-(--exito)" aria-hidden />
              <span className="min-w-0">
                <span className="text-muted-foreground">Tu dirección: </span>
                <span className="font-medium break-all">
                  {dominio}/b/{slug}
                </span>
              </span>
            </p>
            {/* Que la dirección no coincida con el nombre sorprende si nadie lo
                dice: se avisa aquí, no cuando ya esté creada */}
            {ajustado && (
              <p className="flex items-start gap-2.5 text-xs text-muted-foreground">
                <Wand2 className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                <span>
                  La dirección exacta de ese nombre ya estaba tomada, así que reservamos esta.
                  Puedes cambiarla desde el panel.
                </span>
              </p>
            )}
          </motion.div>
        ) : (
          <motion.p
            key="pendiente"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            className="flex items-start gap-2.5 text-sm text-muted-foreground"
          >
            <Link2 className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>La calculamos con el nombre al continuar. Podrás cambiarla desde el panel.</span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
