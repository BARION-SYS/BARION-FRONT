"use client"

import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Loader2 } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@shared/components/ui/field"
import { Input } from "@shared/components/ui/input"
import { esquemaSede, type DatosSede } from "@features/sedes/schemas/sedes.schema"
import type { Sede } from "@features/sedes/types/sedes.types"

interface SedesFormProps {
  /** Sin sede = alta. Con sede = edición. */
  sede?: Sede | null
  cargando?: boolean
  onSubmit: (datos: DatosSede) => Promise<void>
}

/**
 * Alta y edición de una sede.
 *
 * La zona horaria se pide aquí y no se hereda de la barbería porque es de la
 * SEDE: una cadena que abre en Bogotá y en Madrid tiene dos agendas que no
 * comparten hora. Cambiarla reinterpreta toda la agenda futura de esa sede.
 */
export function SedesForm({ sede, cargando, onSubmit }: SedesFormProps) {
  const editando = Boolean(sede)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosSede>({
    resolver: standardSchemaResolver(esquemaSede),
    defaultValues: {
      nombre: sede?.nombre ?? "",
      zonaHoraria: sede?.zonaHoraria ?? "America/Bogota",
      slugQr: sede?.slugQr ?? "",
      moneda: sede?.moneda ?? undefined,
      telefono: sede?.telefono ?? undefined,
      direccion: sede?.direccion ?? undefined,
      inicioSemana: sede?.inicioSemana === 0 ? 0 : 1,
    },
  })

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="flex flex-col gap-5">
      <Field>
        <FieldLabel htmlFor="nombre">Nombre</FieldLabel>
        <Input id="nombre" placeholder="Sede Centro" {...register("nombre")} />
        {errors.nombre && <FieldError>{errors.nombre.message}</FieldError>}
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="zonaHoraria">Zona horaria</FieldLabel>
          <Input id="zonaHoraria" placeholder="America/Bogota" {...register("zonaHoraria")} />
          <p className="text-xs text-muted-foreground">
            De la sede, no de la barbería: es la hora en la que se lee su agenda.
          </p>
          {errors.zonaHoraria && <FieldError>{errors.zonaHoraria.message}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="slugQr">Identificador del QR</FieldLabel>
          <Input id="slugQr" placeholder="centro" {...register("slugQr")} />
          <p className="text-xs text-muted-foreground">
            Se imprime en el código de la sede: cambiarlo invalida los ya repartidos.
          </p>
          {errors.slugQr && <FieldError>{errors.slugQr.message}</FieldError>}
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="telefono">Teléfono</FieldLabel>
          <Input id="telefono" placeholder="+573001112233" {...register("telefono")} />
          {errors.telefono && <FieldError>{errors.telefono.message}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="moneda">Moneda</FieldLabel>
          <Input id="moneda" placeholder="COP" {...register("moneda")} />
          <p className="text-xs text-muted-foreground">En blanco hereda la de la barbería.</p>
          {errors.moneda && <FieldError>{errors.moneda.message}</FieldError>}
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="calle">Dirección</FieldLabel>
          <Input id="calle" placeholder="Cra 7 #12-34" {...register("direccion.calle")} />
          {errors.direccion?.calle && <FieldError>{errors.direccion.calle.message}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="ciudad">Ciudad</FieldLabel>
          <Input id="ciudad" placeholder="Bogotá" {...register("direccion.ciudad")} />
          <p className="text-xs text-muted-foreground">Es lo que el portal pinta bajo el nombre.</p>
          {errors.direccion?.ciudad && <FieldError>{errors.direccion.ciudad.message}</FieldError>}
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="inicioSemana">Primer día de la semana</FieldLabel>
        <select
          id="inicioSemana"
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          {...register("inicioSemana", { valueAsNumber: true })}
        >
          <option value={1}>Lunes</option>
          <option value={0}>Domingo</option>
        </select>
        {errors.inicioSemana && <FieldError>{errors.inicioSemana.message}</FieldError>}
      </Field>

      <Button type="submit" disabled={cargando} className="h-10">
        {cargando && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {editando ? "Guardar sede" : "Crear sede"}
      </Button>
    </form>
  )
}
