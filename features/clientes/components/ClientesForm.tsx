"use client"

import { Controller, useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Loader2 } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@shared/components/ui/field"
import { Input } from "@shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select"
import { Textarea } from "@shared/components/ui/textarea"
import { esquemaCliente, type DatosCliente } from "@features/clientes/schemas/clientes.schema"
import type { Cliente } from "@features/clientes/types/clientes.types"
import type { Barbero } from "@features/barberos/types/barberos.types"

interface ClientesFormProps {
  /** Sin cliente = alta. Con cliente = edición. */
  cliente?: Cliente | null
  /** Para elegir con quién se atiende siempre. */
  barberos: Barbero[]
  cargando?: boolean
  onSubmit: (datos: DatosCliente) => Promise<void>
}

const SIN_FAVORITO = "ninguno"

const TITULO_GRUPO =
  "text-[10px] font-semibold tracking-[0.14em] text-muted-foreground/80 uppercase"

/**
 * Alta y edición del cliente.
 *
 * Lo que se crea aquí es una FICHA, no una cuenta: la de quien entró sin cita y
 * al que le agenda su barbero. Nace con el teléfono sin verificar, cuenta para
 * el historial y no abre sesión en ninguna parte. Quien llega por el enlace
 * público se registra solo con su código, y ese sí reserva cuando quiere.
 *
 * Se dice en pantalla a propósito: pedir nombre, teléfono y correo se lee como
 * un alta de usuario, que es justo lo que no es.
 *
 * El correo es obligatorio, y no por capricho: es un canal del producto. Un
 * cliente sin correo es alguien a quien no se le puede escribir, y eso solo se
 * descubre cuando una campaña no llega a media base.
 *
 * La ETIQUETA no se elige aquí: sale de los segmentos que la barbería define, y
 * la api resuelve cuál mostrar.
 */
export function ClientesForm({ cliente, barberos, cargando, onSubmit }: ClientesFormProps) {
  const editando = Boolean(cliente)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DatosCliente>({
    resolver: standardSchemaResolver(esquemaCliente),
    defaultValues: {
      nombre: cliente?.nombre ?? "",
      apellido: cliente?.apellido ?? undefined,
      telefonoE164: cliente?.telefonoE164 ?? "",
      email: cliente?.email ?? "",
      fechaNacimiento: cliente?.fechaNacimiento ?? undefined,
      barberoFavoritoId: cliente?.barberoFavorito?.id ?? undefined,
      notas: cliente?.notas ?? undefined,
    },
  })

  const enviando = cargando || isSubmitting

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="flex flex-col gap-5">
      {!editando && (
        <div className="rounded-xl border border-border bg-secondary/40 p-3 text-xs">
          <p className="font-medium">Es una ficha, no una cuenta de acceso.</p>
          <ul className="mt-1.5 flex list-disc flex-col gap-1 pl-4 text-muted-foreground">
            <li>Es la del que entró sin cita: suma a su historial y se le puede agendar.</li>
            <li>
              No entra a ninguna parte ni reserva por su cuenta desde el escaparate — le reserva su
              barbero.
            </li>
            <li>
              Quien llega por el enlace público se registra solo: verifica su teléfono con un código
              y desde ahí reserva cuando quiera.
            </li>
          </ul>
        </div>
      )}

      <fieldset className="flex flex-col gap-3">
        <legend className={TITULO_GRUPO}>Quién es</legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={!!errors.nombre}>
            <FieldLabel htmlFor="nombre">Nombre</FieldLabel>
            <Input id="nombre" placeholder="Laura" {...register("nombre")} />
            <FieldError errors={[errors.nombre]} />
          </Field>

          <Field data-invalid={!!errors.apellido}>
            <FieldLabel htmlFor="apellido">Apellido</FieldLabel>
            <Input id="apellido" placeholder="Méndez" {...register("apellido")} />
            <FieldError errors={[errors.apellido]} />
          </Field>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className={TITULO_GRUPO}>Cómo se le avisa</legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={!!errors.telefonoE164}>
            <FieldLabel htmlFor="telefonoE164">Teléfono</FieldLabel>
            <Input
              id="telefonoE164"
              inputMode="tel"
              placeholder="+573001112233"
              {...register("telefonoE164")}
            />
            <p className="text-xs text-muted-foreground">
              {editando
                ? "Cambiarlo retira la verificación: el nuevo no lo ha probado nadie."
                : "Por aquí se le recuerda la cita. Único en la barbería, y queda sin verificar: eso solo lo hace él, con el código del enlace público."}
            </p>
            <FieldError errors={[errors.telefonoE164]} />
          </Field>

          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email">Correo</FieldLabel>
            <Input id="email" type="email" placeholder="laura@correo.com" {...register("email")} />
            <p className="text-xs text-muted-foreground">
              Obligatorio: sin él no hay a dónde escribirle. También es único en la barbería.
            </p>
            <FieldError errors={[errors.email]} />
          </Field>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className={TITULO_GRUPO}>Para atenderlo mejor</legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={!!errors.fechaNacimiento}>
            <FieldLabel htmlFor="fechaNacimiento">Cumpleaños</FieldLabel>
            <Input id="fechaNacimiento" type="date" {...register("fechaNacimiento")} />
            <p className="text-xs text-muted-foreground">
              Opcional: es lo que enciende el saludo de cumpleaños.
            </p>
            <FieldError errors={[errors.fechaNacimiento]} />
          </Field>

          <Controller
            control={control}
            name="barberoFavoritoId"
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="barberoFavoritoId">Se atiende con</FieldLabel>
                <Select
                  value={field.value ?? SIN_FAVORITO}
                  onValueChange={(valor) =>
                    field.onChange(!valor || valor === SIN_FAVORITO ? undefined : valor)
                  }
                >
                  <SelectTrigger id="barberoFavoritoId" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SIN_FAVORITO}>Sin preferencia</SelectItem>
                    {barberos.map((barbero) => (
                      <SelectItem key={barbero.id} value={barbero.id}>
                        {barbero.nombrePublico}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[errors.barberoFavoritoId]} />
              </Field>
            )}
          />
        </div>

        <Field data-invalid={!!errors.notas}>
          <FieldLabel htmlFor="notas">Notas internas</FieldLabel>
          <Textarea id="notas" rows={3} className="resize-none" {...register("notas")} />
          <p className="text-xs text-muted-foreground">No las ve el cliente.</p>
          <FieldError errors={[errors.notas]} />
        </Field>
      </fieldset>

      <Button type="submit" disabled={enviando} className="h-10">
        {enviando && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {editando ? "Guardar cambios" : "Registrar cliente"}
      </Button>
    </form>
  )
}
