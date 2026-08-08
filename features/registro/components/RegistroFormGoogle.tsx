"use client"

import { Controller, useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { AlertCircle, ArrowRight, Loader2, ShieldCheck } from "lucide-react"
import { nombresDeRegion, regiones, type CodigoRegion } from "@config/regiones"
import { DireccionPublica } from "@features/registro/components/DireccionPublica"
import { CampoTelefono } from "@shared/components/forms/CampoTelefono"
import {
  esquemaFormularioRegistroGoogle,
  type DatosFormularioRegistroGoogle,
} from "@features/registro/schemas/registro.schema"
import type { PreregistroGoogle } from "@features/registro/types/registro.types"
import { LogoGoogle } from "@shared/components/brand/LogoGoogle"
import { Button } from "@shared/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
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

interface RegistroFormGoogleProps {
  onSubmit: (datos: DatosFormularioRegistroGoogle) => Promise<void>
  /** Con qué cuenta se vuelve del proveedor. Su correo ya está comprobado. */
  preregistro: PreregistroGoogle
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
 * El alta cuando la identidad ya la aportó Google. Presentacional.
 *
 * **Es un componente aparte y no un modo del otro, a propósito.** Los dos
 * formularios comparten los campos de la barbería pero no el esquema: aquí no
 * existen correo ni contraseña, y hacerlos opcionales en un único esquema
 * dejaría el alta con contraseña sin validar justo sus dos campos sensibles. Con
 * dos esquemas, cada camino valida exactamente lo que envía y la ausencia de un
 * campo es imposible de colar por descuido.
 *
 * Lo que cambia para quien lo usa: cuatro campos en vez de seis, ninguna
 * contraseña que inventar y ningún correo que ir a abrir después.
 */
export function RegistroFormGoogle({
  onSubmit,
  preregistro,
  onResolverSlug,
  onEditarNombre,
  slug,
  slugAjustado,
  resolviendoSlug,
  origen,
  regionInicial,
  cargando,
  error,
}: RegistroFormGoogleProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DatosFormularioRegistroGoogle>({
    resolver: standardSchemaResolver(esquemaFormularioRegistroGoogle),
    defaultValues: {
      nombreComercial: "",
      codigoPais: regionInicial,
      // Google ya sabe cómo se llama. Sigue siendo editable: como figura
      // alguien en su cuenta personal no tiene por qué ser como firma su
      // negocio.
      propietarioNombre: preregistro.nombre ?? "",
      propietarioTelefonoE164: "",
    },
  })

  const nombreComercial = watch("nombreComercial")
  const paisElegido = watch("codigoPais")
  const deshabilitado = isSubmitting || !!cargando
  const hayDireccion = nombreComercial.trim().length >= 2

  return (
    <form
      onSubmit={handleSubmit(async (datos) => onSubmit(datos))}
      className="space-y-8"
      noValidate
    >
      {/* Antes que cualquier campo: quien acaba de volver del proveedor tiene
          que ver con qué cuenta va a quedar registrado, porque en un equipo
          compartido bien puede no ser la suya.

          El logotipo va en su propio recuadro y no suelto sobre el fondo: le da
          un tamaño de caja al que agarrarse, y evita que se lea como decoración
          del texto de al lado. */}
      <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 p-3.5">
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-card shadow-sm"
          aria-hidden
        >
          <LogoGoogle className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">Continuarás como</p>
          <p className="truncate text-sm font-medium text-foreground">{preregistro.email}</p>
        </div>
        {/* Sin ícono a secas: el estado nunca se comunica solo con color */}
        <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-(--exito)">
          <ShieldCheck className="size-3.5" aria-hidden />
          Verificado
        </span>
      </div>

      {/* El `gap` del `FieldSet` separa el título de sus campos, así que se deja
          corto y el aire entre campos lo pone el bloque de abajo. Con un solo gap
          para las dos cosas hay que elegir: o el título queda pegado a su primer
          campo, o los campos quedan tan sueltos que dejan de leerse como grupo */}
      <FieldSet className="gap-2">
        <FieldLegend variant="label">Tu barbería</FieldLegend>

        <div className="mt-2 space-y-6">
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

          <Field data-invalid={!!errors.codigoPais}>
            <FieldLabel htmlFor="codigoPais">País donde opera tu barbería</FieldLabel>
            <Controller
              control={control}
              name="codigoPais"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(valor) => valor && field.onChange(valor)}
                >
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
        </div>
      </FieldSet>

      <FieldSeparator />

      <FieldSet className="gap-2">
        <FieldLegend variant="label">Tus datos</FieldLegend>
        <FieldDescription>
          Sin contraseña y sin correo que abrir: tu escaparate queda publicado al terminar. Podrás
          añadir una contraseña desde tu panel cuando quieras.
        </FieldDescription>

        {/* Una sola columna, y no es una preferencia estética: el teléfono son
            DOS controles —indicativo y número— y a media fila el indicativo se
            come el campo, con el número escribiéndose en el hueco que sobra.
            Dos campos de ancho distinto uno al lado del otro se leen apretados
            en cuanto uno de ellos no es un `input` a secas */}
        <div className="mt-2 space-y-6">
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

          {/* Google no entrega teléfono, y el negocio lo necesita igual: a una
              barbería hay que poder llamarla */}
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
            <FieldDescription>Para poder llamarte si hace falta.</FieldDescription>
            <FieldError errors={[errors.propietarioTelefonoE164]} />
          </Field>
        </div>
      </FieldSet>

      <div className="space-y-4">
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
          Al crear tu barbería empieza la prueba de 15 días. No pedimos tarjeta y el plan se elige
          al terminarla.
        </p>
      </div>
    </form>
  )
}
