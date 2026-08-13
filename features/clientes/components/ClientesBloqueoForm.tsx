"use client"

import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Field, FieldDescription, FieldError, FieldLabel } from "@shared/components/ui/field"
import { Input } from "@shared/components/ui/input"
import { Textarea } from "@shared/components/ui/textarea"
import { esquemaBloqueo, type DatosBloqueo } from "@features/clientes/schemas/clientes.schema"

interface ClientesBloqueoFormProps {
  nombre: string
  onSubmit: (datos: DatosBloqueo) => void
}

export const ID_FORM_BLOQUEO = "form-bloqueo-cliente"

/**
 * Cerrarle la reserva en línea a alguien.
 *
 * ── Lo que hay que dejar claro antes de que alguien lo pulse ────────────────
 * **No es una expulsión**, y quien lo hace tiene que saberlo: el cliente sigue
 * en la base, sus citas actuales siguen en pie y la barbería puede seguir
 * citándolo a mano. Lo único que se le cierra es apartar hueco por su cuenta
 * desde el escaparate. Esa asimetría es lo que lo hace útil — quien plantó tres
 * citas deja de ocupar agenda, y si llama y da la cara, se le atiende.
 *
 * ── Por qué la fecha es obligatoria ─────────────────────────────────────────
 * Porque un bloqueo indefinido no lo levanta nadie: se queda puesto, esa persona
 * deja de volver y meses después nadie recuerda por qué. Con fecha caduca solo y
 * la barbería decide si lo renueva.
 *
 * El motivo se anota en las notas de la ficha, que es donde mira quien atiende
 * el mostrador cuando esa persona llama a preguntar.
 */
export function ClientesBloqueoForm({ nombre, onSubmit }: ClientesBloqueoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosBloqueo>({
    resolver: standardSchemaResolver(esquemaBloqueo),
    defaultValues: { hasta: "", motivo: "" },
  })

  return (
    <form id={ID_FORM_BLOQUEO} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <p className="rounded-lg border border-border bg-secondary/40 p-3 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{nombre}</span> dejará de poder reservar por
        su cuenta desde la página pública. Sus citas actuales siguen en pie y tú puedes seguir
        citándolo desde la agenda.
      </p>

      <Field data-invalid={!!errors.hasta}>
        <FieldLabel htmlFor="hasta">Hasta cuándo</FieldLabel>
        <Input id="hasta" type="date" aria-invalid={!!errors.hasta} {...register("hasta")} />
        <FieldDescription>
          Caduca solo ese día. Es lo que impide que un bloqueo se convierta en una expulsión por
          olvido.
        </FieldDescription>
        <FieldError errors={[errors.hasta]} />
      </Field>

      <Field data-invalid={!!errors.motivo}>
        <FieldLabel htmlFor="motivo">Motivo (opcional)</FieldLabel>
        <Textarea
          id="motivo"
          rows={3}
          placeholder="Tres plantones seguidos en agosto"
          aria-invalid={!!errors.motivo}
          {...register("motivo")}
        />
        <FieldDescription>
          Se anota en las notas de su ficha: es lo que lee quien atiende cuando esa persona llame.
        </FieldDescription>
        <FieldError errors={[errors.motivo]} />
      </Field>
    </form>
  )
}
