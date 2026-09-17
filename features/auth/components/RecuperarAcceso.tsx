"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { motion } from "motion/react"
import {
  ArrowLeft,
  ArrowRight,
  AtSign,
  Building2,
  Inbox,
  KeyRound,
  Loader2,
  MailCheck,
  ShieldQuestion,
  Users,
} from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@shared/components/ui/field"
import { Input } from "@shared/components/ui/input"
import { useTextos } from "@shared/textos/useTextos"
import { TarjetaAcceso, bloqueAcceso } from "@features/auth/components/TarjetaAcceso"
import {
  esquemaSolicitudRecuperacion,
  type DatosSolicitudRecuperacion,
} from "@features/auth/schemas/auth.schema"
import { erroresDe } from "@features/auth/schemas/errores"

/**
 * Las cuatro razones por las que un enlace no aparece, en el orden en que hay
 * que descartarlas: primero lo que pasa casi siempre —el filtro de spam—, y al
 * final lo que le pasa a poca gente pero no tiene arreglo esperando.
 *
 * El último dejó de ser «eres del equipo de Barion»: a esa cuenta el enlace ya le
 * llega, desde que el token puede emitirse sin barbería. Lo que queda sin correo
 * es la cuenta a la que le quitaron el acceso, y eso no se arregla recuperando la
 * contraseña.
 *
 * Igual que en el panel de marca, el icono va aquí y el texto en el diccionario:
 * lo que no cambia con el idioma es cuál acompaña a cuál.
 */
const CONSEJOS = [
  { clave: "consejoSpam", icono: Inbox },
  { clave: "consejoOtro", icono: AtSign },
  { clave: "consejoEquipo", icono: Users },
  { clave: "consejoStaff", icono: Building2 },
] as const

interface RecuperarAccesoProps {
  cargando?: boolean
  /**
   * El correo al que se pidió el enlace, o `null` mientras no se ha pedido. Es
   * lo que cambia la tarjeta de «pedir» a «revisa tu correo».
   */
  correoEnviado: string | null
  /** A dónde vuelve el enlace de «atrás»: la puerta desde la que se llegó. */
  volverA: string
  onSubmit: (datos: DatosSolicitudRecuperacion) => Promise<void>
  /** Volver al formulario: quien se equivocó de correo no tiene por qué recargar. */
  onOtroCorreo: () => void
}

/**
 * Pedir el enlace para volver a entrar.
 *
 * La respuesta es siempre la misma, exista o no ese correo, así que la pantalla
 * no promete que el mensaje va en camino: dice qué pasará SI esa cuenta existe.
 * Prometer de más convertiría el formulario en un directorio de quién tiene
 * cuenta en Barion.
 *
 * Esa ambigüedad es obligatoria, pero dejarla sola era el problema: quien no
 * recibía nada se quedaba sin saber si esperar, si se había equivocado de
 * dirección o si el sistema estaba roto, y lo único que podía hacer era volver a
 * pulsar el botón. Ahora la confirmación explica POR QUÉ no se puede confirmar y
 * enumera las cuatro razones reales de que no aparezca un enlace, cada una con
 * su salida. Se puede ser preciso en todo lo demás sin revelar lo único que no
 * se debe.
 *
 * Son dos tarjetas —pedir y confirmar— y no una que cambia por dentro: con
 * `key` distinta, la de confirmar entra con su propio movimiento, que es lo que
 * hace que se note que la petición salió.
 */
