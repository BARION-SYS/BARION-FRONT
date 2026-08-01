"use client"

import { Controller, useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Loader2 } from "lucide-react"
import { monedas } from "@config/regiones"
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
import { Textarea } from "@shared/components/ui/textarea"
import { useFormato } from "@shared/hooks/useFormato"
import { esquemaServicio, type DatosServicio } from "@features/servicios/schemas/servicios.schema"
import type { Servicio } from "@features/servicios/types/servicios.types"
import type { Sede } from "@features/sedes/types/sedes.types"

interface ServiciosFormProps {
  /** Sin servicio = alta. Con servicio = edición. */
  servicio?: Servicio | null
  /** Para atarlo a una sede. Vacío = vale en todas. */
  sedes: Sede[]
  /** `catalogo.gestionar`: sin él, lo que se crea es una PROPUESTA. */
  gestiona: boolean
  cargando?: boolean
  onSubmit: (datos: DatosServicio) => Promise<void>
}

const TODAS_LAS_SEDES = "todas"

/**
 * Alta y edición de un servicio del catálogo.
 *
 * El precio que se pide aquí es de REFERENCIA: sugiere el de la oferta y
 * alimenta el "desde $X" del portal. Lo que se cobra lo pone cada barbero en su
 * oferta, y por eso el piso y el techo son opcionales —solo hacen falta cuando
 * la barbería quiere acotar hasta dónde puede moverse.
 *
 * Moneda, duración y limpieza son obligatorios porque la api los exige: los tres
 * se deducen mal en silencio y el error aparece en la agenda, no aquí.
 */
