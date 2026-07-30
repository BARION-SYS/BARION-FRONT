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
import { esquemaInvitacion, type DatosInvitacion } from "@features/equipo/schemas/equipo.schema"
import type { Rol } from "@features/roles/types/roles.types"

interface EquipoFormProps {
  roles: Rol[]
  cargando?: boolean
  onSubmit: (datos: DatosInvitacion) => Promise<void>
}

/**
 * Invitar a alguien al sistema. No se crea una cuenta: se invita, y la persona
 * entra por su cuenta cuando acepta.
 *
 * El correo es obligatorio porque es por donde entrará con un proveedor externo
 * — la vinculación se hace por correo, y sin él el botón de Google no le sirve.
 */
export function EquipoForm({ roles, cargando, onSubmit }: EquipoFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosInvitacion>({
    resolver: standardSchemaResolver(esquemaInvitacion),
    defaultValues: { rol: roles[0]?.codigo ?? "" },
  })

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="flex flex-col gap-4">
      <Field>
        <FieldLabel htmlFor="nombre">Nombre</FieldLabel>
        <Input id="nombre" placeholder="Carlos Ramírez" {...register("nombre")} />
        <p className="text-xs text-muted-foreground">
          Con el que tu barbería lo conoce. No tiene que coincidir con su nombre legal.
        </p>
        {errors.nombre && <FieldError>{errors.nombre.message}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor="email">Correo</FieldLabel>
        <Input id="email" type="email" placeholder="carlos@barberia.co" {...register("email")} />
        <p className="text-xs text-muted-foreground">
          Por aquí entrará. Si usa Google, tiene que ser esta misma dirección.
        </p>
        {errors.email && <FieldError>{errors.email.message}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor="telefonoE164">Teléfono</FieldLabel>
        <Input id="telefonoE164" placeholder="+573001112233" {...register("telefonoE164")} />
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

      <Button type="submit" disabled={cargando} className="h-10">
        {cargando && <Loader2 className="size-4 animate-spin" aria-hidden />}
        Enviar invitación
      </Button>
    </form>
  )
}
