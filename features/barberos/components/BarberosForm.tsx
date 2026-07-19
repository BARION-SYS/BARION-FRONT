"use client"

import { useEffect } from "react"
import { Controller, useForm, type DefaultValues } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Button } from "@shared/components/ui/button"
import { Modal } from "@shared/components/modals/Modal"
import { Field, FieldError, FieldLabel } from "@shared/components/ui/field"
import { Input } from "@shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select"
import {
  esquemaBarbero,
  rolesBarbero,
  type DatosBarbero,
} from "@features/barberos/schemas/barberos.schema"
import type { Barbero } from "@features/barberos/types/barberos.types"

interface BarberosFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Barbero a editar; null/undefined = crear */
  barbero?: Barbero | null
  onSubmit: (datos: DatosBarbero) => Promise<void>
  guardando?: boolean
}

function valoresDe(barbero?: Barbero | null): DefaultValues<DatosBarbero> {
  if (!barbero) return { nombre: "", telefono: "", correo: "" }
  return {
    nombre: barbero.nombre,
    rol: rolesBarbero.find((rol) => rol === barbero.rol),
    telefono: barbero.telefono,
    correo: barbero.correo,
    porcentajeComision: barbero.estadisticas.porcentajeComision,
    diasLaborales: barbero.diasLaborales,
  }
}

// Presentacional: el padre entrega la mutación por onSubmit y controla la apertura.
export function BarberosForm({
  open,
  onOpenChange,
  barbero,
  onSubmit,
  guardando,
}: BarberosFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DatosBarbero>({
    resolver: standardSchemaResolver(esquemaBarbero),
    defaultValues: valoresDe(barbero),
  })

  // Al abrir: precarga el barbero a editar o limpia para crear.
  useEffect(() => {
    if (open) reset(valoresDe(barbero))
  }, [open, barbero, reset])

  const enviar = handleSubmit(async (datos) => {
    await onSubmit(datos)
  })

  const deshabilitado = isSubmitting || !!guardando

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      titulo={barbero ? "Editar barbero" : "Agregar barbero"}
      descripcion={
        barbero
          ? "Actualiza los datos del barbero."
          : "Completa los datos del nuevo integrante del equipo."
      }
      className="sm:max-w-md"
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="barberos-form" disabled={deshabilitado}>
            {barbero ? "Guardar cambios" : "Agregar barbero"}
          </Button>
        </>
      }
    >
      <form id="barberos-form" className="space-y-4" onSubmit={enviar} noValidate>
        <Field data-invalid={!!errors.nombre}>
          <FieldLabel htmlFor="nombre">Nombre completo</FieldLabel>
          <Input
            id="nombre"
            placeholder="Nombre y apellidos"
            aria-invalid={!!errors.nombre}
            {...register("nombre")}
          />
          <FieldError errors={[errors.nombre]} />
        </Field>

        <Field data-invalid={!!errors.rol}>
          <FieldLabel htmlFor="rol">Rol</FieldLabel>
          <Controller
            control={control}
            name="rol"
            render={({ field }) => (
              <Select
                value={field.value ?? null}
                onValueChange={(valor) => field.onChange(valor ?? undefined)}
              >
                <SelectTrigger id="rol" className="w-full" aria-invalid={!!errors.rol}>
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  {rolesBarbero.map((rol) => (
                    <SelectItem key={rol} value={rol}>
                      {rol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[errors.rol]} />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field data-invalid={!!errors.telefono}>
            <FieldLabel htmlFor="telefono">Teléfono</FieldLabel>
            <Input
              id="telefono"
              type="tel"
              placeholder="+52 55 0000 0000"
              aria-invalid={!!errors.telefono}
              {...register("telefono")}
            />
            <FieldError errors={[errors.telefono]} />
          </Field>

          <Field data-invalid={!!errors.porcentajeComision}>
            <FieldLabel htmlFor="porcentajeComision">Comisión (%)</FieldLabel>
            <Input
              id="porcentajeComision"
              type="number"
              min={10}
              max={70}
              placeholder="30"
              aria-invalid={!!errors.porcentajeComision}
              {...register("porcentajeComision", { valueAsNumber: true })}
            />
            <FieldError errors={[errors.porcentajeComision]} />
          </Field>
        </div>

        <Field data-invalid={!!errors.correo}>
          <FieldLabel htmlFor="correo">Correo electrónico</FieldLabel>
          <Input
            id="correo"
            type="email"
            placeholder="barbero@trimly.mx"
            aria-invalid={!!errors.correo}
            {...register("correo")}
          />
          <FieldError errors={[errors.correo]} />
        </Field>
      </form>
    </Modal>
  )
}
