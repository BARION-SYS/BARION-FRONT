"use client"

import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { ArrowRight, Eye, EyeOff, Link2, Loader2 } from "lucide-react"
import { nombresDeRegion, regiones, type CodigoRegion } from "@config/regiones"
import {
  esquemaFormularioRegistro,
  type DatosFormularioRegistro,
} from "@features/registro/schemas/registro.schema"
import { Button } from "@shared/components/ui/button"
import { Field, FieldDescription, FieldError, FieldLabel } from "@shared/components/ui/field"
import { Input } from "@shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select"
import { cn } from "@shared/utils/cn"

interface RegistroFormProps {
  onSubmit: (datos: DatosFormularioRegistro) => Promise<void>
  /** Al salir del nombre: el padre resuelve un identificador libre con la api. */
  onResolverSlug: (nombreComercial: string) => void
  onEditarNombre: () => void
  /** Identificador ya resuelto y comprobado. `null` mientras no lo haya. */
  slug: string | null
  resolviendoSlug: boolean
  regionInicial: CodigoRegion
  cargando?: boolean
  error?: string | null
}

// Presentacional: recibe el submit y el estado por props. Errores de validación
// inline junto al campo, nunca en un toast.
export function RegistroForm({
  onSubmit,
  onResolverSlug,
  onEditarNombre,
  slug,
  resolviendoSlug,
  regionInicial,
  cargando,
  error,
}: RegistroFormProps) {
  const [verContrasena, setVerContrasena] = useState(false)
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DatosFormularioRegistro>({
    resolver: standardSchemaResolver(esquemaFormularioRegistro),
    defaultValues: {
      nombreComercial: "",
      codigoPais: regionInicial,
      propietarioNombre: "",
      propietarioEmail: "",
      propietarioTelefonoE164: "",
      contrasena: "",
    },
  })

  const nombreComercial = watch("nombreComercial")
  const paisElegido = watch("codigoPais")
  const deshabilitado = isSubmitting || !!cargando

  return (
    <form
      onSubmit={handleSubmit(async (datos) => onSubmit(datos))}
      className="space-y-5"
      noValidate
    >
      <Field data-invalid={!!errors.nombreComercial}>
        <FieldLabel htmlFor="nombreComercial">Nombre de la barbería</FieldLabel>
        <Input
          id="nombreComercial"
          placeholder="Barbería El Corte"
          autoComplete="organization"
          aria-invalid={!!errors.nombreComercial}
          {...register("nombreComercial", {
            onChange: onEditarNombre,
            onBlur: (evento) => {
              const valor = String(evento.target.value ?? "").trim()
              if (valor.length >= 2) onResolverSlug(valor)
            },
          })}
        />
        <FieldError errors={[errors.nombreComercial]} />
      </Field>

      {/* La dirección NO se pregunta: sale del nombre y se comprueba contra la
          api. Se enseña resuelta porque es lo que la persona va a compartir */}
      {nombreComercial.trim().length >= 2 && (
        <p
          className="flex items-center gap-2 rounded-lg border border-border bg-secondary/60 px-3 py-2.5 text-sm"
          aria-live="polite"
        >
          {resolviendoSlug ? (
            <>
              <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" aria-hidden />
              <span className="text-muted-foreground">Buscando tu dirección…</span>
            </>
          ) : slug ? (
            <>
              <Link2 className="size-4 shrink-0 text-primary" aria-hidden />
              <span className="min-w-0">
                <span className="text-muted-foreground">Tu dirección: </span>
                <span className="font-medium break-all">barion.app/b/{slug}</span>
              </span>
            </>
          ) : (
            <>
              <Link2 className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="text-muted-foreground">
                La calculamos con el nombre al continuar. Podrás cambiarla desde el panel.
              </span>
            </>
          )}
        </p>
      )}

      {/* Este campo NO es una preferencia de visualización: fija la moneda con
          la que se cobra a la barbería y con la que factura a sus clientes, y
          se queda fijado al crearla. Elegir aquí el país más barato y operar en
          otro es un problema real, y la única defensa honesta es decir con
          claridad qué se está decidiendo. */}
      <Field data-invalid={!!errors.codigoPais}>
        <FieldLabel htmlFor="codigoPais">País donde opera tu barbería</FieldLabel>
        <Controller
          control={control}
          name="codigoPais"
          render={({ field }) => (
            <Select value={field.value} onValueChange={(valor) => valor && field.onChange(valor)}>
              <SelectTrigger id="codigoPais" aria-invalid={!!errors.codigoPais} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(regiones).map(([codigo, config]) => (
                  <SelectItem key={codigo} value={codigo}>
                    {nombresDeRegion[codigo as CodigoRegion]} ({config.moneda})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FieldDescription>
          Es donde atiendes, no desde dónde estás mirando esta página. Fija tu moneda
          {paisElegido ? ` (${regiones[paisElegido].moneda})` : ""} y tu facturación, y queda fijado
          al crear la barbería.
        </FieldDescription>
        <FieldError errors={[errors.codigoPais]} />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field data-invalid={!!errors.propietarioNombre}>
          <FieldLabel htmlFor="propietarioNombre">Tu nombre</FieldLabel>
          <Input
            id="propietarioNombre"
            placeholder="Julián Restrepo"
            autoComplete="name"
            aria-invalid={!!errors.propietarioNombre}
            {...register("propietarioNombre")}
          />
          <FieldError errors={[errors.propietarioNombre]} />
        </Field>

        <Field data-invalid={!!errors.propietarioTelefonoE164}>
          <FieldLabel htmlFor="propietarioTelefonoE164">Teléfono</FieldLabel>
          <Input
            id="propietarioTelefonoE164"
            type="tel"
            inputMode="tel"
            placeholder="+573001112233"
            autoComplete="tel"
            aria-invalid={!!errors.propietarioTelefonoE164}
            {...register("propietarioTelefonoE164")}
          />
          <FieldError errors={[errors.propietarioTelefonoE164]} />
        </Field>
      </div>

      <Field data-invalid={!!errors.propietarioEmail}>
        <FieldLabel htmlFor="propietarioEmail">Tu correo</FieldLabel>
        <Input
          id="propietarioEmail"
          type="email"
          inputMode="email"
          placeholder="dueno@barberia.co"
          autoComplete="email"
          aria-invalid={!!errors.propietarioEmail}
          {...register("propietarioEmail")}
        />
        <FieldError errors={[errors.propietarioEmail]} />
      </Field>

      <Field data-invalid={!!errors.contrasena}>
        <FieldLabel htmlFor="contrasena">Contraseña</FieldLabel>
        <div className="relative">
          <Input
            id="contrasena"
            type={verContrasena ? "text" : "password"}
            placeholder="Mínimo 12 caracteres"
            autoComplete="new-password"
            aria-invalid={!!errors.contrasena}
            className="pr-10"
            {...register("contrasena")}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute top-1/2 right-1 -translate-y-1/2"
            aria-label={verContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
            onClick={() => setVerContrasena((visible) => !visible)}
          >
            {verContrasena ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
          </Button>
        </div>
        <FieldError errors={[errors.contrasena]} />
      </Field>

      {/* Fallo de la petición, no de un campo: por eso va aquí y no inline */}
      {error && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={deshabilitado}
        className="group/cta h-12 w-full rounded-xl text-base font-semibold"
      >
        {deshabilitado ? (
          <>
            <Loader2 className="animate-spin" aria-hidden />
            Creando tu barbería…
          </>
        ) : (
          <>
            Crear mi barbería
            <ArrowRight
              className="transition-transform duration-200 group-hover/cta:translate-x-1"
              aria-hidden
            />
          </>
        )}
      </Button>
    </form>
  )
}
