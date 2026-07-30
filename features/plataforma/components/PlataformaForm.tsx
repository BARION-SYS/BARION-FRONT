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
import { regiones } from "@config/regiones"
import {
  esquemaAltaBarberia,
  type DatosAltaBarberia,
} from "@features/plataforma/schemas/plataforma.schema"

interface PlataformaFormProps {
  cargando?: boolean
  onSubmit: (datos: DatosAltaBarberia) => Promise<void>
}

/**
 * Alta de una barbería. Largo a propósito: lo que sale de aquí es una barbería
 * ENTREGABLE —con sede y con dueño que puede entrar—, no un registro vacío que
 * haya que completar después.
 *
 * El identificador público se pide explícitamente en vez de derivarlo del
 * nombre: es la dirección que el cliente va a repartir a sus clientes y a
 * imprimir en su QR, así que cambiarlo luego rompe cosas fuera del sistema.
 */
export function PlataformaForm({ cargando, onSubmit }: PlataformaFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosAltaBarberia>({
    resolver: standardSchemaResolver(esquemaAltaBarberia),
    defaultValues: { codigoPais: "CO", planCodigo: "profesional", diasPrueba: 15 },
  })

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="flex flex-col gap-5">
      <section className="flex flex-col gap-4">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          La barbería
        </p>

        <Field>
          <FieldLabel htmlFor="nombreComercial">Nombre comercial</FieldLabel>
          <Input
            id="nombreComercial"
            placeholder="Barbería El Corte"
            {...register("nombreComercial")}
          />
          {errors.nombreComercial && <FieldError>{errors.nombreComercial.message}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="slug">Identificador público</FieldLabel>
          <Input id="slug" placeholder="barberia-el-corte" {...register("slug")} />
          <p className="text-xs text-muted-foreground">
            Será su dirección: /b/<span className="font-medium">identificador</span>. Se imprime en
            su QR, así que conviene acertar a la primera.
          </p>
          {errors.slug && <FieldError>{errors.slug.message}</FieldError>}
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name="codigoPais"
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="codigoPais">País</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="codigoPais" className="w-full">
                    <SelectValue placeholder="Selecciona un país" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(regiones).map(([codigo, config]) => (
                      <SelectItem key={codigo} value={codigo}>
                        {codigo} · {config.moneda}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.codigoPais && <FieldError>{errors.codigoPais.message}</FieldError>}
              </Field>
            )}
          />

          <Field>
            <FieldLabel htmlFor="planCodigo">Plan</FieldLabel>
            <Input id="planCodigo" placeholder="profesional" {...register("planCodigo")} />
            {errors.planCodigo && <FieldError>{errors.planCodigo.message}</FieldError>}
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="diasPrueba">Días de prueba</FieldLabel>
          <Input
            id="diasPrueba"
            type="number"
            min={0}
            max={365}
            {...register("diasPrueba", { valueAsNumber: true })}
          />
          {errors.diasPrueba && <FieldError>{errors.diasPrueba.message}</FieldError>}
        </Field>
      </section>

      <section className="flex flex-col gap-4 border-t border-border pt-5">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Su primera sede
        </p>
        <Field>
          <FieldLabel htmlFor="sedeNombre">Nombre de la sede</FieldLabel>
          <Input id="sedeNombre" placeholder="Sede Centro" {...register("sedeNombre")} />
          {errors.sedeNombre && <FieldError>{errors.sedeNombre.message}</FieldError>}
        </Field>
      </section>

      <section className="flex flex-col gap-4 border-t border-border pt-5">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          El propietario
        </p>

        <Field>
          <FieldLabel htmlFor="propietarioNombre">Nombre</FieldLabel>
          <Input
            id="propietarioNombre"
            placeholder="Julián Restrepo"
            {...register("propietarioNombre")}
          />
          {errors.propietarioNombre && <FieldError>{errors.propietarioNombre.message}</FieldError>}
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="propietarioEmail">Correo</FieldLabel>
            <Input
              id="propietarioEmail"
              type="email"
              placeholder="dueno@barberia.co"
              {...register("propietarioEmail")}
            />
            {errors.propietarioEmail && <FieldError>{errors.propietarioEmail.message}</FieldError>}
          </Field>

          <Field>
            <FieldLabel htmlFor="propietarioTelefonoE164">Teléfono</FieldLabel>
            <Input
              id="propietarioTelefonoE164"
              placeholder="+573001112233"
              {...register("propietarioTelefonoE164")}
            />
            {errors.propietarioTelefonoE164 && (
              <FieldError>{errors.propietarioTelefonoE164.message}</FieldError>
            )}
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="propietarioContrasena">Contraseña temporal</FieldLabel>
          <Input
            id="propietarioContrasena"
            type="text"
            autoComplete="off"
            placeholder="mínimo 12 caracteres"
            {...register("propietarioContrasena")}
          />
          <p className="text-xs text-muted-foreground">
            Se la entregas al cliente junto con el enlace. Él la cambia al entrar, y a partir de ahí
            no vuelve a estar disponible en ningún sitio.
          </p>
          {errors.propietarioContrasena && (
            <FieldError>{errors.propietarioContrasena.message}</FieldError>
          )}
        </Field>
      </section>

      <Button type="submit" disabled={cargando} className="h-10">
        {cargando && <Loader2 className="size-4 animate-spin" aria-hidden />}
        Crear barbería
      </Button>
    </form>
  )
}
