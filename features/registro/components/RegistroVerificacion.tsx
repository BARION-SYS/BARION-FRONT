"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { CheckCircle2, Loader2, XCircle, type LucideIcon } from "lucide-react"
import { rutasPublicas } from "@routes/rutasPublicas"
import { LogoBarion } from "@shared/components/brand/LogoBarion"
import { Button } from "@shared/components/ui/button"

export type EstadoVerificacion = "verificando" | "listo" | "invalido"

interface RegistroVerificacionProps {
  estado: EstadoVerificacion
  mensaje: string | null
}

/**
 * Lo que ve quien abre el enlace del correo de registro.
 *
 * ── Qué momento es este, y por qué merece una pantalla propia ───────────────
 * Es el instante en que la barbería **se publica**: hasta abrir este enlace el
 * panel funcionaba pero `/b/{slug}` respondía 404 a todo el mundo, así que el
 * cartón QR y el enlace de reserva no llevaban a ningún sitio. Quien llega aquí
 * no viene a leer una confirmación administrativa: viene a saber si su negocio
 * ya se puede ver.
 *
 * De ahí la jerarquía: **qué cambió** (titular), **qué significa** (una frase),
 * **qué hacer ahora** (una sola acción). El resto sobra.
 *
 * ── Los tres estados ────────────────────────────────────────────────────────
 * Comparten la misma caja y solo cambian de contenido, así que al resolverse la
 * pantalla no salta: el icono ocupa su sitio desde el primer fotograma. El
 * skeleton anterior se leía como «cargando datos» cuando lo que pasa es que se
 * está confirmando algo.
 *
 * Los tres fallos posibles —caducado, ya usado, inexistente— se pintan igual
 * porque **la api responde lo mismo para los tres**, y distinguirlos solo
 * ayudaría a quien está probando enlaces ajenos.
 */
export function RegistroVerificacion({ estado, mensaje }: RegistroVerificacionProps) {
  const vista = VISTAS[estado]

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 p-6">
      <LogoBarion variante="completo" priority />

      <motion.section
        // Entrada corta y con muelle: acompaña la llegada sin hacerla esperar.
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 140, damping: 22 }}
        aria-live="polite"
        className="flex w-full max-w-md flex-col items-center gap-5 rounded-2xl border border-border bg-card p-6 text-center shadow-lg sm:p-8"
      >
        {/* El tono llega por dato, así que viaja como variable CSS y se pinta
            con clases: un `style` con `backgroundColor` se saltaría el tema. */}
        <span
          style={{ "--tono": `var(${vista.tono})` } as React.CSSProperties}
          className="flex size-14 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--tono)_14%,transparent)] text-(--tono)"
        >
          <vista.icono
            className={
              estado === "verificando" ? "size-7 animate-spin motion-reduce:animate-none" : "size-7"
            }
            aria-hidden
          />
        </span>

        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-balance text-foreground sm:text-2xl">
            {vista.titulo}
          </h1>
          <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
            {mensaje ?? vista.detalle}
          </p>
        </div>

        {estado !== "verificando" && (
          <div className="flex w-full flex-col gap-2">
            <Button
              size="lg"
              className="w-full"
              variant={estado === "listo" ? "default" : "outline"}
              render={<Link href={rutasPublicas.entrar} />}
            >
              {estado === "listo" ? "Entrar a mi panel" : "Ir a entrar"}
            </Button>

            {/* Lo que de verdad acaba de cambiar, dicho donde se entiende: la
                página pública existe desde este segundo. No es un botón porque
                todavía no sabemos su identificador — lo sabe el panel. */}
            {estado === "listo" && (
              <p className="text-xs text-muted-foreground">
                Tu página pública ya responde: el cartón QR y el enlace de reserva funcionan.
              </p>
            )}
          </div>
        )}
      </motion.section>
    </main>
  )
}

interface VistaVerificacion {
  titulo: string
  detalle: string
  icono: LucideIcon
  /** Token de color, no un color: el tema decide el valor. */
  tono: "--info" | "--exito" | "--destructive"
}

const VISTAS: Record<EstadoVerificacion, VistaVerificacion> = {
  verificando: {
    titulo: "Confirmando tu correo",
    detalle: "Un segundo. No cierres esta pestaña.",
    icono: Loader2,
    tono: "--info",
  },
  listo: {
    titulo: "Listo, tu barbería ya es visible",
    detalle: "Tus clientes pueden encontrarte y reservar desde tu página pública.",
    icono: CheckCircle2,
    tono: "--exito",
  },
  invalido: {
    titulo: "Este enlace ya no sirve",
    detalle:
      "Puede que haya caducado o que ya lo hayas usado. Si ya confirmaste antes, no hay nada más que hacer: entra a tu panel.",
    icono: XCircle,
    tono: "--destructive",
  },
}
