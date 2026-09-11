"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useForm, useWatch } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { AnimatePresence, motion } from "motion/react"
import { AlertCircle, ArrowRight, KeyRound, LifeBuoy, Loader2, LogOut } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { rutasPublicas } from "@routes/rutasPublicas"
import { useTextos } from "@shared/textos/useTextos"
import { CampoContrasena } from "@features/auth/components/CampoContrasena"
import { PuertaAcceso } from "@features/auth/components/PuertaAcceso"
import { RequisitosContrasena } from "@features/auth/components/RequisitosContrasena"
import { TarjetaAcceso, bloqueAcceso } from "@features/auth/components/TarjetaAcceso"
import {
  esquemaCambioContrasena,
  type DatosCambioContrasena,
} from "@features/auth/schemas/auth.schema"
import { erroresDe } from "@features/auth/schemas/errores"

/** El mismo mínimo que el schema: si cambia allí, tiene que cambiar aquí. */
const LARGO_MINIMO = 12

interface CambioObligatorioProps {
  /** Con qué nombre se dirige a la persona. Null en el staff de plataforma. */
  nombre?: string | null
  /** Con qué cuenta entró: quien tiene dos tiene que saber cuál está cambiando. */
  email?: string | null
  cargando?: boolean
  /**
   * El rechazo de la API —por ejemplo, la contraseña actual no es la buena—.
   * Se pinta junto al botón y no bajo un campo: la API dice que falló el cambio,
   * y el lugar donde se mira tras pulsar es el botón que se acaba de pulsar.
   */
  error?: string | null
  onSubmit: (datos: DatosCambioContrasena) => Promise<void>
  onSalir: () => void
}

/**
 * La pantalla que se pinta EN LUGAR del panel mientras la persona arrastre una
 * contraseña que le puso otro.
 *
 * No es un aviso que se pueda cerrar, y esa es toda su razón de ser: la API
 * responde 403 a cualquier otra ruta, así que dejar el panel debajo solo serviría
 * para llenar la pantalla de errores sin explicar por qué. Aquí se explica una
 * vez y se ofrece la única salida — con el mismo marco que el login, porque es
 * la continuación directa de haber entrado.
 *
 * Presentacional: el submit y el estado los entrega el padre por props.
 */
