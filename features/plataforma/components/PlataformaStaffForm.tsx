"use client"

import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Loader2 } from "lucide-react"
import {
  esquemaAltaStaff,
  type DatosAltaStaff,
} from "@features/plataforma/schemas/plataforma.schema"
import { Button } from "@shared/components/ui/button"
import { Field, FieldDescription, FieldError, FieldLabel } from "@shared/components/ui/field"
import { Input } from "@shared/components/ui/input"

/** Ata el botón del pie del panel al formulario, que vive en el cuerpo. */
export const ID_FORM_ALTA_STAFF = "form-alta-staff"

interface PlataformaStaffFormProps {
  onSubmit: (datos: DatosAltaStaff) => Promise<void>
  cargando?: boolean
}

/**
 * Alta de alguien del equipo de Barion. **Un solo campo, y no falta nada.**
 *
 * No hay nombre porque el staff de plataforma no lo tiene en ningún sitio: el
 * nombre de una persona vive en su membresía, con el que la conoce SU barbería,
 * y este actor no tiene ninguna. Su identidad es el correo con el que entra.
 *
 * No hay contraseña porque la genera el servidor y se enseña UNA vez al
 * terminar. Pedirla aquí sería dejar que quien da de alta la conozca para
 * siempre, y el alta asistida de una barbería ya cometió ese error una vez.
 */
export function PlataformaStaffForm({ onSubmit, cargando }: PlataformaStaffFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DatosAltaStaff>({
    resolver: standardSchemaResolver(esquemaAltaStaff),
    defaultValues: { email: "" },
  })

  const deshabilitado = isSubmitting || !!cargando

  return (
    <form
      id={ID_FORM_ALTA_STAFF}
      className="space-y-5"
      onSubmit={(evento) => void handleSubmit(onSubmit)(evento)}
      noValidate
    >
      <Field data-invalid={!!errors.email}>
        <FieldLabel htmlFor="staff-email">Correo</FieldLabel>
        <Input
          id="staff-email"
          type="email"
          inputMode="email"
          autoComplete="off"
          placeholder="soporte@barion.app"
          className="h-11"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        <FieldDescription>
          Con este correo entra a la plataforma. Es su identidad: el staff de Barion no pertenece a
          ninguna barbería y no tiene nombre que guardar.
        </FieldDescription>
        <FieldError errors={[errors.email]} />
      </Field>

      <p className="rounded-lg border border-(--info)/40 bg-[color-mix(in_srgb,var(--info)_8%,transparent)] px-3 py-2.5 text-xs text-foreground">
        Al terminar se genera una contraseña temporal que se enseña <strong>una sola vez</strong>.
        Hay que dictársela: no se guarda en ningún sitio y no se puede volver a consultar. Quien
        entre con ella tendrá que cambiarla.
      </p>

      {deshabilitado && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" aria-hidden />
          Creando la cuenta…
        </p>
      )}

      {/* El botón de envío vive en el pie del panel y se ata por `form` */}
      <Button type="submit" className="sr-only" disabled={deshabilitado}>
        Crear cuenta
      </Button>
    </form>
  )
}
