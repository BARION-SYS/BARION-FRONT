"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Controller, useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { AnimatePresence, motion, type Variants } from "motion/react"
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2, Store } from "lucide-react"
import { LogoBarion } from "@shared/components/brand/LogoBarion"
import { Button, buttonVariants } from "@shared/components/ui/button"
import { cn } from "@shared/utils/cn"
import { Checkbox } from "@shared/components/ui/checkbox"
import { Field, FieldError, FieldLabel } from "@shared/components/ui/field"
import { Input } from "@shared/components/ui/input"
import { env } from "@config/env"
import { rutasPublicas } from "@routes/rutasPublicas"
import { LogoGoogle } from "@shared/components/brand/LogoGoogle"
import { esquemaLogin, type DatosLogin } from "@features/auth/schemas/auth.schema"
import { erroresDe } from "@features/auth/schemas/errores"
import { useTextos } from "@shared/textos/useTextos"

interface LoginProps {
  onSubmit: (datos: DatosLogin) => Promise<void>
  cargando?: boolean
  error?: string | null
  /**
   * Barbería por cuya puerta se entra. Viene de la RUTA, nunca de un campo del
   * formulario: aquí solo se reenvía al acceso con Google para que la vuelta
   * sepa a dónde entrar. Ausente en la puerta global.
   */
  slug?: string
  /**
   * El acceso demo, cuando el entorno lo ofrece. Ausente = no se pinta: ni en
   * la puerta de una barbería —ahí se viene a entrar a ESA, no a mirar otra—
   * ni donde la API no tiene cuenta demo configurada.
   */
  demo?: { onEntrar: () => void; cargando: boolean }
}

/*
  La tarjeta entra desde abajo y sale hacia arriba al autenticar.

  La ENTRADA se toma su tiempo —recorrido largo y escalonado visible— porque es
  la primera impresión del producto y lo que se recuerda de él. La SALIDA no:
  dura menos de la mitad, y no es por estética sino porque `onExitComplete` es
  quien navega, así que cada milisegundo que dura es un milisegundo en el que el
  panel todavía no ha empezado a cargar.
*/
const tarjeta: Variants = {
  oculto: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 170,
      damping: 21,
      staggerChildren: 0.07,
      delayChildren: 0.09,
    },
  },
  salida: {
    opacity: 0,
    y: -28,
    scale: 0.98,
    transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] },
  },
}

const bloque: Variants = {
  oculto: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 240, damping: 24 } },
}

/*
  Las líneas se DIBUJAN, no aparecen. El separador del «o» y la perforación del
  ticket entraban dentro de su bloque, como un rectángulo que se funde: una raya
  que nace en un punto y recorre su ancho es lo que hace que se lea como un
  corte del papel y no como un borde que estaba ahí. Es `scaleX`, así que no
  toca el layout ni obliga a repintar a nadie.
*/
const linea: Variants = {
  oculto: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] } },
}

/*
  Los dos agujeros del ticket entran con resorte, y desde 0.4 y no desde cero:
  una escala que arranca en 0 no tiene dimensión de la que crecer y el ojo lo lee
  como una aparición brusca, no como algo que se abre.
*/
const perforacion: Variants = {
  oculto: { scale: 0.4, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 420, damping: 20 },
  },
}

