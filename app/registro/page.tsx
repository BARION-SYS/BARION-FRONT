"use client"

import { useCallback, useState } from "react"
import Link from "next/link"
import { MotionConfig, motion, type Variants } from "motion/react"
import { CalendarCheck, Check, ShieldCheck, Store } from "lucide-react"
import { REGION_DEFAULT, type CodigoRegion } from "@config/regiones"
import { RegistroExito } from "@features/registro/components/RegistroExito"
import { RegistroForm } from "@features/registro/components/RegistroForm"
import { useRegistro } from "@features/registro/hooks/useRegistro"
import type { DatosFormularioRegistro } from "@features/registro/schemas/registro.schema"
import { slugDesdeNombre } from "@features/registro/utils/slug"
import { rutasPublicas, rutasWeb } from "@routes/rutasPublicas"
import { LogoBarion } from "@shared/components/brand/LogoBarion"
import { useOrigen } from "@shared/hooks/useOrigen"
import { ThemeToggle } from "@shared/layout/ThemeToggle"
import { notify } from "@shared/services/notify"
import { getErrorMessage } from "@shared/utils/error"

const incluye = [
  { icono: Store, texto: "Tu escaparate público desde el primer día" },
  { icono: CalendarCheck, texto: "Agenda, clientes y nómina incluidos" },
  { icono: ShieldCheck, texto: "Te vas cuando quieras y te llevas tus datos" },
]

const bloque: Variants = {
  oculto: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 140, damping: 22 } },
}

const cascada: Variants = {
  oculto: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.06 } },
}

/**
 * Alta abierta: una barbería nace sin que nadie de Barion intervenga.
 *
 * El alta es de la APLICACIÓN, no del sitio de venta: quien la termina entra al
 * panel, y el panel es este repo. Por eso no hereda cabecera de nadie y monta la
 * suya —logo y tema— con el logo de vuelta al sitio público, que está en otro
 * dominio. Es la página padre: consume el hook, guarda el estado de interfaz y
 * le pasa a los hijos datos y callbacks.
 */
export default function RegistroPage() {
  const {
    registro,
    slug,
    slugAjustado,
    loadingRegistro,
    loadingSlug,
    error,
    handleRegistrarBarberia,
    fetchSlugLibre,
    limpiarSlug,
  } = useRegistro()

  // La dirección que se enseña tiene que ser la de este despliegue: un dominio
  // escrito en el código manda a la gente a compartir un enlace que no existe.
  const origen = useOrigen()

  // Región de partida del selector. Cosmética: lo que factura es lo que se elija
  // en el formulario, y eso ya viaja en el alta.
  const [regionInicial] = useState<CodigoRegion>(REGION_DEFAULT)

  const alRegistrar = useCallback(
    async (datos: DatosFormularioRegistro) => {
      try {
        // El identificador es interno: el ya comprobado si lo hay, y si la
        // comprobación no llegó a tiempo, el que sale del nombre — la api
        // responde 409 si estaba ocupado, que es su trabajo, no el del front.
        const message = await handleRegistrarBarberia({
          ...datos,
          slug: slug ?? slugDesdeNombre(datos.nombreComercial),
        })
        notify.success(message)
      } catch (err) {
        notify.error(getErrorMessage(err))
      }
    },
    [handleRegistrarBarberia, slug]
  )

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-dvh">
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-[1100px] items-center gap-4 px-6 sm:px-8">
            {/* Otro dominio: <a>, no next/link */}
            <a href={rutasWeb.inicio} aria-label="Barion — inicio">
              <LogoBarion variante="completo" className="h-6" />
            </a>
            <div className="ml-auto flex items-center gap-1">
              <Link
                href={rutasPublicas.entrar}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Ya tengo cuenta
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="flex min-h-dvh flex-col justify-center px-6 pt-24 pb-20 sm:px-8">
          <div className="mx-auto w-full max-w-[1100px]">
            {registro ? (
              <RegistroExito registro={registro} origen={origen} />
            ) : (
              <motion.div
                className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-16"
                variants={cascada}
                initial="oculto"
                animate="visible"
              >
                {/* En móvil el argumento va DEBAJO del formulario: quien llega
                    aquí ya decidió, y hacerle bajar dos pantallas de virtudes
                    antes del primer campo es pedirle que se lo piense otra vez */}
                <motion.div className="order-2 lg:order-1 lg:pt-6" variants={bloque}>
                  <p className="text-xs font-medium tracking-widest text-primary uppercase">
                    Crear cuenta
                  </p>
                  <h1 className="mt-4 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                    Tu barbería, montada en dos minutos
                  </h1>
                  <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                    Empiezas con 15 días de prueba y sin tarjeta. El plan se elige al terminarla,
                    cuando ya sepas si Barion te sirve.
                  </p>

                  <ul className="mt-8 space-y-3.5">
                    {incluye.map(({ icono: Icono, texto }) => (
                      <li key={texto} className="flex items-start gap-3 text-sm">
                        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Icono className="size-3" aria-hidden />
                        </span>
                        <span className="text-muted-foreground">{texto}</span>
                      </li>
                    ))}
                  </ul>

                  <p className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="size-4 shrink-0 text-(--exito)" aria-hidden />
                    Sin permanencia y sin costo de instalación.
                  </p>

                  <p className="mt-6 text-sm text-muted-foreground">
                    ¿Ya tienes cuenta?{" "}
                    <Link
                      href={rutasPublicas.entrar}
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Inicia sesión
                    </Link>
                  </p>
                </motion.div>

                <motion.div
                  className="order-1 rounded-2xl border border-border bg-card p-6 sm:p-8 lg:order-2"
                  variants={bloque}
                >
                  <RegistroForm
                    onSubmit={alRegistrar}
                    onResolverSlug={fetchSlugLibre}
                    onEditarNombre={limpiarSlug}
                    slug={slug}
                    slugAjustado={slugAjustado}
                    resolviendoSlug={loadingSlug}
                    origen={origen}
                    regionInicial={regionInicial}
                    cargando={loadingRegistro}
                    error={error}
                  />
                </motion.div>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </MotionConfig>
  )
}