export function RecuperarAcceso({
  cargando,
  correoEnviado,
  volverA,
  onSubmit,
  onOtroCorreo,
}: RecuperarAccesoProps) {
  const t = useTextos("auth.recuperar")
  const tRaiz = useTextos()
  const esquema = useMemo(() => esquemaSolicitudRecuperacion(erroresDe(tRaiz)), [tRaiz])
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DatosSolicitudRecuperacion>({
    resolver: standardSchemaResolver(esquema),
    defaultValues: { email: correoEnviado ?? "" },
  })

  const enviando = cargando || isSubmitting

  const volver = (
    <Link
      href={volverA}
      className="inline-flex min-h-11 items-center gap-1.5 rounded-sm text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none md:min-h-9"
    >
      <ArrowLeft className="size-4" aria-hidden />
      {t("volver")}
    </Link>
  )

  if (correoEnviado) {
    return (
      <TarjetaAcceso
        key="enviado"
        insignia={t("insignia")}
        icono={MailCheck}
        tono="exito"
        titulo={t("enviadoTitulo")}
        descripcion={t("enviadoA", { correo: correoEnviado })}
        pie={
          <>
            {volver}
            <Button
              type="button"
              variant="link"
              onClick={onOtroCorreo}
              className="h-auto min-h-11 px-1 text-sm md:min-h-9"
            >
              {t("otroCorreo")}
            </Button>
          </>
        }
      >
        {/*
          ── Por qué esta pantalla NO dice si el correo salió ──────────────────
          Porque decirlo convierte el formulario en un buscador de quién tiene
          cuenta en Barion: se prueban direcciones hasta que una responda
          distinto. Es la misma razón por la que la api responde 200 siempre.

          Lo que sí se arregla es lo otro: antes se quedaba en «si tiene cuenta,
          le llegará» y ahí terminaba, así que quien no recibía nada no tenía
          ningún paso siguiente y volvía a pulsar el botón. Ahora se dice por qué
          no se puede confirmar —que es honesto y se entiende— y se ponen las
          CUATRO razones reales por las que un enlace no aparece, cada una con lo
          que hay que hacer. Entre ellas la que más despista: el equipo de Barion
          no recibe este correo NUNCA, porque su cuenta no cuelga de ninguna
          barbería, y sin decirlo se queda esperando un mensaje que no existe.
        */}
        <motion.p
          variants={bloqueAcceso}
          className="mt-(--acceso-salto) flex items-start gap-2.5 rounded-lg border border-border bg-secondary/30 px-3 py-2.5 text-xs text-pretty text-muted-foreground"
        >
          <ShieldQuestion className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
          {t("porQueAsi")}
        </motion.p>

        {/*
          Una caja con cuatro filas y no cuatro tarjetas: separadas, cada razón
          pesaba lo mismo que el mensaje principal y la tarjeta crecía hasta
          salirse de la ventana en un portátil. Juntas se leen por lo que son —una
          lista para descartar de arriba abajo— y caben.
        */}
        <motion.div variants={bloqueAcceso} className="mt-(--acceso-salto)">
          <h2 className="text-sm font-semibold text-foreground">{t("siNoLlega")}</h2>
          <ul className="mt-2.5 divide-y divide-border overflow-hidden rounded-xl border border-border bg-secondary/40">
            {CONSEJOS.map(({ clave, icono: Icono }) => (
              <li
                key={clave}
                className="flex items-start gap-3 px-3.5 py-2.5 text-sm text-pretty text-muted-foreground"
              >
                <Icono className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                {t(clave)}
              </li>
            ))}
          </ul>
        </motion.div>
      </TarjetaAcceso>
    )
  }

  return (
    <TarjetaAcceso
      key="pedir"
      insignia={t("insignia")}
      icono={KeyRound}
      titulo={t("titulo")}
      descripcion={t("descripcion")}
      pie={volver}
    >
      <motion.form
        variants={bloqueAcceso}
        onSubmit={(e) => void handleSubmit(onSubmit)(e)}
        noValidate
        suppressHydrationWarning
        className="mt-(--acceso-salto) flex flex-col gap-(--acceso-aire)"
      >
        <Field data-invalid={Boolean(errors.email)}>
          <FieldLabel htmlFor="email">{t("correo")}</FieldLabel>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoFocus
            suppressHydrationWarning
            placeholder={tRaiz("auth.login.correoPlaceholder")}
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
          {errors.email && <FieldError>{errors.email.message}</FieldError>}
        </Field>

        <motion.div whileTap={{ scale: 0.97 }}>
          <Button type="submit" disabled={enviando} className="w-full font-semibold">
            {enviando ? (
              <Loader2 className="animate-spin" aria-hidden />
            ) : (
              <>
                {t("enviar")} <ArrowRight aria-hidden />
              </>
            )}
          </Button>
        </motion.div>
      </motion.form>
    </TarjetaAcceso>
  )
}
