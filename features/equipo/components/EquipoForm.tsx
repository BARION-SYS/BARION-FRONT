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
import { Switch } from "@shared/components/ui/switch"
import { esquemaAltaMiembro, type DatosAltaMiembro } from "@features/equipo/schemas/equipo.schema"
import type { Rol } from "@features/roles/types/roles.types"

interface EquipoFormProps {
  roles: Rol[]
  cargando?: boolean
  onSubmit: (datos: DatosAltaMiembro) => Promise<void>
}

/**
 * El alta: dos preguntas y ningún paso intermedio.
 *
 * No se invita a nadie — la cuenta nace lista para entrar, con una contraseña
 * inicial que se muestra una sola vez al terminar. El correo es obligatorio
 * porque es por donde entrará con un proveedor externo.
 *
 * «Atiende clientes» queda encendido y bloqueado para el rol `barbero`: un
 * barbero sin ficha entra al panel y no hay agenda que sea suya, así que la api
 * también lo rechaza.
 */
export function EquipoForm({ roles, cargando, onSubmit }: EquipoFormProps) {
  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DatosAltaMiembro>({
    resolver: standardSchemaResolver(esquemaAltaMiembro),
    defaultValues: {
      nombre: "",
      email: "",
      telefonoE164: "",
      rol: roles[0]?.codigo ?? "",
      contrasenaInicial: "",
      atiende: false,
    },
  })

  const esBarbero = watch("rol") === "barbero"
  const enviando = cargando || isSubmitting

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="flex flex-col gap-4">
      <Field>
        <FieldLabel htmlFor="nombre">Nombre</FieldLabel>
        <Input
          id="nombre"
          placeholder="Carlos Ramírez"
          aria-invalid={Boolean(errors.nombre)}
          {...register("nombre")}
        />
        <p className="text-xs text-muted-foreground">
          Con el que tu barbería lo conoce. No tiene que coincidir con su nombre legal.
        </p>
        {errors.nombre && <FieldError>{errors.nombre.message}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor="email">Correo</FieldLabel>
        <Input
          id="email"
          type="email"
          inputMode="email"
          placeholder="carlos@barberia.co"
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
        <p className="text-xs text-muted-foreground">
          Por aquí entrará. Si usa Google, tiene que ser esta misma dirección.
        </p>
        {errors.email && <FieldError>{errors.email.message}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor="telefonoE164">Teléfono</FieldLabel>
        <Input
          id="telefonoE164"
          inputMode="tel"
          placeholder="+573001112233"
          aria-invalid={Boolean(errors.telefonoE164)}
          {...register("telefonoE164")}
        />
        {errors.telefonoE164 && <FieldError>{errors.telefonoE164.message}</FieldError>}
      </Field>

      <Controller
        control={control}
        name="rol"
        render={({ field }) => (
          <Field>
            <FieldLabel htmlFor="rol">Rol</FieldLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="rol" className="w-full">
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((rol) => (
                  <SelectItem key={rol.id} value={rol.codigo}>
                    {rol.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.rol && <FieldError>{errors.rol.message}</FieldError>}
          </Field>
        )}
      />

      <Controller
        control={control}
        name="atiende"
        render={({ field }) => (
          <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-secondary/40 px-4 py-3">
            <div className="min-w-0">
              <FieldLabel htmlFor="atiende" className="text-sm font-medium">
                ¿Atiende clientes?
              </FieldLabel>
              <p className="mt-1 text-xs text-muted-foreground">
                {esBarbero
                  ? "El rol de barbero siempre atiende: se le abre su agenda."
                  : "Le abre su ficha de barbero, con agenda, comisión y presencia en el portal."}
              </p>
            </div>
            <Switch
              id="atiende"
              checked={esBarbero || field.value}
              disabled={esBarbero}
              onCheckedChange={field.onChange}
              aria-label="Atiende clientes"
            />
          </div>
        )}
      />

      <Field>
        <FieldLabel htmlFor="contrasenaInicial">Contraseña inicial</FieldLabel>
        <Input
          id="contrasenaInicial"
          type="text"
          autoComplete="off"
          placeholder="Déjala vacía y la generamos"
          aria-invalid={Boolean(errors.contrasenaInicial)}
          {...register("contrasenaInicial")}
        />
        <p className="text-xs text-muted-foreground">
          Se muestra una sola vez al terminar, para que se la dictes. Tendrá que cambiarla la
          primera vez que entre.
        </p>
        {errors.contrasenaInicial && <FieldError>{errors.contrasenaInicial.message}</FieldError>}
      </Field>

      <Button type="submit" disabled={enviando} className="h-10">
        {enviando && <Loader2 className="size-4 animate-spin" aria-hidden />}
        Dar de alta
      </Button>
    </form>
  )
}
