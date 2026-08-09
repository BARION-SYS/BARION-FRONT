"use client"

import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react"
import { env } from "@config/env"
import { nombresDeRegion, regiones, type CodigoRegion } from "@config/regiones"
import { DireccionPublica } from "@features/registro/components/DireccionPublica"
import { CampoTelefono } from "@shared/components/forms/CampoTelefono"
import {
  esquemaFormularioRegistro,
  type DatosFormularioRegistro,
} from "@features/registro/schemas/registro.schema"
import { LogoGoogle } from "@shared/components/brand/LogoGoogle"
import { Button, buttonVariants } from "@shared/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@shared/components/ui/field"
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
  /** La dirección del nombre estaba tomada y la api entregó una variante. */
  slugAjustado: boolean
  resolviendoSlug: boolean
  /** Dominio por el que se sirve la aplicación, para enseñar la dirección real. */
  origen: string
  regionInicial: CodigoRegion
  cargando?: boolean
  error?: string | null
}

/**
 * Presentacional: recibe el submit y el estado por props.
 *
 * Dos bloques con su título —la barbería y la cuenta de quien la abre— porque
 * son dos decisiones distintas, y siete campos en una sola columna se leen como
 * un trámite. Los errores de validación salen junto a su campo, nunca en un
 * toast; el de la petición entera va al pie, que es donde se estaba mirando al
 * pulsar.
 */
