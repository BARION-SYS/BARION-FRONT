"use client"

import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Loader2 } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@shared/components/ui/field"
import { Input } from "@shared/components/ui/input"
import { Textarea } from "@shared/components/ui/textarea"
import { esquemaBarbero, type DatosBarbero } from "@features/barberos/schemas/barberos.schema"
import type { Barbero } from "@features/barberos/types/barberos.types"

interface BarberosFormProps {
  /** Siempre hay ficha: el alta la hace el formulario único de Personas. */
  barbero: Barbero
  cargando?: boolean
  onSubmit: (datos: DatosBarbero) => Promise<void>
}

/** El formulario pide porcentaje; la API guarda puntos base. */
const BPS_POR_PUNTO = 100

/**
 * La ficha de quien atiende: lo que el cliente ve al reservar y el acuerdo con
 * el que se liquida.
 *
 * **Solo edita.** El alta la hace el formulario único de Personas, que pregunta
 * de una vez si esa persona entra a la aplicación y si atiende — antes había que
 * rellenar dos formularios en dos pantallas para el mismo barbero con cuenta.
 * Aquí, en cambio, se está redactando su escaparate y ajustando su comisión, que
 * es trabajo de otro día.
 *
 * Qué puede hacer cada quien no se decide aquí: el título es de vitrina y no
 * concede nada. Los permisos viven en la fila de esa persona, en Personas.
 *
 * No se pide identificador público —ninguna ruta lo resuelve y la api ya no lo
 * acepta— ni el color, que lo asigna la api con el índice menos usado de la
 * barbería: obligar a elegirlo sería pedirle a alguien que lleve la cuenta de
 * qué colores están cogidos.
 */
export function BarberosForm({ barbero, cargando, onSubmit }: BarberosFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosBarbero>({
    resolver: standardSchemaResolver(esquemaBarbero),
    defaultValues: {
      nombrePublico: barbero.nombrePublico,
      titulo: barbero.titulo ?? undefined,
      bio: barbero.bio ?? undefined,
      telefonoE164: barbero.telefonoE164 ?? undefined,
      email: barbero.email ?? undefined,
      fechaContratacion: barbero.fechaContratacion ?? undefined,
      comisionBps: barbero.comisionBps ?? undefined,
    },
  })

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="flex flex-col gap-5">
      <Field data-invalid={!!errors.nombrePublico}>
        <FieldLabel htmlFor="nombrePublico">Nombre público</FieldLabel>
        <Input
          id="nombrePublico"
          placeholder="Carlos Ramírez"
          aria-invalid={!!errors.nombrePublico}
          {...register("nombrePublico")}
        />
        <p className="text-xs text-muted-foreground">
          El que ve el cliente al reservar, no el legal.
        </p>
        <FieldError errors={[errors.nombrePublico]} />
      </Field>

      <Field data-invalid={!!errors.titulo}>
        <FieldLabel htmlFor="titulo">Título</FieldLabel>
        <Input id="titulo" placeholder="Barbero Senior" {...register("titulo")} />
        <p className="text-xs text-muted-foreground">
          De vitrina: lo lee el cliente al reservar. No decide qué puede hacer en el sistema.
        </p>
        <FieldError errors={[errors.titulo]} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field data-invalid={!!errors.telefonoE164}>
          <FieldLabel htmlFor="telefonoE164">Teléfono</FieldLabel>
          <Input id="telefonoE164" placeholder="+573001112233" {...register("telefonoE164")} />
          <FieldError errors={[errors.telefonoE164]} />
        </Field>

        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email">Correo</FieldLabel>
          <Input id="email" type="email" placeholder="carlos@elcorte.co" {...register("email")} />
          <p className="text-xs text-muted-foreground">
            Contacto que guarda la barbería, no una credencial.
          </p>
          <FieldError errors={[errors.email]} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field data-invalid={!!errors.comisionBps}>
          <FieldLabel htmlFor="comisionBps">Comisión (%)</FieldLabel>
          <Input
            id="comisionBps"
            type="number"
            min={0}
            max={100}
            step={1}
            placeholder="50"
            {...register("comisionBps", {
              // Puntos base hacia la API; el usuario piensa en porcentaje.
              setValueAs: (valor: string) =>
                valor === "" ? undefined : Number(valor) * BPS_POR_PUNTO,
            })}
          />
          <p className="text-xs text-muted-foreground">
            En blanco, se lleva el 100 % — alquiler de silla o sueldo aparte.
          </p>
          <FieldError errors={[errors.comisionBps]} />
        </Field>

        <Field data-invalid={!!errors.fechaContratacion}>
          <FieldLabel htmlFor="fechaContratacion">Fecha de contratación</FieldLabel>
          <Input id="fechaContratacion" type="date" {...register("fechaContratacion")} />
          <FieldError errors={[errors.fechaContratacion]} />
        </Field>
      </div>

      <Field data-invalid={!!errors.bio}>
        <FieldLabel htmlFor="bio">Presentación</FieldLabel>
        <Textarea id="bio" rows={3} className="resize-none" {...register("bio")} />
        <p className="text-xs text-muted-foreground">
          Lo que se lee de él en el escaparate, bajo su nombre.
        </p>
        <FieldError errors={[errors.bio]} />
      </Field>

      <Button type="submit" disabled={cargando} className="h-10">
        {cargando && <Loader2 className="size-4 animate-spin" aria-hidden />}
        Guardar ficha
      </Button>
    </form>
  )
}
