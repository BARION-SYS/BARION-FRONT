"use client"

import { Controller, useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Loader2 } from "lucide-react"
import {
  esquemaRegistrarClienteGoogle,
  type DatosRegistrarClienteGoogle,
} from "@features/portal/schemas/portal.schema"
import type { PreregistroClientePortal } from "@features/portal/types/portal.types"
import { type CodigoRegion } from "@config/regiones"
import { LogoGoogle } from "@shared/components/brand/LogoGoogle"
import { CampoTelefono } from "@shared/components/forms/CampoTelefono"
import { Button } from "@shared/components/ui/button"
import { Checkbox } from "@shared/components/ui/checkbox"
import { Field, FieldDescription, FieldError, FieldLabel } from "@shared/components/ui/field"
import { Input } from "@shared/components/ui/input"

interface PortalGoogleFormProps {
  onSubmit: (datos: DatosRegistrarClienteGoogle) => Promise<void>
  /** Con qué cuenta vuelve del proveedor. Su correo ya está comprobado. */
  preregistro: PreregistroClientePortal
  /**
   * País de la barbería, para sugerir el indicativo. `undefined` cuando la api
   * devuelve uno que este repo no declara: se cae a la lista, nunca a un
   * indicativo inventado.
   */
  paisSugerido?: CodigoRegion
  cargando?: boolean
}

/**
 * Primera vez en esta barbería entrando con Google.
 *
 * **Solo aparece si no había ficha.** Quien ya es cliente entra directo desde el
 * callback y nunca ve esta pantalla — pedirle otra vez su teléfono a alguien que
 * lleva dos años viniendo sería un paso inventado.
 *
 * Dos campos y ya: el correo lo puso Google y el código no existe. El teléfono
 * se queda porque Google no lo entrega y la barbería tiene que poder llamar a
 * quien va a atender.
 */
export function PortalGoogleForm({
  onSubmit,
  preregistro,
  paisSugerido,
  cargando,
}: PortalGoogleFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<DatosRegistrarClienteGoogle>({
    resolver: standardSchemaResolver(esquemaRegistrarClienteGoogle),
    defaultValues: {
      // Google ya sabe cómo se llama. Editable: como figura en su cuenta
      // personal no tiene por qué ser como quiere que le llamen aquí.
      nombre: preregistro.nombre ?? "",
      telefonoE164: "",
      aceptaPromos: false,
    },
  })

  const deshabilitado = isSubmitting || !!cargando

  return (
    <form className="space-y-4" onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
      {/* Antes de cualquier campo: en un teléfono compartido bien puede no ser
          su cuenta, y enterarse después de escribir sus datos es peor */}
      <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 p-3">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-card shadow-sm"
          aria-hidden
        >
          <LogoGoogle className="size-[18px]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">Continuarás como</p>
          <p className="truncate text-sm font-medium text-foreground">{preregistro.email}</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Es tu primera vez en esta barbería. Con esto queda lista tu ficha y no hará falta ningún
        código la próxima vez.
      </p>

      <Field data-invalid={!!errors.nombre}>
        <FieldLabel htmlFor="google-nombre">Tu nombre</FieldLabel>
        <Input
          id="google-nombre"
          autoComplete="name"
          placeholder="Laura Gómez"
          aria-invalid={!!errors.nombre}
          className="h-11 text-base"
          {...register("nombre")}
        />
        <FieldError errors={[errors.nombre]} />
      </Field>

      {/* El indicativo se elige de una lista y el número se escribe a secas.
          Pedir el E.164 entero —`+573001112233` de placeholder— llevaba al error
          «Formato internacional: +573001112233», que no dice nada a quien acaba
          de teclear su número de siempre. Y aquí pesa más que en el panel: quien
          está delante es un cliente en su móvil, sin cuenta y a punto de
          abandonar si algo le rebota */}
      <Field data-invalid={!!errors.telefonoE164}>
        <FieldLabel htmlFor="google-telefono">Teléfono</FieldLabel>
        <Controller
          control={control}
          name="telefonoE164"
          render={({ field }) => (
            <CampoTelefono
              id="google-telefono"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              paisSugerido={paisSugerido}
              invalido={!!errors.telefonoE164}
              disabled={deshabilitado}
            />
          )}
        />
        <FieldDescription>Por si la barbería necesita llamarte.</FieldDescription>
        <FieldError errors={[errors.telefonoE164]} />
      </Field>

      {/* Es un consentimiento, no una casilla de interfaz: se guarda con su
          origen, su versión de política, la IP y el user agent. Por eso nace
          desmarcada — no marcar nada no es lo mismo que aceptar */}
      <Controller
        control={control}
        name="aceptaPromos"
        render={({ field }) => (
          <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-secondary/40 p-3">
            <Checkbox
              checked={field.value === true}
              onCheckedChange={(marcado) => field.onChange(marcado === true)}
              aria-label="Acepto recibir novedades y promociones"
            />
            <span className="text-xs text-muted-foreground">
              Quiero recibir novedades y promociones de esta barbería.
            </span>
          </label>
        )}
      />

      <Button
        type="submit"
        size="lg"
        disabled={deshabilitado}
        className="h-12 w-full cursor-pointer text-sm font-semibold"
      >
        {deshabilitado ? <Loader2 className="animate-spin" aria-hidden /> : "Entrar a mis citas"}
      </Button>
    </form>
  )
}
