"use client"

import Link from "next/link"
import { motion, type Variants } from "motion/react"
import { ArrowRight, Check, LayoutDashboard, MailCheck, Share2, Store } from "lucide-react"
import { rutasWeb } from "@routes/rutasPublicas"
import type { RegistroVista } from "@features/registro/types/registro.types"
import { EnlaceCopiable } from "@shared/components/enlaces/EnlaceCopiable"
import { Button } from "@shared/components/ui/button"
import { useTextos } from "@shared/textos/useTextos"

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
 * Lo que se ve al terminar el alta.
 *
 * ── Qué se arregló aquí, y por qué importa ─────────────────────────────────
 * Decía «SEBAS BARBER ya existe» y listaba dos pasos genéricos. Tres problemas:
 * no confirmaba **qué se creó de verdad**, el título sonaba a comprobación de
 * duplicados en vez de a celebración, y explicaba que «la dirección exacta de
 * ese nombre ya estaba tomada» — una frase que no le sirve de nada a quien
 * acaba de registrarse y que además le cuenta algo de otra barbería.
 *
 * Ahora: **un resumen de lo creado** —nombre, dirección, prueba— y después qué
 * hacer, con un solo botón primario. La dirección se presenta como suya, sin
 * explicar de dónde salió el número.
 *
 * ── Los dos caminos ────────────────────────────────────────────────────────
 * Con contraseña el escaparate **espera al correo**; con Google está publicado
 * desde este momento. Es la diferencia que decide qué se le pide a continuación,
 * así que la pantalla cambia entera en vez de tachar una línea.
 */
export function RegistroExito({ registro, origen }: RegistroExitoProps) {
  const t = useTextos("registro.exito")
  const enlacePortal = `${origen}/b/${registro.slug}`
  const esperaCorreo = registro.correoVerificacion !== null

  return (
    <motion.div className="mx-auto max-w-xl" variants={cascada} initial="oculto" animate="visible">
      <motion.div className="text-center" variants={bloque}>
        <span
          className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--exito)_14%,transparent)] text-(--exito)"
          aria-hidden
        >
          <Check className="size-7" strokeWidth={2.5} />
        </span>

        {/* «Ya está lista» y no «ya existe»: lo segundo suena a comprobación de
            duplicados, que es justo la duda que no queremos sembrar */}
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-balance sm:text-3xl">
          Tu barbería ya está lista
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-balance text-muted-foreground">
          {esperaCorreo ? (
            <>
              Te enviamos un enlace a{" "}
              <span className="font-medium text-foreground">{registro.correoVerificacion}</span>{" "}
              para publicar tu escaparate.
            </>
          ) : (
            <>
              Tu correo quedó confirmado por Google, así que{" "}
              <span className="font-medium text-foreground">tu escaparate ya está publicado</span>.
            </>
          )}
        </p>
      </motion.div>

      {/* El resumen de lo que se creó, antes que los pasos. Es lo que faltaba:
          la pantalla anterior decía qué hacer sin confirmar qué había pasado */}
      <motion.dl
        className="mt-7 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card"
        variants={bloque}
      >
        <div className="flex items-center gap-3 p-4">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground"
            aria-hidden
          >
            <Store className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <dt className="text-xs text-muted-foreground">{t("tuBarberia")}</dt>
            <dd className="truncate text-sm font-semibold text-foreground">
              {registro.nombreComercial}
            </dd>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground"
            aria-hidden
          >
            <Check className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <dt className="text-xs text-muted-foreground">{t("tuPrueba")}</dt>
            <dd className="text-sm font-semibold text-foreground">
              {t("pruebaValor")}
              <span className="ml-1.5 font-normal text-muted-foreground">{t("pruebaDetalle")}</span>
            </dd>
          </div>
        </div>
      </motion.dl>

      {/* La dirección se presenta como SUYA, sin explicar de dónde salió el
          sufijo si lo lleva: a quien acaba de registrarse no le aporta nada
          saber que otro nombre igual estaba antes, y contarlo es hablarle de
          una barbería que no es la suya */}
      <motion.div className="mt-4" variants={bloque}>
        <EnlaceCopiable
          etiqueta={t("tuDireccion")}
          descripcion={esperaCorreo ? t("direccionEsperando") : t("direccionLista")}
          valor={enlacePortal}
        />
      </motion.div>

      <motion.ol className="mt-7 space-y-2.5" variants={bloque} aria-label={t("loQueSigue")}>
        <li className="flex gap-3 rounded-xl border border-border bg-card p-4">
          <span
            className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
            aria-hidden
          >
            <LayoutDashboard className="size-3.5" />
          </span>
          <p className="text-sm leading-relaxed">
            <span className="font-medium">{t("montaTitulo")}</span>{" "}
            <span className="text-muted-foreground">{t("montaDetalle")}</span>
          </p>
        </li>

        <li className="flex gap-3 rounded-xl border border-border bg-card p-4">
          <span
            className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
            aria-hidden
          >
            {esperaCorreo ? <MailCheck className="size-3.5" /> : <Share2 className="size-3.5" />}
          </span>
          <p className="text-sm leading-relaxed">
            {esperaCorreo ? (
              <>
                <span className="font-medium">{t("correoTitulo")}</span>{" "}
                <span className="text-muted-foreground">{t("correoDetalle")}</span>
              </>
            ) : (
              <>
                <span className="font-medium">{t("comparteTitulo")}</span>{" "}
                <span className="text-muted-foreground">{t("comparteDetalle")}</span>
              </>
            )}
          </p>
        </li>
      </motion.ol>

      {/* Un solo primario. Antes competía con «Volver al inicio», que es lo
          último que quiere hacer alguien que acaba de crear su barbería */}
      <motion.div className="mt-7 space-y-3" variants={bloque}>
        <Button
          render={<Link href={`/b/${registro.slug}/entrar`} />}
          size="lg"
          className="group/cta h-12 w-full rounded-xl text-base font-semibold"
        >
          Entrar a mi panel
          <ArrowRight
            className="transition-transform duration-200 group-hover/cta:translate-x-1"
            aria-hidden
          />
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          {esperaCorreo ? t("entraConCorreo") : t("entraConGoogle")}{" "}
          {/* Otro dominio: <a>, no next/link */}
          <a
            href={rutasWeb.inicio}
            className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            {t("volverAlInicio")}
          </a>
        </p>
      </motion.div>
    </motion.div>
  )
}