export function RegistroForm({
  onSubmit,
  onResolverSlug,
  onEditarNombre,
  slug,
  slugAjustado,
  resolviendoSlug,
  origen,
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
  // La dirección solo aparece cuando hay nombre del que sacarla; el campo no
  // puede apuntar con `aria-describedby` a algo que todavía no está en el árbol.
  const hayDireccion = nombreComercial.trim().length >= 2

  return (
    <form
      onSubmit={handleSubmit(async (datos) => onSubmit(datos))}
      className="space-y-8"
      noValidate
    >
      {/* Arriba del todo, antes del primer campo: es el camino corto —Google
          entrega el correo ya comprobado, así que se ahorra la contraseña y el
          enlace de verificación— y ofrecerlo después de siete campos es
          ofrecerlo a quien ya no lo necesita.

          Enlace y no botón con fetch: es una NAVEGACIÓN del navegador hasta
          Google y de vuelta a la API, que es quien deja el pase firmado. Una
          petición desde este código no puede seguir ese viaje. */}
      <div className="space-y-4">
        <a
          href={`${env.apiUrl}/auth/oauth/google/registro`}
          className={cn(buttonVariants({ variant: "outline" }), "h-11 w-full text-sm font-medium")}
        >
          <LogoGoogle aria-hidden />
          Registrarme con Google
        </a>

        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-border" aria-hidden />
          <span className="text-xs text-muted-foreground">o con tu correo</span>
          <span className="h-px flex-1 bg-border" aria-hidden />
        </div>
      </div>

      <FieldSet className="gap-5">
        <FieldLegend variant="label">Tu barbería</FieldLegend>

        <Field data-invalid={!!errors.nombreComercial}>
          <FieldLabel htmlFor="nombreComercial">Nombre de la barbería</FieldLabel>
          <Input
            id="nombreComercial"
            placeholder="Barbería El Corte"
            autoComplete="organization"
            className="h-11"
            aria-invalid={!!errors.nombreComercial}
            aria-describedby={hayDireccion ? "direccion-publica" : undefined}
            {...register("nombreComercial", {
              // Al escribir se olvida lo resuelto: enseñar la dirección de un
              // nombre que ya no está en el campo es peor que no enseñar
              // ninguna. Se vuelve a resolver al SALIR del campo y no en cada
              // tecla — corregir a quien todavía no terminó de escribir es lo
              // que hace que un formulario se sienta hostil.
              onChange: onEditarNombre,
              onBlur: (evento) => {
                const valor = String(evento.target.value ?? "").trim()
                if (valor.length >= 2) onResolverSlug(valor)
              },
            })}
          />
          <FieldError errors={[errors.nombreComercial]} />
        </Field>

        {hayDireccion && (
          <div id="direccion-publica">
            <DireccionPublica
              origen={origen}
              slug={slug}
              ajustado={slugAjustado}
              resolviendo={resolviendoSlug}
            />
          </div>
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
                <SelectTrigger
                  id="codigoPais"
                  aria-invalid={!!errors.codigoPais}
                  className="h-11 w-full"
                >
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
            {paisElegido ? ` (${regiones[paisElegido].moneda})` : ""} y tu facturación, y queda
            fijado al crear la barbería.
          </FieldDescription>
          <FieldError errors={[errors.codigoPais]} />
        </Field>
      </FieldSet>

      <FieldSet className="gap-5">
        <FieldLegend variant="label">Tu cuenta de propietario</FieldLegend>
        <FieldDescription className="-mt-3">
          Con este correo entras al panel. La contraseña la eliges tú: no viaja ninguna clave
          temporal por correo.
        </FieldDescription>

        {/* Una sola columna: el teléfono son DOS controles —indicativo y
            número— y a media fila el indicativo se come el campo. Dos campos de
            ancho distinto uno al lado del otro se leen apretados en cuanto uno
            de ellos no es un `input` a secas */}
        <div className="space-y-5">
          <Field data-invalid={!!errors.propietarioNombre}>
            <FieldLabel htmlFor="propietarioNombre">Tu nombre</FieldLabel>
            <Input
              id="propietarioNombre"
              placeholder="Julián Restrepo"
              autoComplete="name"
              className="h-11"
              aria-invalid={!!errors.propietarioNombre}
              {...register("propietarioNombre")}
            />
            <FieldError errors={[errors.propietarioNombre]} />
          </Field>

          <Field data-invalid={!!errors.propietarioTelefonoE164}>
            <FieldLabel htmlFor="propietarioTelefonoE164">Teléfono</FieldLabel>
            {/* El indicativo se elige de una lista y el número se escribe a
                secas: pedir el E.164 entero llevaba al error «formato
                E.164 (+573001112233)», que no dice nada a quien acaba de
                teclear su número de siempre */}
            <Controller
              control={control}
              name="propietarioTelefonoE164"
              render={({ field }) => (
                <CampoTelefono
                  id="propietarioTelefonoE164"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  paisSugerido={paisElegido}
                  invalido={!!errors.propietarioTelefonoE164}
                  disabled={deshabilitado}
                />
              )}
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
            className="h-11"
            aria-invalid={!!errors.propietarioEmail}
            {...register("propietarioEmail")}
          />
          <FieldDescription>Ahí llega el enlace que publica tu escaparate.</FieldDescription>
          <FieldError errors={[errors.propietarioEmail]} />
        </Field>

        <Field data-invalid={!!errors.contrasena}>
          <FieldLabel htmlFor="contrasena">Contraseña</FieldLabel>
          <div className="relative">
            <Input
              id="contrasena"
              type={verContrasena ? "text" : "password"}
              autoComplete="new-password"
              className="h-11 pr-11"
              aria-invalid={!!errors.contrasena}
              {...register("contrasena")}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-1/2 right-1 -translate-y-1/2"
              aria-label={verContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
              onClick={() => setVerContrasena((visible) => !visible)}
            >
              {verContrasena ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
            </Button>
          </div>
          {/* Persistente y no en el placeholder: el requisito tiene que seguir a
              la vista mientras se escribe, que es justo cuando desaparece */}
          <FieldDescription>Mínimo 12 caracteres.</FieldDescription>
          <FieldError errors={[errors.contrasena]} />
        </Field>
      </FieldSet>

      <div className="space-y-4">
        {/* Falló la petición, no un campo: por eso va aquí y no inline. Con
            ícono además del color — quien no distingue el rojo también tiene
            que ver que esto es un error */}
        {error && (
          <p
            role="alert"
            className="flex items-start gap-2.5 rounded-xl bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>{error}</span>
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

        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          Al crear tu barbería empieza la prueba de 7 días. No pedimos tarjeta y el plan se elige al
          terminarla.
        </p>
      </div>
    </form>
  )
}
