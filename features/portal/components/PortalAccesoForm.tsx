"use client"

import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Loader2, Mail } from "lucide-react"
import { env } from "@config/env"
import { LogoGoogle } from "@shared/components/brand/LogoGoogle"
import { Button, buttonVariants } from "@shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@shared/components/ui/field"
import { Input } from "@shared/components/ui/input"
import { cn } from "@shared/utils/cn"
import { useTextos } from "@shared/textos/useTextos"
import {
  esquemaSolicitarCodigo,
  type DatosSolicitarCodigo,
} from "@features/portal/schemas/portal.schema"

interface PortalAccesoFormProps {
  onSubmit: (datos: DatosSolicitarCodigo) => Promise<void>
  /** Identificador de la barbería: decide a qué clientela entra esta persona. */
  slug: string
  cargando?: boolean
}

/**
 * Entrada del cliente a «Mis citas»: **sin cuenta y sin contraseña**, solo el
 * correo con el que reservó. El código que le llega ahí es toda la autenticación.
 *
 * Google es una segunda vía para lo mismo —probar que ese correo es suyo— y va
 * arriba porque se resuelve en un clic, mientras que el código obliga a salir a
 * buscarlo al buzón. **No sustituye a nada**: quien no lo use entra igual, y esa
 * regla no se mueve.
 */
export function PortalAccesoForm({ onSubmit, slug, cargando }: PortalAccesoFormProps) {
  const t = useTextos("portal.acceso")
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DatosSolicitarCodigo>({
    resolver: standardSchemaResolver(esquemaSolicitarCodigo),
    defaultValues: { email: "" },
  })

  const deshabilitado = isSubmitting || !!cargando

  return (
    <form className="space-y-4" onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
      <div className="flex items-start gap-2 rounded-xl bg-secondary/60 p-3">
        <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
        <p className="text-xs text-muted-foreground">
          Consulta, reagenda o cancela tus citas con el mismo correo con el que reservaste.
        </p>
      </div>

      {/* Enlace y no botón con fetch: es una NAVEGACIÓN del navegador hasta
          Google y de vuelta a la API, que es quien deja la cookie. Una petición
          desde este código no puede seguir ese viaje. El slug va en la ruta
          porque decide a qué barbería pertenece esta persona */}
      <a
        href={`${env.apiUrl}/auth/oauth/google/cliente/${encodeURIComponent(slug)}`}
        className={cn(buttonVariants({ variant: "outline" }), "h-12 w-full text-sm font-medium")}
      >
        <LogoGoogle aria-hidden />
        Continuar con Google
      </a>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" aria-hidden />
        <span className="text-xs text-muted-foreground">o con tu correo</span>
        <span className="h-px flex-1 bg-border" aria-hidden />
      </div>

      <Field data-invalid={!!errors.email}>
        <FieldLabel htmlFor="correo-acceso">{t("correo")}</FieldLabel>
        <Input
          id="correo-acceso"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="tucorreo@ejemplo.com"
          aria-invalid={!!errors.email}
          className="h-11 text-base"
          {...register("email")}
        />
        <FieldError errors={[errors.email]} />
      </Field>

      <Button
        type="submit"
        size="lg"
        disabled={deshabilitado}
        className="h-12 w-full cursor-pointer text-sm font-semibold"
      >
        {deshabilitado ? <Loader2 className="animate-spin" aria-hidden /> : t("enviarCodigo")}
      </Button>
    </form>
  )
}
