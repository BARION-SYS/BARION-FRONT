"use client"

import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Loader2 } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@shared/components/ui/field"
import { Input } from "@shared/components/ui/input"
import { esquemaBarbero, type DatosBarbero } from "@features/barberos/schemas/barberos.schema"
import type { Barbero } from "@features/barberos/types/barberos.types"

interface BarberosFormProps {
  /** Sin barbero = alta. Con barbero = edición. */
  barbero?: Barbero | null
  cargando?: boolean
  onSubmit: (datos: DatosBarbero) => Promise<void>
}

/** El formulario pide porcentaje; la API guarda puntos base. */
const BPS_POR_PUNTO = 100

/**
 * Alta y edición del perfil operativo.
 *
 * El título es de **vitrina** ("Barbero Senior"), no el rol de autorización: lo
 * lee el cliente al reservar y no abre ni cierra ninguna pantalla. Quién entra al
 * sistema y con qué capacidades se decide en Equipo.
 *
 * No se pide el color: lo asigna la api con el índice menos usado de la
 * barbería. Obligar a elegirlo sería pedirle a alguien que lleve la cuenta de
 * qué colores están cogidos.
 */
export function BarberosForm({ barbero, cargando, onSubmit }: BarberosFormProps) {
  const editando = Boolean(barbero)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosBarbero>({
    resolver: standardSchemaResolver(esquemaBarbero),
    defaultValues: {
      nombrePublico: barbero?.nombrePublico ?? "",
      titulo: barbero?.titulo ?? undefined,
      bio: barbero?.bio ?? undefined,
      slug: barbero?.slug ?? undefined,
      telefonoE164: barbero?.telefonoE164 ?? undefined,
      email: barbero?.email ?? undefined,
      fechaContratacion: barbero?.fechaContratacion ?? undefined,
      comisionBps: barbero?.comisionBps ?? undefined,
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

      <div className="grid gap-4 sm:grid-cols-2">
        <Field data-invalid={!!errors.titulo}>
          <FieldLabel htmlFor="titulo">Título</FieldLabel>
          <Input id="titulo" placeholder="Barbero Senior" {...register("titulo")} />
          <p className="text-xs text-muted-foreground">
            De vitrina. No decide qué puede hacer en el sistema.
          </p>
          <FieldError errors={[errors.titulo]} />
        </Field>

        <Field data-invalid={!!errors.slug}>
          <FieldLabel htmlFor="slug">Identificador público</FieldLabel>
          <Input id="slug" placeholder="carlos-ramirez" {...register("slug")} />
          <FieldError errors={[errors.slug]} />
        </Field>
      </div>

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
        {/* shadcn no trae textarea instalado: nativo con el estilo del Input */}
        <textarea
          id="bio"
          rows={3}
          className="w-full resize-none rounded-lg border border-input bg-input/30 px-2.5 py-1.5 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
          {...register("bio")}
        />
        <FieldError errors={[errors.bio]} />
      </Field>

      {!editando && (
        <p className="rounded-lg border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
          Se crea sin cuenta: aparece en la agenda y liquida comisiones, pero no entra a la
          aplicación. Para darle acceso, invítalo desde Equipo.
        </p>
      )}

      <Button type="submit" disabled={cargando} className="h-10">
        {cargando && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {editando ? "Guardar barbero" : "Crear barbero"}
      </Button>
    </form>
  )
}
