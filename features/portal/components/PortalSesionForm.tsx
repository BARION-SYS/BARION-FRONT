"use client"

import { Controller, useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Loader2, MailWarning, ShieldCheck } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Checkbox } from "@shared/components/ui/checkbox"
import { Field, FieldError, FieldLabel } from "@shared/components/ui/field"
import { Textarea } from "@shared/components/ui/textarea"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import { inicialesDe } from "@features/portal/utils/formato"
import {
  esquemaReservaConSesion,
  type DatosReservaConSesion,
} from "@features/portal/schemas/portal.schema"

interface PortalSesionFormProps {
  nombre: string
  /** El correo de su ficha: el único canal por el que puede salir un código. */
  email: string
  /**
   * `false` = su ficha existe pero **no es una identidad probada** y no reserva
   * sola. Pasa con quien registró alguien del mostrador: cuenta para el historial
   * y su cita la agenda su barbero.
   */
  verificado: boolean
  /** `true` = ya dio el permiso de novedades, así que no se le vuelve a pedir. */
  aceptaPromosVigente: boolean
  cargando?: boolean
  onSubmit: (datos: DatosReservaConSesion) => Promise<void>
  onNoSoyYo: () => void
}

/**
 * Paso 4 **con sesión**: confirmar, no darse de alta.
 *
 * Quien ya entró con su código no vuelve a escribir su nombre, su teléfono ni su
 * correo: la api los tiene y preguntarlos otra vez es pedirle a alguien que
 * demuestre lo que acaba de demostrar. Aquí solo se pide lo que es de ESTA cita.
 *
 * **Tener sesión y ser una identidad probada son cosas distintas.** Cuando la
 * ficha no está verificada esto no reserva: manda el código al correo y la
 * pantalla sigue por ahí. Deducir lo segundo de lo primero es exactamente el
 * defecto que la api comprueba aparte.
 *
 * «No soy yo» cierra la sesión de verdad —la cookie es del servidor— y devuelve
 * el formulario de siempre: un ordenador compartido o el móvil de un amigo son
 * casos normales en una barbería.
 */
export function PortalSesionForm({
  nombre,
  email,
  verificado,
  aceptaPromosVigente,
  cargando,
  onSubmit,
  onNoSoyYo,
}: PortalSesionFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DatosReservaConSesion>({
    resolver: standardSchemaResolver(esquemaReservaConSesion),
    defaultValues: { notas: "", aceptaPromos: false },
  })

  const deshabilitado = isSubmitting || !!cargando

  return (
    <form className="space-y-4" onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
      <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 p-3">
        <InitialsAvatar iniciales={inicialesDe(nombre)} tamano="md" />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            La cita va a nombre de
          </p>
          <p className="truncate text-sm font-semibold text-foreground">{nombre}</p>
          <p className="truncate text-xs text-muted-foreground">{email}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={onNoSoyYo}
          disabled={deshabilitado}
          className="h-11 shrink-0 cursor-pointer text-xs font-medium text-muted-foreground"
        >
          No soy yo
        </Button>
      </div>

      {!verificado && (
        <div className="flex items-start gap-2 rounded-xl bg-[color-mix(in_srgb,var(--advertencia)_12%,transparent)] p-3">
          <MailWarning className="mt-0.5 h-4 w-4 shrink-0 text-(--advertencia)" aria-hidden />
          <p className="text-xs text-muted-foreground">
            Nos falta confirmar que <span className="font-semibold">{email}</span> es tuyo. Te
            enviamos un código y con eso queda lista la reserva.
          </p>
        </div>
      )}

      <Field data-invalid={!!errors.notas}>
        <FieldLabel htmlFor="notas">Notas para el barbero (opcional)</FieldLabel>
        <Textarea
          id="notas"
          rows={2}
          placeholder="Ej. fade bajo, dejar la barba corta"
          aria-invalid={!!errors.notas}
          className="text-base"
          {...register("notas")}
        />
        <FieldError errors={[errors.notas]} />
      </Field>

      {/* El consentimiento solo se pide a quien no lo ha dado: preguntarlo dos
          veces sugiere que la primera no valió. */}
      {!aceptaPromosVigente && (
        <Controller
          control={control}
          name="aceptaPromos"
          render={({ field }) => (
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3">
              <Checkbox
                id="aceptaPromos"
                checked={field.value === true}
                onCheckedChange={(valor) => field.onChange(valor === true)}
              />
              <span className="text-xs text-muted-foreground">
                Quiero recibir novedades y promociones de esta barbería. Puedes retirarlo cuando
                quieras desde «Mis citas».
              </span>
            </label>
          )}
        />
      )}

      <div className="flex items-start gap-2 rounded-xl bg-secondary/60 p-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-(--exito)" aria-hidden />
        <p className="text-xs text-muted-foreground">
          Tus datos son de esta barbería y de nadie más. La cita se paga en el local.
        </p>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={deshabilitado}
        className="h-12 w-full cursor-pointer text-sm font-semibold"
      >
        {deshabilitado ? (
          <Loader2 className="animate-spin" aria-hidden />
        ) : verificado ? (
          "Confirmar reserva"
        ) : (
          "Enviarme el código"
        )}
      </Button>
    </form>
  )
}
