"use client"

import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Loader2, ShieldCheck } from "lucide-react"
import { type CodigoRegion } from "@config/regiones"
import { CampoTelefono } from "@shared/components/forms/CampoTelefono"
import { Button } from "@shared/components/ui/button"
import { Checkbox } from "@shared/components/ui/checkbox"
import { Field, FieldError, FieldLabel } from "@shared/components/ui/field"
import { Input } from "@shared/components/ui/input"
import { Controller } from "react-hook-form"
import { esquemaContacto, type DatosContacto } from "@features/portal/schemas/portal.schema"
import { useTextos } from "@shared/textos/useTextos"

interface PortalReservaFormProps {
  onSubmit: (datos: DatosContacto) => Promise<void>
  /**
   * País de la barbería, para sugerir el indicativo. `undefined` cuando la api
   * devuelve uno que este repo no declara: se cae a la lista, nunca a un
   * indicativo inventado.
   */
  paisSugerido?: CodigoRegion
  cargando?: boolean
}

/**
 * Paso 4: quién reserva.
 *
 * **Sin cuenta y sin contraseña**: el código que llega al CORREO es toda la
 * autenticación que existe, y también el registro. Por eso este formulario pide lo
 * que hace falta para crear la ficha si es su primera vez —nombre, teléfono y
 * correo— y no vuelve a preguntar nada después.
 *
 * Los dos campos son obligatorios y por razones distintas: el **correo** es la
 * llave, el único canal por el que sale el código —un SMS se paga por mensaje y
 * Barion no lo asume—; el **teléfono** no se verifica, pero la barbería tiene que
 * poder llamar a quien va a atender.
 *
 * «Quiero recibir novedades» es un **consentimiento**, no una casilla de interfaz:
 * la api lo guarda con su origen, su versión de política, la IP y el user agent.
 */
export function PortalReservaForm({ onSubmit, paisSugerido, cargando }: PortalReservaFormProps) {
  const t = useTextos("portal.reserva")
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DatosContacto>({
    resolver: standardSchemaResolver(esquemaContacto),
    defaultValues: { nombre: "", telefonoE164: "", email: "", notas: "", aceptaPromos: false },
  })

  const deshabilitado = isSubmitting || !!cargando

  return (
    <form className="space-y-4" onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
      <Field data-invalid={!!errors.nombre}>
        <FieldLabel htmlFor="nombre">{t("nombre")}</FieldLabel>
        <Input
          id="nombre"
          autoComplete="name"
          placeholder={t("nombreEjemplo")}
          aria-invalid={!!errors.nombre}
          className="h-11 text-base"
          {...register("nombre")}
        />
        <FieldError errors={[errors.nombre]} />
      </Field>

      {/* Indicativo de una lista y número a secas. Es el paso donde más caro
          sale un rechazo de formato: quien está delante es alguien que ya eligió
          barbero, servicio y hora, y el error «Formato internacional:
          +573001112233» le pide que descifre un estándar para no perder la
          reserva */}
      <Field data-invalid={!!errors.telefonoE164}>
        <FieldLabel htmlFor="telefonoE164">{t("celular")}</FieldLabel>
        <Controller
          control={control}
          name="telefonoE164"
          render={({ field }) => (
            <CampoTelefono
              id="telefonoE164"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              paisSugerido={paisSugerido}
              invalido={!!errors.telefonoE164}
              disabled={deshabilitado}
            />
          )}
        />
        <p id="ayuda-telefono" className="text-xs text-muted-foreground">
          Para que la barbería pueda llamarte si algo cambia.
        </p>
        <FieldError errors={[errors.telefonoE164]} />
      </Field>

      <Field data-invalid={!!errors.email}>
        <FieldLabel htmlFor="email">{t("correo")}</FieldLabel>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="tucorreo@ejemplo.com"
          aria-invalid={!!errors.email}
          aria-describedby="ayuda-correo"
          className="h-11 text-base"
          {...register("email")}
        />
        <p id="ayuda-correo" className="text-xs text-muted-foreground">
          Ahí te enviamos el código para confirmar la cita y sus recordatorios.
        </p>
        <FieldError errors={[errors.email]} />
      </Field>

      <Field data-invalid={!!errors.notas}>
        <FieldLabel htmlFor="notas">{t("notas")}</FieldLabel>
        <Input
          id="notas"
          placeholder={t("notasEjemplo")}
          aria-invalid={!!errors.notas}
          className="h-11 text-base"
          {...register("notas")}
        />
        <FieldError errors={[errors.notas]} />
      </Field>

      <Controller
        control={control}
        name="aceptaPromos"
        render={({ field }) => (
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3">
            <Checkbox
              id="aceptaPromos"
              checked={field.value}
              onCheckedChange={(valor) => field.onChange(valor === true)}
            />
            <span className="text-xs text-muted-foreground">
              Quiero recibir novedades y promociones de esta barbería. Puedes retirarlo cuando
              quieras desde «Mis citas».
            </span>
          </label>
        )}
      />

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
        {deshabilitado ? <Loader2 className="animate-spin" aria-hidden /> : t("enviarCodigo")}
      </Button>
    </form>
  )
}