// Presentacional: el contenedor de la ruta entrega el submit y el estado por props.
export function Login({ onSubmit, cargando, error, slug, demo }: LoginProps) {
  const t = useTextos()
  const [verContrasena, setVerContrasena] = useState(false)
  // El schema se rehace si cambia el idioma: sus mensajes también se leen.
  const esquema = useMemo(() => esquemaLogin(erroresDe(t)), [t])
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<DatosLogin>({
    resolver: standardSchemaResolver(esquema),
    defaultValues: { correo: "", contrasena: "", recordarme: true },
  })

  const enviar = handleSubmit(async (datos) => {
    await onSubmit(datos)
  })

  const deshabilitado = isSubmitting || !!cargando

  return (
    <motion.div
      className="acceso-tarjeta w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card/85 shadow-xl backdrop-blur-xl"
      variants={tarjeta}
      initial="oculto"
      animate="visible"
      exit="salida"
    >
      {/* Cinta de barbero — sello de la marca en la cabecera del ticket. Se
          despliega de izquierda a derecha y con calma: es lo primero que se
          mueve y lo que fija el carácter de la pantalla */}
      <motion.div
        className="cinta-barberia h-1.5 w-full origin-left"
        initial={{ scaleX: 0 }}
        animate={{
          scaleX: 1,
          transition: { duration: 0.65, ease: [0.23, 1, 0.32, 1], delay: 0.2 },
        }}
        aria-hidden
      />

      <div className="p-(--acceso-borde)">
        <motion.div variants={bloque}>
          <div className="flex items-start justify-between gap-3">
            <LogoBarion variante="icono" priority className="h-(--acceso-logo)" />
            {/*
              La puerta dice de QUIÉN es. Entrar por `/b/{slug}/entrar` y por la
              puerta global se veía exactamente igual, así que quien llega desde
              el enlace de su barbería no tenía forma de saber a dónde está
              entrando — y eso importa justo cuando alguien trabaja en dos.
              Sin slug se conserva el indicador de siempre.
            */}
            {slug ? (
              <span className="flex max-w-[55%] items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                <Store className="size-3.5 shrink-0" aria-hidden />
                <span className="truncate">{slug}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-xs font-medium tracking-widest text-muted-foreground uppercase">
                <span className="size-1.5 rounded-full bg-(--exito)" aria-hidden />
                {t("auth.login.enLinea")}
              </span>
            )}
          </div>
          {/*
            Es el título de la página y no un subtítulo del panel de marca: ese
            panel se esconde por debajo de `lg`, así que en un móvil el `h1` de
            la pantalla desaparecía y el primer encabezado que encontraba un
            lector era un `h2` colgando de nada.
          */}
          <h1 className="mt-(--acceso-salto) text-2xl font-bold text-balance text-foreground sm:text-3xl">
            {slug ? t("auth.login.tituloBarberia") : t("auth.login.tituloGlobal")}
          </h1>
          <p className="mt-1.5 text-sm text-pretty text-muted-foreground">
            {slug ? t("auth.login.descripcionBarberia") : t("auth.login.descripcionGlobal")}
          </p>
        </motion.div>

        {/*
          ── `suppressHydrationWarning` en el formulario y en sus dos campos ──
          El gestor de contraseñas de Google/Chrome les mete un atributo propio
          (`__gcruniqueid`) ANTES de que React hidrate, así que el HTML del
          servidor y el del navegador dejan de coincidir y React lo denuncia con
          un error de hidratación enorme. No es un fallo de este código y no hay
          nada que arreglar en él: el atributo lo pone un tercero sobre el que no
          mandamos, y pasa sobre todo en móvil al volver del acceso con Google.

          Se silencia SOLO aquí —el atributo solo aparece en campos de
          credenciales— y elemento por elemento, porque la supresión no se hereda
          a los hijos. Lo que se pierde a cambio es la denuncia de un desajuste
          real en estos tres nodos, que es un precio pequeño frente a un error de
          consola que aparece en cada inicio de sesión y tapa a los de verdad.
        */}
        <form
          className="mt-(--acceso-salto) flex flex-col gap-(--acceso-aire)"
          onSubmit={enviar}
          noValidate
          suppressHydrationWarning
        >
          <motion.div variants={bloque}>
            <Field data-invalid={!!errors.correo}>
              <FieldLabel htmlFor="correo">{t("auth.login.correo")}</FieldLabel>
              <Input
                id="correo"
                type="email"
                autoComplete="email"
                suppressHydrationWarning
                placeholder={t("auth.login.correoPlaceholder")}
                aria-invalid={!!errors.correo}
                {...register("correo")}
              />
              <FieldError errors={[errors.correo]} />
            </Field>
          </motion.div>

          <motion.div variants={bloque}>
            <Field data-invalid={!!errors.contrasena}>
              <FieldLabel htmlFor="contrasena">{t("auth.login.contrasena")}</FieldLabel>
              <div className="relative">
                <Input
                  id="contrasena"
                  suppressHydrationWarning
                  type={verContrasena ? "text" : "password"}
                  autoComplete="current-password"
                  aria-invalid={!!errors.contrasena}
                  className="pr-11"
                  {...register("contrasena")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setVerContrasena(!verContrasena)}
                  aria-label={verContrasena ? t("auth.login.ocultar") : t("auth.login.mostrar")}
                  className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground"
                >
                  {verContrasena ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
                </Button>
              </div>
              <FieldError errors={[errors.contrasena]} />
            </Field>
          </motion.div>

          {/*
            Recordarme y la salida de quien perdió la clave comparten fila: es
            donde se buscan los dos, y en filas separadas costaban dos renglones
            de una tarjeta que ya no cabía en un portátil. `flex-wrap` las parte
            solo si el idioma alarga el texto lo suficiente.
          */}
          <motion.div
            className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2"
            variants={bloque}
          >
            <label
              htmlFor="recordarme"
              className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground"
            >
              <Controller
                control={control}
                name="recordarme"
                render={({ field }) => (
                  <Checkbox
                    id="recordarme"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              {t("auth.login.recordarme")}
            </label>
            <Link
              href={slug ? `/recuperar?slug=${encodeURIComponent(slug)}` : "/recuperar"}
              className="rounded-sm text-sm font-medium text-primary underline-offset-4 transition-colors hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              {t("auth.login.olvidaste")}
            </Link>
          </motion.div>

          {/*
            El fallo de credenciales no es de un campo —no se sabe cuál de los
            dos está mal, y decirlo sería un oráculo—, así que se anuncia junto
            al botón que acaba de fallar y no bajo un input. Con recuadro y
            icono: en texto suelto y a 12px se perdía contra el resto.
          */}
          <AnimatePresence>
            {error && (
              <motion.div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div variants={bloque}>
            <motion.div whileTap={{ scale: 0.97 }}>
              <Button type="submit" disabled={deshabilitado} className="w-full font-semibold">
                {deshabilitado ? (
                  <Loader2 className="animate-spin" aria-hidden />
                ) : (
                  <>
                    {t("auth.login.entrar")} <ArrowRight aria-hidden />
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>
        </form>

        <motion.div className="mt-(--acceso-salto)" variants={bloque}>
          {/* Las dos mitades se dibujan HACIA AFUERA desde la palabra: cada una
              con su origen apuntando al centro, así el corte nace donde está el
              «o» en vez de barrer la tarjeta de un lado al otro */}
          <div className="flex items-center gap-3">
            <motion.span
              className="h-px flex-1 origin-right bg-border"
              variants={linea}
              aria-hidden
            />
            <span className="text-xs text-muted-foreground">{t("auth.login.o")}</span>
            <motion.span
              className="h-px flex-1 origin-left bg-border"
              variants={linea}
              aria-hidden
            />
          </div>

          {/* Enlace y no botón con fetch: el acceso con Google es una NAVEGACIÓN
              del navegador hasta Google y de vuelta a la API, que es quien deja
              la cookie. Una petición desde el código no puede seguir ese viaje. */}
          <a
            href={`${env.apiUrl}/auth/oauth/google${slug ? `?slug=${encodeURIComponent(slug)}` : ""}`}
            className={cn(buttonVariants({ variant: "outline" }), "mt-(--acceso-aire) w-full")}
          >
            <LogoGoogle aria-hidden />
            {t("auth.login.google")}
          </a>
        </motion.div>

        {/* El alta abierta es de ESTA aplicación (`/registro`), así que va con
            next/link. Estuvo como botón sin destino: el sitio parecía tener
            registro y la única forma de llegar era teclear la dirección */}
        <motion.p
          className="mt-(--acceso-salto) text-center text-sm text-muted-foreground"
          variants={bloque}
        >
          {t("auth.login.sinCuenta")}{" "}
          <Link
            href={rutasPublicas.registro}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {t("auth.login.registrarse")}
          </Link>
        </motion.p>
      </div>

      {/* Borde perforado tipo ticket de turno. El talón es el acceso demo, así
          que sin demo no hay talón: una línea punteada que corta hacia nada se
          lee como una tarjeta a la que le falta un trozo. */}
      {demo && (
        <motion.div className="relative" variants={bloque}>
          <motion.div
            className="absolute -top-2 -left-2 size-4 rounded-full border border-border bg-background"
            variants={perforacion}
            aria-hidden
          />
          <motion.div
            className="absolute -top-2 -right-2 size-4 rounded-full border border-border bg-background"
            variants={perforacion}
            aria-hidden
          />
          {/* La línea punteada se rasga de izquierda a derecha, como se arranca
              un resguardo de verdad */}
          <motion.div
            className="origin-left border-t border-dashed border-border"
            variants={linea}
            aria-hidden
          />
          {/* El acceso de demostración cabe en una línea: es un atajo de prueba,
              no una tercera forma de entrar, y ocupando tres renglones pesaba en
              la tarjeta más que el propio formulario.

              Es un botón y no un enlace: antes navegaba a /dashboard sin sesión
              y el panel devolvía aquí mismo. Ahora pide a la API una sesión de
              solo lectura y entra por el mismo camino que el login. */}
          <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 px-(--acceso-borde) py-3.5 text-center">
            <span className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
              {t("auth.login.demo")}
            </span>
            <Button
              type="button"
              variant="link"
              onClick={demo.onEntrar}
              disabled={deshabilitado || demo.cargando}
              className="h-auto min-h-11 gap-1.5 px-1 py-1 text-sm font-medium hover:no-underline md:min-h-9"
            >
              {t("auth.login.demoEntrar")}
              {demo.cargando ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
              ) : (
                <ArrowRight className="size-3.5" aria-hidden />
              )}
            </Button>
          </div>
          <p className="-mt-2 px-(--acceso-borde) pb-3.5 text-center text-xs text-muted-foreground">
            {t("auth.login.demoAviso")}
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}
