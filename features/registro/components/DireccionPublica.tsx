"use client"

import { AnimatePresence, motion } from "motion/react"
import { Globe, Link2 } from "lucide-react"
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
 *
 * ── Por qué se ve así, y no como una línea de texto ─────────────────────────
 * Antes era `Tu dirección: dominio/b/slug` todo del mismo tamaño y con el mismo
 * peso, y el resultado es que lo único que esa persona eligió —su identificador—
 * quedaba enterrado entre un dominio largo que no le dice nada. Aquí el dominio
 * baja a apoyo y **el identificador es lo que se lee**: es su nombre en Barion,
 * lo que va impreso en el cartón y lo que dicta por teléfono.
 */
export function DireccionPublica({ origen, slug, ajustado, resolviendo }: DireccionPublicaProps) {
  const dominio = origen.replace(/^https?:\/\//, "")

  return (
    <div
      className="overflow-hidden rounded-xl border border-border bg-secondary/40"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-2.5">
        <span className="flex items-center gap-2 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
          <Globe className="size-3.5" aria-hidden />
          Tu dirección pública
        </span>
        {/* Que la dirección lleve un número sorprende si nadie lo dice, así que
            se avisa aquí y no cuando ya esté creada.

            **Lo que NO se dice es por qué.** Antes ponía «la dirección exacta de
            ese nombre ya estaba tomada»: a quien se está registrando eso no le
            sirve de nada —no puede hacer nada al respecto— y de paso le cuenta
            algo de otra barbería. Dos barberías pueden llamarse igual y es lo
            normal; lo único que necesita saber es cuál es SU dirección y que
            puede cambiarla. */}
        {ajustado && slug && !resolviendo && (
          <span className="shrink-0 rounded-full bg-card px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            Reservada para ti
          </span>
        )}
      </div>

      <div className="px-4 py-3.5">
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
              {/* El dominio en apoyo y el identificador en primer plano: es lo
                  único de esta línea que esa persona eligió */}
              <p className="leading-snug break-all">
                <span className="text-sm text-muted-foreground">{dominio}/b/</span>
                <span className="text-base font-semibold text-primary">{slug}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Puedes cambiarla cuando quieras desde el panel.
              </p>
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
              <span>
                La calculamos con el nombre al continuar. Podrás cambiarla desde el panel.
              </span>
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
