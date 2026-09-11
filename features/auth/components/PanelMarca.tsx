"use client"

import { motion, type Variants } from "motion/react"
import { ArrowUpRight, BarChart3, CalendarDays, QrCode, Users } from "lucide-react"
import { LogoBarion } from "@shared/components/brand/LogoBarion"
import { rutasWeb } from "@routes/rutasPublicas"
import { useTextos } from "@shared/textos/useTextos"

/**
 * Lo que NO cambia con el idioma: qué icono acompaña a cada beneficio. El texto
 * lo pone el diccionario, y la clave es lo que une las dos mitades.
 */
const BENEFICIOS = [
  { clave: "citas", icono: CalendarDays },
  { clave: "clientes", icono: Users },
  { clave: "estadisticas", icono: BarChart3 },
  { clave: "qr", icono: QrCode },
] as const

const contenedor: Variants = {
  oculto: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.08 } },
}

// Los bloques del panel entran deslizando desde la izquierda, con resorte.
const bloque: Variants = {
  oculto: { opacity: 0, x: -28 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 200, damping: 22 } },
}

/**
 * La mitad de marca de la puerta global. Es un complemento del formulario y no
 * la razón de la página: por eso es un `<aside>` y su encabezado es un `h2` — el
 * `h1` es el título del acceso, que además es lo único que queda por debajo de
 * `lg`, donde este panel no se pinta.
 */
export function PanelMarca() {
  const t = useTextos()

  return (
    <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-card p-8 lg:flex lg:w-1/2 xl:p-12">
      {/* Empapelado diagonal — textura sutil de barbería */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, var(--foreground) 0 2px, transparent 2px 26px)",
        }}
        aria-hidden
      />

      {/* Poste de barbero — cinta vertical animada en el borde del panel. Cae
          de arriba abajo al entrar, en eco de la que corona la tarjeta de
          acceso: son la misma marca a los dos lados de la pantalla.

          Se difumina en los dos extremos y es más fina que la de la tarjeta, y
          eso es lo que la convierte de barrera en borde: a toda altura, opaca y
          de punta a punta, una raya de color vivo partía la pantalla en dos
          mitades y era lo primero que miraba el ojo — por delante del formulario
          que es la razón de la página. Un acento vive en el borde; no lo
          defiende. */}
      <motion.div
        className="cinta-barberia absolute top-0 right-0 h-full w-1 origin-top [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)] opacity-70"
        initial={{ scaleY: 0 }}
        animate={{
          scaleY: 1,
          transition: { duration: 0.7, ease: [0.23, 1, 0.32, 1], delay: 0.15 },
        }}
        aria-hidden
      />

      {/* Resplandor dorado de marca */}
      <div
        className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
        aria-hidden
      />

      <motion.div
        className="relative z-10 flex h-full flex-col justify-between gap-8"
        variants={contenedor}
        initial="oculto"
        animate="visible"
      >
        <motion.div className="flex items-center gap-4" variants={bloque}>
          <LogoBarion priority className="h-12 xl:h-14" />
          <span className="rounded-full border border-border px-3 py-1 text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
            {t("auth.panelMarca.insignia")}
          </span>
        </motion.div>

        <div className="space-y-6">
          <motion.div variants={bloque}>
            <h2 className="text-3xl leading-tight font-bold text-balance text-foreground xl:text-4xl">
              {t("auth.panelMarca.tituloAntes")}
              <br />
              <span className="text-primary">{t("auth.panelMarca.tituloDestacado")}</span>{" "}
              {t("auth.panelMarca.tituloDespues")}
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {t("auth.panelMarca.descripcion")}
            </p>
          </motion.div>

          <motion.ul className="grid grid-cols-2 gap-3" variants={contenedor}>
            {BENEFICIOS.map((beneficio) => (
              <motion.li
                key={beneficio.clave}
                variants={bloque}
                whileHover={{ y: -4, transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] } }}
                className="flex items-start gap-2.5 rounded-xl border border-border bg-secondary/50 p-3.5"
              >
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                  <beneficio.icono className="size-3.5 text-primary" aria-hidden />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-foreground">
                    {t(`auth.panelMarca.beneficios.${beneficio.clave}.etiqueta`)}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {t(`auth.panelMarca.beneficios.${beneficio.clave}.descripcion`)}
                  </span>
                </span>
              </motion.li>
            ))}
          </motion.ul>
        </div>

        {/*
          Aquí vivían tres cifras —«2.400+ barberías activas», «48k+ citas por
          semana», «99,9% de uptime»— y ninguna salía de ningún sitio: Barion no
          tiene todavía la primera barbería. Inventar prueba social en la puerta
          de entrada es la clase de dato que un cliente comprueba y ya no vuelve
          a creerse el resto. En su lugar va lo único cierto que se puede
          ofrecer a quien mira esta pantalla sin cuenta: dónde leer qué hace.
        */}
        <motion.p className="text-sm text-muted-foreground" variants={bloque}>
          {t("auth.panelMarca.pieTexto")}{" "}
          <a
            href={rutasWeb.inicio}
            className="inline-flex items-center gap-1 font-medium text-primary underline-offset-4 transition-colors hover:underline"
          >
            {t("auth.panelMarca.pieEnlace")}
            <ArrowUpRight className="size-3.5" aria-hidden />
          </a>
        </motion.p>
      </motion.div>
    </aside>
  )
}
