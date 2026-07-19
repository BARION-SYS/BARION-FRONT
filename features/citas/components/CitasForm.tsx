"use client"

import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import type { Control, FieldError as ErrorRHF, FieldPath } from "react-hook-form"
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
  barberosCita,
  esquemaCita,
  serviciosCita,
  type DatosCita,
} from "@features/citas/schemas/citas.schema"
import type { CitaCalendario, SemanaCalendario } from "@features/citas/types/citas.types"

interface OpcionSelect {
  valor: string
  etiqueta: string
}

interface CampoSelectProps {
  control: Control<DatosCita>
  name: FieldPath<DatosCita>
  label: string
  placeholder: string
  opciones: OpcionSelect[]
  numerico?: boolean
  error?: ErrorRHF
}

// Select controlado de RHF — los campos numéricos viajan como string en el Select y vuelven a number.
function CampoSelect({
  control,
  name,
  label,
  placeholder,
  opciones,
  numerico,
  error,
}: CampoSelectProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Field data-invalid={!!error}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Select
            value={field.value === undefined ? "" : String(field.value)}
            onValueChange={(valor) => field.onChange(numerico ? Number(valor) : valor)}
          >
            <SelectTrigger id={name} aria-invalid={!!error} className="w-full">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {opciones.map((opcion) => (
                <SelectItem key={opcion.valor} value={opcion.valor}>
                  {opcion.etiqueta}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={[error]} />
        </Field>
      )}
    />
  )
}

interface CitasFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cita?: CitaCalendario | null
  semana: SemanaCalendario | null
  onSubmit: (datos: DatosCita) => Promise<void>
  guardando?: boolean
}

const valoresIniciales: Partial<DatosCita> = { cliente: "", duracion: 1 }

// Presentacional: crear cuando no hay cita, reagendar cuando llega una precargada.
export function CitasForm({
  open,
  onOpenChange,
  cita,
  semana,
  onSubmit,
  guardando,
}: CitasFormProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DatosCita>({
    resolver: standardSchemaResolver(esquemaCita),
    defaultValues: valoresIniciales,
  })

  // Al abrir: precarga la cita a reagendar o limpia para crear.
  useEffect(() => {
    if (!open) return
    reset(
      cita
        ? {
            cliente: cita.cliente,
            servicio: cita.servicio as DatosCita["servicio"],
            barbero: cita.barbero as DatosCita["barbero"],
            dia: cita.dia,
            horaInicio: cita.horaInicio,
            duracion: cita.duracion,
          }
        : valoresIniciales
    )
  }, [open, cita, reset])

  const enviar = handleSubmit(async (datos) => {
    await onSubmit(datos)
  })

  const deshabilitado = isSubmitting || !!guardando

  const opcionesServicio: OpcionSelect[] = serviciosCita.map((s) => ({ valor: s, etiqueta: s }))
  const opcionesBarbero: OpcionSelect[] = barberosCita.map((b) => ({ valor: b, etiqueta: b }))
  const opcionesDia: OpcionSelect[] =
    semana?.dias.map((dia, indice) => ({
      valor: String(indice),
      etiqueta: `${dia.etiqueta} ${dia.fecha}`,
    })) ?? []
  const opcionesHora: OpcionSelect[] =
    semana?.horas.map((hora, indice) => ({ valor: String(indice), etiqueta: hora })) ?? []
  const opcionesDuracion: OpcionSelect[] = [
    { valor: "1", etiqueta: "1 hora" },
    { valor: "2", etiqueta: "2 horas" },
  ]

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      titulo={cita ? "Reagendar cita" : "Nueva cita"}
      className="sm:max-w-md"
    >
      <form className="space-y-4" onSubmit={enviar} noValidate>
        <Field data-invalid={!!errors.cliente}>
          <FieldLabel htmlFor="cliente">Cliente</FieldLabel>
          <Input
            id="cliente"
            placeholder="Nombre del cliente"
            aria-invalid={!!errors.cliente}
            {...register("cliente")}
          />
          <FieldError errors={[errors.cliente]} />
        </Field>

        <CampoSelect
          control={control}
          name="servicio"
          label="Servicio"
          placeholder="Selecciona un servicio"
          opciones={opcionesServicio}
          error={errors.servicio}
        />

        <CampoSelect
          control={control}
          name="barbero"
          label="Barbero"
          placeholder="Selecciona un barbero"
          opciones={opcionesBarbero}
          error={errors.barbero}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CampoSelect
            control={control}
            name="dia"
            label="Día"
            placeholder="Selecciona el día"
            opciones={opcionesDia}
            numerico
            error={errors.dia}
          />
          <CampoSelect
            control={control}
            name="horaInicio"
            label="Hora"
            placeholder="Selecciona la hora"
            opciones={opcionesHora}
            numerico
            error={errors.horaInicio}
          />
        </div>

        <CampoSelect
          control={control}
          name="duracion"
          label="Duración"
          placeholder="Selecciona la duración"
          opciones={opcionesDuracion}
          numerico
          error={errors.duracion}
        />

        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex-1 cursor-pointer text-xs font-semibold"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            size="lg"
            disabled={deshabilitado}
            className="flex-1 cursor-pointer text-xs font-semibold"
          >
            {cita ? "Reagendar" : "Agendar"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
