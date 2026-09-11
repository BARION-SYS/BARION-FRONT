"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useForm, useWatch } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { AnimatePresence, motion } from "motion/react"
import { AlertCircle, ArrowRight, Link2Off, Loader2, LockKeyhole } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { useTextos } from "@shared/textos/useTextos"
import { CampoContrasena } from "@features/auth/components/CampoContrasena"
import { RequisitosContrasena } from "@features/auth/components/RequisitosContrasena"
import { TarjetaAcceso, bloqueAcceso } from "@features/auth/components/TarjetaAcceso"
import {
  esquemaNuevaContrasena,
  type DatosNuevaContrasena,
} from "@features/auth/schemas/auth.schema"
import { erroresDe } from "@features/auth/schemas/errores"

/** El mismo mínimo que el schema: si cambia allí, tiene que cambiar aquí. */
const LARGO_MINIMO = 12

interface NuevaContrasenaProps {
  /** Sin token no hay nada que hacer: el enlace llegó incompleto. */
  tokenPresente: boolean
  cargando?: boolean
  /** El enlace no sirve —caducó, ya se usó, no existe— o falló el envío. */
  error?: string | null
  onSubmit: (datos: DatosNuevaContrasena) => Promise<void>
}

/**
 * Elegir la contraseña nueva con el enlace del correo.
 *
 * El token no es un campo: viaja en la dirección y lo entrega la página. Un
 * enlace inservible se explica una vez y se ofrece pedir otro — un error sin
 * salida deja a la persona igual de fuera que antes.
 */
export function NuevaContrasena({
  tokenPresente,
  cargando,
  error,
  onSubmit,
}: NuevaContrasenaProps) {
  const t = useTextos("auth.nuevaContrasena")
  const tRaiz = useTextos()
  const [visible, setVisible] = useState(false)
  const esquema = useMemo(() => esquemaNuevaContrasena(erroresDe(tRaiz)), [tRaiz])
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<DatosNuevaContrasena>({
    resolver: standardSchemaResolver(esquema),
    defaultValues: { contrasenaNueva: "", confirmacion: "" },
  })
  const [nueva, confirmacion] = useWatch({ control, name: ["contrasenaNueva", "confirmacion"] })

  const enviando = cargando || isSubmitting

  const pie = (
    <Link
      href="/recuperar"
      className="inline-flex min-h-11 items-center rounded-sm text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none md:min-h-9"
    >
      {t("pedirOtro")}
    </Link>
  )

  if (!tokenPresente) {
    return (
      <TarjetaAcceso
        insignia={t("insignia")}
        icono={Link2Off}
        tono="advertencia"
        titulo={t("enlaceIncompletoTitulo")}
        descripcion={t("enlaceIncompleto")}
        pie={pie}
      />
    )
  }

  return (
    <TarjetaAcceso
      insignia={t("insignia")}
      icono={LockKeyhole}
      titulo={t("titulo")}
      descripcion={t("descripcion")}
      pie={pie}
    >
      <motion.form
        variants={bloqueAcceso}
        onSubmit={(e) => void handleSubmit(onSubmit)(e)}
        noValidate
        suppressHydrationWarning
        className="mt-(--acceso-salto) flex flex-col gap-(--acceso-aire)"
      >
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
          ]}
        />

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
      </motion.form>
    </TarjetaAcceso>
  )
}
