"use client"

import { useState } from "react"
import Link from "next/link"
import { Controller, useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { ArrowRight, Eye, EyeOff } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Checkbox } from "@shared/components/ui/checkbox"
import { Field, FieldError, FieldLabel } from "@shared/components/ui/field"
import { Input } from "@shared/components/ui/input"
import { esquemaLogin, type DatosLogin } from "@features/auth/schemas/auth.schema"

interface LoginProps {
  onSubmit: (datos: DatosLogin) => Promise<void>
  cargando?: boolean
  error?: string | null
}

// Presentacional: el padre (app/page.tsx) entrega el submit y el estado por props.
export function Login({ onSubmit, cargando, error }: LoginProps) {
  const [verContrasena, setVerContrasena] = useState(false)
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<DatosLogin>({
    resolver: standardSchemaResolver(esquemaLogin),
    defaultValues: { correo: "admin@elrey.mx", contrasena: "12345678", recordarme: true },
  })

  const enviar = handleSubmit(async (datos) => {
    await onSubmit(datos)
  })

  const deshabilitado = isSubmitting || !!cargando

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Bienvenido de vuelta</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">Ingresa a tu panel de barbería</p>
      </div>

      <form className="space-y-4" onSubmit={enviar} noValidate>
        <Field data-invalid={!!errors.correo}>
          <FieldLabel htmlFor="correo">Correo electrónico</FieldLabel>
          <Input
            id="correo"
            type="email"
            autoComplete="email"
            placeholder="tu@barberia.mx"
            aria-invalid={!!errors.correo}
            {...register("correo")}
          />
          <FieldError errors={[errors.correo]} />
        </Field>

        <Field data-invalid={!!errors.contrasena}>
          <FieldLabel htmlFor="contrasena">Contraseña</FieldLabel>
          <div className="relative">
            <Input
              id="contrasena"
              type={verContrasena ? "text" : "password"}
              autoComplete="current-password"
              aria-invalid={!!errors.contrasena}
              className="pr-11"
              {...register("contrasena")}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setVerContrasena(!verContrasena)}
              aria-label={verContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
              className="absolute top-1/2 right-1 -translate-y-1/2"
            >
              {verContrasena ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
            </Button>
          </div>
          <FieldError errors={[errors.contrasena]} />
        </Field>

        <div className="flex items-center justify-between text-xs">
          <label
            htmlFor="recordarme"
            className="flex cursor-pointer items-center gap-2 text-muted-foreground"
          >
            <Controller
              control={control}
              name="recordarme"
              render={({ field }) => (
                <Checkbox id="recordarme" checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
            Recordarme
          </label>
          <Button type="button" variant="link" size="sm" className="px-0 text-xs">
            ¿Olvidaste tu contraseña?
          </Button>
        </div>

        {error && (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" disabled={deshabilitado} className="mt-2 w-full">
          Iniciar sesión <ArrowRight aria-hidden />
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        ¿No tienes cuenta?{" "}
        <Button variant="link" size="sm" className="px-0 text-xs">
          Registra tu barbería gratis
        </Button>
      </p>

      <div className="mt-8 border-t border-border pt-6 text-center">
        <p className="text-[11px] text-muted-foreground">
          Demo: accede directamente sin credenciales
        </p>
        <Link
          href="/dashboard"
          className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-primary/80"
        >
          Ir al dashboard de demo <ArrowRight className="h-3 w-3" aria-hidden />
        </Link>
      </div>
    </div>
  )
}