export function CambioObligatorio({
  nombre,
  email,
  cargando,
  error,
  onSubmit,
  onSalir,
}: CambioObligatorioProps) {
  const t = useTextos("auth.cambioObligatorio")
  const tRaiz = useTextos()
  const [visible, setVisible] = useState(false)
  const esquema = useMemo(() => esquemaCambioContrasena(erroresDe(tRaiz)), [tRaiz])
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<DatosCambioContrasena>({
    resolver: standardSchemaResolver(esquema),
    defaultValues: { contrasenaActual: "", contrasenaNueva: "", confirmacion: "" },
  })
  const [actual, nueva, confirmacion] = useWatch({
    control,
    name: ["contrasenaActual", "contrasenaNueva", "confirmacion"],
  })

  const enviando = cargando || isSubmitting

  return (
    <PuertaAcceso>
      <TarjetaAcceso
        insignia={t("insignia")}
        icono={KeyRound}
        tono="advertencia"
        titulo={nombre ? t("saludo", { nombre }) : t("tituloSinNombre")}
        descripcion={t("descripcion")}
        pie={
          <Button
            type="button"
            variant="ghost"
            onClick={onSalir}
            className="min-h-11 gap-1.5 text-sm text-muted-foreground md:min-h-9"
          >
            <LogOut className="size-4" aria-hidden />
            {tRaiz("comun.cerrarSesion")}
          </Button>
        }
      >
        {email && (
          <motion.p
            variants={bloqueAcceso}
            className="mt-(--acceso-salto) truncate rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-muted-foreground"
          >
            {t("cuenta", { email })}
          </motion.p>
        )}

        <motion.form
          variants={bloqueAcceso}
          onSubmit={(e) => void handleSubmit(onSubmit)(e)}
          noValidate
          suppressHydrationWarning
          className="mt-(--acceso-salto) flex flex-col gap-(--acceso-aire)"
        >
          <CampoContrasena
            id="contrasenaActual"
            etiqueta={t("actual")}
            placeholder={t("actualPlaceholder")}
            registro={register("contrasenaActual")}
            error={errors.contrasenaActual?.message}
            autoComplete="current-password"
          />

          {/* La actual y la nueva, separadas: son dos preguntas distintas —la
              que te dieron y la que eliges— y juntas se leían como un solo
              formulario de tres casillas iguales. */}
          <div className="flex flex-col gap-(--acceso-aire) border-t border-dashed border-border pt-(--acceso-aire)">
            <CampoContrasena
              id="contrasenaNueva"
              etiqueta={t("contrasenaNueva")}
              registro={register("contrasenaNueva")}
              error={errors.contrasenaNueva?.message}
              autoComplete="new-password"
              visible={visible}
              alternar={{
                onClick: () => setVisible((v) => !v),
                mostrar: t("mostrar"),
                ocultar: t("ocultar"),
              }}
            />
            <CampoContrasena
              id="confirmacion"
              etiqueta={t("repite")}
              registro={register("confirmacion")}
              error={errors.confirmacion?.message}
              autoComplete="new-password"
              visible={visible}
            />

            <RequisitosContrasena
              requisitos={[
                {
                  clave: "largo",
                  texto: tRaiz("auth.requisitos.largo"),
                  cumple: nueva.length >= LARGO_MINIMO,
                },
                {
                  clave: "coinciden",
                  texto: tRaiz("auth.requisitos.coinciden"),
                  cumple: nueva.length > 0 && nueva === confirmacion,
                },
                {
                  clave: "distinta",
                  texto: tRaiz("auth.requisitos.distinta"),
                  cumple: nueva.length > 0 && nueva !== actual,
                },
              ]}
            />
          </div>

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

          {/*
            ── La salida, y por qué está SIEMPRE a la vista ────────────────────
            Esta pantalla pide una contraseña que la persona no eligió: se la
            dieron. Cuando no la tiene —se la dictaron mal, la perdió, cambió de
            equipo— el único camino era escribir algo, recibir «la contraseña
            actual no es correcta» y volver a intentarlo, contra una pantalla que
            además no deja ir a ninguna otra parte. Eso es quedarse encerrado
            fuera de la propia cuenta.

            Las dos salidas van juntas y en este orden a propósito: la primera es
            inmediata y no depende de ningún correo —quien administra la barbería
            reemplaza la contraseña desde Equipo—, y la segunda es la lenta, para
            quien no tiene a nadie a quien pedírselo.

            No se enseña solo tras fallar. Quien llega sin la clave ya lo sabe al
            llegar, y hacerle fallar primero para enseñarle la puerta es cobrarle
            un intento por información que se le podía haber dado antes.

            Va DEBAJO del botón, y eso no es un detalle de maquetación: puesta
            encima empujaba «Guardar y entrar» fuera de la ventana en un portátil,
            y la pantalla acababa escondiendo su acción principal para enseñar la
            de rescate.
          */}
          <motion.div whileTap={{ scale: 0.97 }}>
            <Button type="submit" disabled={enviando} className="w-full font-semibold">
              {enviando ? (
                <Loader2 className="animate-spin" aria-hidden />
              ) : (
                <>
                  {t("guardar")} <ArrowRight aria-hidden />
                </>
              )}
            </Button>
          </motion.div>

          <div className="rounded-xl border border-border bg-secondary/40 px-3.5 py-3">
            <p className="flex items-start gap-2.5 text-sm font-medium text-foreground">
              <LifeBuoy className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              {t("salidaTitulo")}
            </p>
            <p className="mt-1.5 pl-6.5 text-sm text-pretty text-muted-foreground">
              {t("salidaEquipo")}
            </p>
            <Link
              href={rutasPublicas.recuperar}
              className="mt-2 ml-6.5 inline-flex min-h-11 items-center gap-1 rounded-sm text-sm font-medium text-primary underline-offset-4 transition-colors hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none md:min-h-9"
            >
              {t("salidaEnlace")}
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        </motion.form>
      </TarjetaAcceso>
    </PuertaAcceso>
  )
}
