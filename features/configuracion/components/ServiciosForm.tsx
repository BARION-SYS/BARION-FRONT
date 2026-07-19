"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Button } from "@shared/components/ui/button"
import { Modal } from "@shared/components/modals/Modal"
import { Field, FieldError, FieldLabel } from "@shared/components/ui/field"
import { Input } from "@shared/components/ui/input"
import {
  esquemaServicio,
  type DatosServicio,
} from "@features/configuracion/schemas/configuracion.schema"
import type { Servicio } from "@features/configuracion/types/configuracion.types"

interface ServiciosFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Servicio a editar; null/undefined = crear */
  servicio?: Servicio | null
  onSubmit: (datos: DatosServicio) => Promise<void>
  guardando?: boolean
}

// Presentacional: el padre decide crear o actualizar; el form solo valida y delega.
export function ServiciosForm({
  open,
  onOpenChange,
  servicio,
  onSubmit,
  guardando,
}: ServiciosFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DatosServicio>({
    resolver: standardSchemaResolver(esquemaServicio),
    defaultValues: { nombre: "" },
  })

  // Al abrir: precarga el servicio en edición o limpia para uno nuevo
  useEffect(() => {
    if (!open) return
    reset(
      servicio
        ? { nombre: servicio.nombre, precio: servicio.precio, duracionMin: servicio.duracionMin }
        : { nombre: "", precio: undefined, duracionMin: undefined }
    )
  }, [open, servicio, reset])

  const enviar = handleSubmit(async (datos) => {
    await onSubmit(datos)
  })

  const deshabilitado = isSubmitting || !!guardando

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      titulo={servicio ? "Editar servicio" : "Nuevo servicio"}
      descripcion={
        servicio
          ? "Actualiza los datos del servicio del catálogo."
          : "Agrega un servicio al catálogo de la barbería."
      }
      className="sm:max-w-md"
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="servicios-form" disabled={deshabilitado}>
            {servicio ? "Guardar cambios" : "Agregar servicio"}
          </Button>
        </>
      }
    >
      <form id="servicios-form" className="space-y-4" onSubmit={enviar} noValidate>
        <Field data-invalid={!!errors.nombre}>
          <FieldLabel htmlFor="servicio-nombre">Nombre</FieldLabel>
          <Input
            id="servicio-nombre"
            type="text"
            placeholder="Corte Clásico"
            aria-invalid={!!errors.nombre}
            {...register("nombre")}
          />
          <FieldError errors={[errors.nombre]} />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field data-invalid={!!errors.precio}>
            <FieldLabel htmlFor="servicio-precio">Precio</FieldLabel>
            <Input
              id="servicio-precio"
              type="number"
              inputMode="decimal"
              min={0}
              placeholder="110"
              aria-invalid={!!errors.precio}
              {...register("precio", { valueAsNumber: true })}
            />
            <FieldError errors={[errors.precio]} />
          </Field>

          <Field data-invalid={!!errors.duracionMin}>
            <FieldLabel htmlFor="servicio-duracion">Duración (min)</FieldLabel>
            <Input
              id="servicio-duracion"
              type="number"
              inputMode="numeric"
              min={5}
              max={180}
              step={5}
              placeholder="30"
              aria-invalid={!!errors.duracionMin}
              {...register("duracionMin", { valueAsNumber: true })}
            />
            <FieldError errors={[errors.duracionMin]} />
          </Field>
        </div>
      </form>
    </Modal>
  )
}
