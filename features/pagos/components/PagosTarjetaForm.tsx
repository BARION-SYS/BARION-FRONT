"use client"

import { Controller, useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Loader2, ShieldCheck } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Checkbox } from "@shared/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@shared/components/ui/field"
import { Input } from "@shared/components/ui/input"
import { esquemaTarjeta, type DatosTarjeta } from "@features/pagos/schemas/pagos.schema"
import type { AceptacionesPasarela } from "@features/pagos/types/pagos.types"

interface PagosTarjetaFormProps {
  /** Sin las dos aceptaciones no se monta este formulario: las exige el proveedor. */
  aceptaciones: AceptacionesPasarela
  cargando?: boolean
  onSubmit: (datos: DatosTarjeta) => Promise<void>
}

/**
 * Los datos de la tarjeta, que van DIRECTO a la pasarela.
 *
 * Nada de lo que se escribe aquí llega a Barion: el navegador lo canjea por un
 * token de un solo uso y solo ese token cruza. De ahí que cada envío vuelva a
 * pedir el token — si la api lo rechaza, el anterior ya está gastado y hay que
 * mandar la tarjeta otra vez, no reintentar con lo mismo.
 */
export function PagosTarjetaForm({ aceptaciones, cargando, onSubmit }: PagosTarjetaFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosTarjeta>({
    resolver: standardSchemaResolver(esquemaTarjeta),
    defaultValues: {
      numero: "",
      titular: "",
      expiraMes: "",
      expiraAnio: "",
      cvc: "",
      aceptaTerminos: false,
      aceptaDatos: false,
    },
  })

  return (
    <form
      onSubmit={(e) => void handleSubmit(onSubmit)(e)}
      className="flex flex-col gap-5"
      noValidate
    >
      <Field data-invalid={!!errors.numero}>
        <FieldLabel htmlFor="numero">Número de la tarjeta</FieldLabel>
        <Input
          id="numero"
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="4242 4242 4242 4242"
          aria-invalid={!!errors.numero}
          {...register("numero")}
        />
        <FieldError errors={[errors.numero]} />
      </Field>

      <Field data-invalid={!!errors.titular}>
        <FieldLabel htmlFor="titular">Nombre en la tarjeta</FieldLabel>
        <Input
          id="titular"
          autoComplete="cc-name"
          placeholder="José Pérez"
          aria-invalid={!!errors.titular}
          {...register("titular")}
        />
        <FieldError errors={[errors.titular]} />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field data-invalid={!!errors.expiraMes}>
          <FieldLabel htmlFor="expiraMes">Mes</FieldLabel>
          <Input
            id="expiraMes"
            inputMode="numeric"
            maxLength={2}
            autoComplete="cc-exp-month"
            placeholder="08"
            aria-invalid={!!errors.expiraMes}
            {...register("expiraMes")}
          />
          <FieldError errors={[errors.expiraMes]} />
        </Field>

        <Field data-invalid={!!errors.expiraAnio}>
          <FieldLabel htmlFor="expiraAnio">Año</FieldLabel>
          <Input
            id="expiraAnio"
            inputMode="numeric"
            maxLength={2}
            autoComplete="cc-exp-year"
            placeholder="28"
            aria-invalid={!!errors.expiraAnio}
            {...register("expiraAnio")}
          />
          <FieldError errors={[errors.expiraAnio]} />
        </Field>

        <Field data-invalid={!!errors.cvc}>
          <FieldLabel htmlFor="cvc">Código</FieldLabel>
          <Input
            id="cvc"
            inputMode="numeric"
            maxLength={4}
            autoComplete="cc-csc"
            placeholder="123"
            aria-invalid={!!errors.cvc}
            {...register("cvc")}
          />
          <FieldError errors={[errors.cvc]} />
        </Field>
      </div>

      {/*
        Las dos aceptaciones son del proveedor y se marcan a mano: cada una
        enlaza a su documento, porque aceptar algo que no se puede leer no es
        aceptar nada. El orden en el que viajan lo fija el contrato de la api.
      */}
      <Controller
        control={control}
        name="aceptaTerminos"
        render={({ field }) => (
          <Field orientation="horizontal" data-invalid={!!errors.aceptaTerminos}>
            <Checkbox
              id="aceptaTerminos"
              checked={field.value}
              onCheckedChange={(marcado) => field.onChange(marcado)}
            />
            <FieldContent>
              <FieldLabel htmlFor="aceptaTerminos">Acepto los términos y condiciones</FieldLabel>
              <FieldDescription>
                <a href={aceptaciones.terminos.enlace} target="_blank" rel="noreferrer">
                  Leer el reglamento de la pasarela
                </a>
              </FieldDescription>
              <FieldError errors={[errors.aceptaTerminos]} />
            </FieldContent>
          </Field>
        )}
      />

      <Controller
        control={control}
        name="aceptaDatos"
        render={({ field }) => (
          <Field orientation="horizontal" data-invalid={!!errors.aceptaDatos}>
            <Checkbox
              id="aceptaDatos"
              checked={field.value}
              onCheckedChange={(marcado) => field.onChange(marcado)}
            />
            <FieldContent>
              <FieldLabel htmlFor="aceptaDatos">
                Autorizo el tratamiento de mis datos personales
              </FieldLabel>
              <FieldDescription>
                <a href={aceptaciones.datosPersonales.enlace} target="_blank" rel="noreferrer">
                  Leer la autorización
                </a>
              </FieldDescription>
              <FieldError errors={[errors.aceptaDatos]} />
            </FieldContent>
          </Field>
        )}
      />

      <p className="flex items-start gap-2 rounded-lg border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span>
          Los datos de la tarjeta viajan directo a la pasarela: Barion nunca ve el número. Si el
          guardado falla, vuelve a enviar el formulario — cada intento pide un permiso nuevo a la
          pasarela, así que el anterior no se reutiliza.
        </span>
      </p>

      <Button type="submit" disabled={cargando} className="h-10">
        {cargando && <Loader2 className="size-4 animate-spin" aria-hidden />}
        Guardar tarjeta
      </Button>
    </form>
  )
}
