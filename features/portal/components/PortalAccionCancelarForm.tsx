"use client"

import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { CalendarX, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@shared/components/ui/button"
import { Field, FieldDescription, FieldError, FieldLabel } from "@shared/components/ui/field"
import { Textarea } from "@shared/components/ui/textarea"
import { esquemaCancelar, type DatosCancelar } from "@features/portal/schemas/portal.schema"
import { useTextos } from "@shared/textos/useTextos"

interface PortalAccionCancelarFormProps {
  onSubmit: (datos: DatosCancelar) => Promise<void>
  /** A dónde vuelve quien decide NO cancelar. Su cita sigue en pie. */
  hrefPortal: string
  cargando?: boolean
}

/**
 * La confirmación de una cancelación por enlace.
 *
 * **Es la única acción destructiva de los cinco propósitos.** Confirmar,
 * calificar o aceptar un cupo se repiten o se deshacen; una cita cancelada libera
 * el hueco y puede haberlo cogido otro. Ejecutarla nada más abrir sería apostar a
 * que nadie abre ese enlace por su cuenta —un cliente de correo que precarga, un
 * antivirus que sigue enlaces, un reenvío a un grupo—, así que hace falta un clic.
 *
 * Y es lo que permite **pedir el motivo**: hasta que la api responde
 * `requiere_confirmacion` nadie sabe que el token era de cancelación, y con el
 * flujo anterior para entonces ya estaba gastado. El motivo es justo el dato con
 * el que una barbería aprende por qué la dejan plantada, así que se pide — pero
 * **opcional**: exigirlo convertiría un aviso en un trámite y la alternativa de
 * quien no quiera escribirlo es no avisar.
 *
 * Se reutiliza `esquemaCancelar`, el mismo con el que se cancela desde «Mis
 * citas»: es el mismo dato con las mismas reglas.
 */
export function PortalAccionCancelarForm({
  onSubmit,
  hrefPortal,
  cargando,
}: PortalAccionCancelarFormProps) {
  const t = useTextos("portal.accion")
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DatosCancelar>({
    resolver: standardSchemaResolver(esquemaCancelar),
    defaultValues: { motivo: "" },
  })

  const deshabilitado = isSubmitting || !!cargando

  return (
    <form className="space-y-5" onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
      <Field data-invalid={!!errors.motivo}>
        <FieldLabel htmlFor="motivo">¿Por qué cancelas? (opcional)</FieldLabel>
        <Textarea
          id="motivo"
          rows={3}
          maxLength={500}
          placeholder={t("motivoEjemplo")}
          aria-invalid={!!errors.motivo}
          {...register("motivo")}
        />
        <FieldDescription>{t("motivoAyuda")}</FieldDescription>
        <FieldError errors={[errors.motivo]} />
      </Field>

      <div className="flex flex-col gap-2 sm:flex-row-reverse">
        <Button
          type="submit"
          size="lg"
          variant="destructive"
          disabled={deshabilitado}
          className="h-12 flex-1 cursor-pointer text-sm font-semibold"
        >
          {deshabilitado ? (
            <Loader2 className="animate-spin" aria-hidden />
          ) : (
            <>
              <CalendarX aria-hidden />
              Sí, cancelar mi cita
            </>
          )}
        </Button>

        <Button
          render={<Link href={hrefPortal} />}
          size="lg"
          variant="outline"
          className="h-12 flex-1 text-sm font-semibold"
        >
          No, mantenerla
        </Button>
      </div>
    </form>
  )
}
