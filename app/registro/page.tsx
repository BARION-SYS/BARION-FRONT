"use client"

import { useCallback, useState } from "react"
import Link from "next/link"
import { Check } from "lucide-react"
import { REGION_DEFAULT, type CodigoRegion } from "@config/regiones"
import { RegistroExito } from "@features/registro/components/RegistroExito"
import { RegistroForm } from "@features/registro/components/RegistroForm"
import { useRegistro } from "@features/registro/hooks/useRegistro"
import type { DatosFormularioRegistro } from "@features/registro/schemas/registro.schema"
import { slugDesdeNombre } from "@features/registro/utils/slug"
import { rutasPublicas, rutasWeb } from "@routes/rutasPublicas"
import { LogoBarion } from "@shared/components/brand/LogoBarion"
import { ThemeToggle } from "@shared/layout/ThemeToggle"
import { notify } from "@shared/services/notify"
import { getErrorMessage } from "@shared/utils/error"

const incluye = [
  "15 días de prueba, sin tarjeta",
  "Tu escaparate público desde el primer día",
  "Agenda, clientes y nómina incluidos",
  "Te vas cuando quieras y te llevas tus datos",
]

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
    loadingRegistro,
    loadingSlug,
    error,
    handleRegistrarBarberia,
    fetchSlugLibre,
    limpiarSlug,
  } = useRegistro()

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
    <section className="flex min-h-dvh flex-col justify-center px-6 pt-24 pb-20 sm:px-8">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1100px] items-center px-6 sm:px-8">
          {/* Otro dominio: <a>, no next/link */}
          <a href={rutasWeb.inicio} aria-label="Barion — inicio">
            <LogoBarion variante="completo" className="h-6" />
          </a>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1100px]">
        {registro ? (
          <RegistroExito registro={registro} />
        ) : (
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="lg:pt-6">
              <p className="text-xs font-medium tracking-widest text-primary uppercase">
                Crear cuenta
              </p>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                Tu barbería, montada en dos minutos
              </h1>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                No pedimos plan ni tarjeta. Eliges el plan al terminar la prueba, cuando ya sepas si
                Barion te sirve.
              </p>

              <ul className="mt-8 space-y-3">
                {incluye.map((texto) => (
                  <li key={texto} className="flex gap-2.5 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    <span className="text-muted-foreground">{texto}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-8 text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{" "}
                <Link
                  href={rutasPublicas.entrar}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Inicia sesión
                </Link>
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
              <RegistroForm
                onSubmit={alRegistrar}
                onResolverSlug={fetchSlugLibre}
                onEditarNombre={limpiarSlug}
                slug={slug}
                resolviendoSlug={loadingSlug}
                regionInicial={regionInicial}
                cargando={loadingRegistro}
                error={error}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
