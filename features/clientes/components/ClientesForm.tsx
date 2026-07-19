"use client"

import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
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
import { esquemaCliente, type DatosCliente } from "@features/clientes/schemas/clientes.schema"
import type { Cliente } from "@features/clientes/types/clientes.types"

// Mock: catálogo fijo hasta integrar el feat de barberos.
const BARBEROS = ["Miguel", "Pedro", "Juan"]
const ETIQUETAS: DatosCliente["etiqueta"][] = ["VIP", "Frecuente", "Regular", "Nuevo"]

const VALORES_VACIOS: DatosCliente = {
  nombre: "",
  telefono: "",
  correo: "",
  barberoFavorito: "",
  etiqueta: "Nuevo",
}

interface ClientesFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** null = crear; con valor = editar (precarga los campos) */
  cliente?: Cliente | null
  onSubmit: (datos: DatosCliente) => Promise<void>
  guardando?: boolean
}

// Presentacional: el padre entrega la mutación por onSubmit y controla el open.
export function ClientesForm({
  open,
  onOpenChange,
  cliente,
  onSubmit,
  guardando,
}: ClientesFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DatosCliente>({
    resolver: standardSchemaResolver(esquemaCliente),
    defaultValues: VALORES_VACIOS,
  })

  // Al abrir: precarga para editar o limpia para crear.
  useEffect(() => {
    if (!open) return
    reset(
      cliente
        ? {
            nombre: cliente.nombre,
            telefono: cliente.telefono,
            correo: cliente.correo,
            barberoFavorito: cliente.barberoFavorito,
            etiqueta: cliente.etiqueta,
          }
        : VALORES_VACIOS
    )
  }, [open, cliente, reset])

  const enviar = handleSubmit(async (datos) => {
    await onSubmit(datos)
  })

  const deshabilitado = isSubmitting || !!guardando

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      titulo={cliente ? "Editar cliente" : "Nuevo cliente"}
      descripcion={
        cliente
          ? "Actualiza la información del cliente."
          : "Registra un cliente para agendar sus citas."
      }
      className="sm:max-w-md"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deshabilitado}
            className="cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="clientes-form"
            disabled={deshabilitado}
            className="cursor-pointer"
          >
            {cliente ? "Guardar cambios" : "Crear cliente"}
          </Button>
        </>
      }
    >
      <form id="clientes-form" className="space-y-4" onSubmit={enviar} noValidate>
        <Field data-invalid={!!errors.nombre}>
          <FieldLabel htmlFor="nombre">Nombre</FieldLabel>
          <Input
            id="nombre"
            placeholder="Nombre y apellido"
            aria-invalid={!!errors.nombre}
            {...register("nombre")}
          />
          <FieldError errors={[errors.nombre]} />
        </Field>

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

        <Field data-invalid={!!errors.correo}>
          <FieldLabel htmlFor="correo">Correo electrónico</FieldLabel>
          <Input
            id="correo"
            type="email"
            placeholder="cliente@mail.com"
            aria-invalid={!!errors.correo}
            {...register("correo")}
          />
          <FieldError errors={[errors.correo]} />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field data-invalid={!!errors.barberoFavorito}>
            <FieldLabel htmlFor="barberoFavorito">Barbero favorito</FieldLabel>
            <Controller
              control={control}
              name="barberoFavorito"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="barberoFavorito"
                    aria-invalid={!!errors.barberoFavorito}
                    className="w-full"
                  >
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    {BARBEROS.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.barberoFavorito]} />
          </Field>

          <Field data-invalid={!!errors.etiqueta}>
            <FieldLabel htmlFor="etiqueta">Etiqueta</FieldLabel>
            <Controller
              control={control}
              name="etiqueta"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="etiqueta" aria-invalid={!!errors.etiqueta} className="w-full">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    {ETIQUETAS.map((e) => (
                      <SelectItem key={e} value={e}>
                        {e}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.etiqueta]} />
          </Field>
        </div>
      </form>
    </Modal>
  )
}