export function ServiciosForm({
  servicio,
  sedes,
  gestiona,
  cargando,
  onSubmit,
}: ServiciosFormProps) {
  const editando = Boolean(servicio)
  const { aCentavos, deCentavos, moneda: monedaSede } = useFormato()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DatosServicio>({
    resolver: standardSchemaResolver(esquemaServicio),
    defaultValues: {
      nombre: servicio?.nombre ?? "",
      moneda: servicio?.moneda ?? monedaSede,
      duracionBaseMin: servicio?.duracionBaseMin ?? 30,
      bufferMin: servicio?.bufferMin ?? 0,
      descripcion: servicio?.descripcion ?? undefined,
      categoria: servicio?.categoria ?? undefined,
      sedeId: servicio?.sedeId ?? undefined,
      precioBaseCentavos: servicio?.precioBaseCentavos ?? undefined,
      precioMinCentavos: servicio?.precioMinCentavos ?? undefined,
      precioMaxCentavos: servicio?.precioMaxCentavos ?? undefined,
      destacado: servicio?.destacado ?? false,
    },
  })

  const enviando = cargando || isSubmitting

  // El formulario pide unidades mayores —quien lo llena piensa en pesos— y la
  // api solo acepta centavos.
  const comoCentavos = (valor: string) => (valor === "" ? undefined : aCentavos(Number(valor)))
  const comoMonto = (centavos: string | null | undefined) =>
    centavos === null || centavos === undefined ? "" : String(deCentavos(Number(centavos)))

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="flex flex-col gap-5">
      <Field data-invalid={!!errors.nombre}>
        <FieldLabel htmlFor="nombre">Nombre</FieldLabel>
        <Input
          id="nombre"
          placeholder="Corte clásico"
          aria-invalid={!!errors.nombre}
          {...register("nombre")}
        />
        <FieldError errors={[errors.nombre]} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field data-invalid={!!errors.categoria}>
          <FieldLabel htmlFor="categoria">Categoría</FieldLabel>
          <Input id="categoria" placeholder="Cortes" {...register("categoria")} />
          <p className="text-xs text-muted-foreground">Agrupa la carta. Se escribe libre.</p>
          <FieldError errors={[errors.categoria]} />
        </Field>

        <Controller
          control={control}
          name="sedeId"
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor="sedeId">Sede</FieldLabel>
              <Select
                value={field.value ?? TODAS_LAS_SEDES}
                onValueChange={(valor) =>
                  field.onChange(valor === TODAS_LAS_SEDES ? undefined : valor)
                }
              >
                <SelectTrigger id="sedeId" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TODAS_LAS_SEDES}>Todas las sedes</SelectItem>
                  {sedes.map((sede) => (
                    <SelectItem key={sede.id} value={sede.id}>
                      {sede.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[errors.sedeId]} />
            </Field>
          )}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Controller
          control={control}
          name="moneda"
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor="moneda">Moneda</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="moneda" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monedas.map((codigo) => (
                    <SelectItem key={codigo} value={codigo}>
                      {codigo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[errors.moneda]} />
            </Field>
          )}
        />

        <Field data-invalid={!!errors.duracionBaseMin}>
          <FieldLabel htmlFor="duracionBaseMin">Duración (min)</FieldLabel>
          <Input
            id="duracionBaseMin"
            type="number"
            min={5}
            max={600}
            step={5}
            {...register("duracionBaseMin", { setValueAs: (v: string) => Number(v) })}
          />
          <FieldError errors={[errors.duracionBaseMin]} />
        </Field>

        <Field data-invalid={!!errors.bufferMin}>
          <FieldLabel htmlFor="bufferMin">Limpieza (min)</FieldLabel>
          <Input
            id="bufferMin"
            type="number"
            min={0}
            max={240}
            step={5}
            {...register("bufferMin", { setValueAs: (v: string) => Number(v) })}
          />
          <p className="text-xs text-muted-foreground">
            Se suma al hueco que ocupa la cita: sin él, un corte pega con el siguiente.
          </p>
          <FieldError errors={[errors.bufferMin]} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Controller
          control={control}
          name="precioBaseCentavos"
          render={({ field }) => (
            <Field data-invalid={!!errors.precioBaseCentavos}>
              <FieldLabel htmlFor="precioBaseCentavos">Precio de referencia</FieldLabel>
              <Input
                id="precioBaseCentavos"
                type="number"
                min={0}
                inputMode="decimal"
                defaultValue={comoMonto(servicio?.precioBaseCentavos)}
                onChange={(e) => field.onChange(comoCentavos(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                El «desde» del escaparate. Lo que se cobra lo pone cada barbero.
              </p>
              <FieldError errors={[errors.precioBaseCentavos]} />
            </Field>
          )}
        />

        <Controller
          control={control}
          name="precioMinCentavos"
          render={({ field }) => (
            <Field data-invalid={!!errors.precioMinCentavos}>
              <FieldLabel htmlFor="precioMinCentavos">Precio mínimo</FieldLabel>
              <Input
                id="precioMinCentavos"
                type="number"
                min={0}
                inputMode="decimal"
                defaultValue={comoMonto(servicio?.precioMinCentavos)}
                onChange={(e) => field.onChange(comoCentavos(e.target.value))}
              />
              <FieldError errors={[errors.precioMinCentavos]} />
            </Field>
          )}
        />

        <Controller
          control={control}
          name="precioMaxCentavos"
          render={({ field }) => (
            <Field data-invalid={!!errors.precioMaxCentavos}>
              <FieldLabel htmlFor="precioMaxCentavos">Precio máximo</FieldLabel>
              <Input
                id="precioMaxCentavos"
                type="number"
                min={0}
                inputMode="decimal"
                defaultValue={comoMonto(servicio?.precioMaxCentavos)}
                onChange={(e) => field.onChange(comoCentavos(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                En blanco, el barbero pone el precio que quiera.
              </p>
              <FieldError errors={[errors.precioMaxCentavos]} />
            </Field>
          )}
        />
      </div>

      <Field data-invalid={!!errors.descripcion}>
        <FieldLabel htmlFor="descripcion">Descripción</FieldLabel>
        <Textarea id="descripcion" rows={3} className="resize-none" {...register("descripcion")} />
        <FieldError errors={[errors.descripcion]} />
      </Field>

      {gestiona && (
        <Controller
          control={control}
          name="destacado"
          render={({ field }) => (
            <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-secondary/40 px-4 py-3">
              <div className="min-w-0">
                <FieldLabel htmlFor="destacado" className="text-sm font-medium">
                  Destacar en el escaparate
                </FieldLabel>
                <p className="mt-1 text-xs text-muted-foreground">
                  Es un empujón comercial, no un ranking: lo más pedido lo calcula Barion desde las
                  citas.
                </p>
              </div>
              <Switch
                id="destacado"
                checked={field.value ?? false}
                onCheckedChange={field.onChange}
                aria-label="Destacar en el escaparate"
              />
            </div>
          )}
        />
      )}

      {!gestiona && !editando && (
        <p className="rounded-lg border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
          Lo estás proponiendo: el servicio queda pendiente hasta que quien administra la carta lo
          publique. Mientras tanto puedes ponerle precio en tu oferta.
        </p>
      )}

      <Button type="submit" disabled={enviando} className="h-10">
        {enviando && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {editando ? "Guardar servicio" : gestiona ? "Crear servicio" : "Proponer servicio"}
      </Button>
    </form>
  )
}
