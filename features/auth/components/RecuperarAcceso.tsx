"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { motion } from "motion/react"
import { ArrowLeft, ArrowRight, Inbox, KeyRound, Loader2, MailCheck, Users } from "lucide-react"
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
 * cuenta en Barion. Lo que sí hace ahora es ayudar con lo que se puede decir sin
 * revelar nada: a qué dirección se pidió, dónde mirar si no llega, y que dentro
 * de una barbería quien la administra puede darte otra contraseña.
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
        <motion.ul
          variants={bloqueAcceso}
          className="mt-(--acceso-salto) flex flex-col gap-3 rounded-xl border border-border bg-secondary/40 p-4"
        >
          <li className="flex items-start gap-3 text-sm text-muted-foreground">
            <Inbox className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            {t("consejoSpam")}
          </li>
          <li className="flex items-start gap-3 text-sm text-muted-foreground">
            <Users className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            {t("consejoEquipo")}
          </li>
        </motion.ul>
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
