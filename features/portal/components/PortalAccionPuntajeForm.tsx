"use client"

import { Controller, useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Loader2, Star } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Field, FieldDescription, FieldError, FieldLabel } from "@shared/components/ui/field"
import { Textarea } from "@shared/components/ui/textarea"
import { esquemaCalificar, type DatosCalificar } from "@features/portal/schemas/portal.schema"

interface PortalAccionPuntajeFormProps {
  onSubmit: (datos: DatosCalificar) => Promise<void>
  cargando?: boolean
}

/**
 * El único propósito de enlace que no se resuelve solo al abrirlo: **calificar
 * exige un puntaje**, y un puntaje no viaja dentro del token.
 *
 * Sin sesión y sin decir qué cita es: quien tiene el enlace ya sabe de qué visita
 * habla, y nombrarla aquí contaría la agenda de alguien a quien reenvíe el correo.
 *
 * Se reutiliza `esquemaCalificar` —el mismo con el que califica desde «Mis
 * citas»—: es el mismo dato con las mismas reglas, y duplicarlo garantizaría que
 * un día divergieran.
 */
export function PortalAccionPuntajeForm({ onSubmit, cargando }: PortalAccionPuntajeFormProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DatosCalificar>({
    resolver: standardSchemaResolver(esquemaCalificar),
    // Sin estrella marcada: un 5 por defecto sería una opinión que nadie dio.
    defaultValues: { puntaje: 0, comentario: "" },
  })

  const deshabilitado = isSubmitting || !!cargando

  return (
    <form className="space-y-5" onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
      <Field data-invalid={!!errors.puntaje}>
        <FieldLabel htmlFor="puntaje">¿Cómo te fue?</FieldLabel>
        <Controller
          control={control}
          name="puntaje"
          render={({ field }) => (
            <div
              id="puntaje"
              className="flex justify-center gap-1.5 py-1"
              role="radiogroup"
              aria-label="Puntaje de 1 a 5"
              aria-invalid={!!errors.puntaje}
            >
              {[1, 2, 3, 4, 5].map((valor) => (
                <button
                  key={valor}
                  type="button"
                  role="radio"
                  aria-checked={field.value === valor}
                  aria-label={`${valor} de 5`}
                  onClick={() => field.onChange(valor)}
                  className="cursor-pointer rounded-full p-1.5 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  <Star
                    className={
                      valor <= field.value
                        ? "h-9 w-9 fill-primary text-primary"
                        : "h-9 w-9 text-muted-foreground"
                    }
                    aria-hidden
                  />
                </button>
              ))}
            </div>
          )}
        />
        <FieldError errors={[errors.puntaje]} />
      </Field>

      <Field data-invalid={!!errors.comentario}>
        <FieldLabel htmlFor="comentario">¿Algo que contar? (opcional)</FieldLabel>
        <Textarea
          id="comentario"
          rows={3}
          maxLength={1000}
          placeholder="Lo que quieras que sepan"
          aria-invalid={!!errors.comentario}
          {...register("comentario")}
        />
        <FieldDescription>
          Tu comentario se publica solo si la barbería lo aprueba. La calificación cuenta igual.
        </FieldDescription>
        <FieldError errors={[errors.comentario]} />
      </Field>

      <Button
        type="submit"
        size="lg"
        disabled={deshabilitado}
        className="h-12 w-full cursor-pointer text-sm font-semibold"
      >
        {deshabilitado ? <Loader2 className="animate-spin" aria-hidden /> : "Enviar calificación"}
      </Button>
    </form>
  )
}
