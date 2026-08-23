"use client"

import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Check } from "lucide-react"
import { env } from "@config/env"
import { LogoGoogle } from "@shared/components/brand/LogoGoogle"
import { Button, buttonVariants } from "@shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@shared/components/ui/field"
import { Input } from "@shared/components/ui/input"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { cn } from "@shared/utils/cn"
import {
  esquemaSeguridad,
  type DatosSeguridad,
} from "@features/configuracion/schemas/configuracion.schema"
import type { ProveedorVinculado } from "@features/auth/types/auth.types"
import { useTextos } from "@shared/textos/useTextos"

interface SeguridadProps {
  onSubmit: (datos: DatosSeguridad) => Promise<void>
  /**
   * Los proveedores que la cuenta YA tiene conectados, con el correo de cada
   * uno. Sale de `GET /auth/me`.
   */
  proveedores: ProveedorVinculado[]
  onDesconectar: (proveedor: string) => Promise<void>
  cargandoDesconexion?: boolean
}

/**
 * Seguridad de la cuenta: la contraseña y con qué más se entra.
 *
 * **La parte del proveedor se ramifica por el estado real, y antes no.** El
 * bloque de Google era estático: pintaba siempre «Conectar» y el aviso de que
 * hasta entonces el acceso con Google no funciona. En cuanto alguien lo
 * conectaba, ese aviso pasaba a ser mentira y la pantalla seguía ofreciendo
 * conectar algo que ya estaba conectado.
 *
 * **Y el correo del proveedor se enseña, no se da por hecho.** Vincular ocurre
 * con la sesión ya abierta, así que se puede conectar una cuenta de Google cuyo
 * correo NO es el de la cuenta de Barion — es correcto, quien lo hace ya
 * controla la cuenta y le está añadiendo otra llave suya. Enseñarlo es lo único
 * que permite darse cuenta de haber conectado la equivocada.
 */
export function Seguridad({
  onSubmit,
  proveedores,
  onDesconectar,
  cargandoDesconexion,
}: SeguridadProps) {
  const t = useTextos("configuracion.seguridad")
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DatosSeguridad>({
    resolver: standardSchemaResolver(esquemaSeguridad),
    defaultValues: { contrasenaActual: "", contrasenaNueva: "", confirmarContrasena: "" },
  })

  // Hoy el único proveedor con superficie es Google. Se busca en la lista en vez
  // de asumir que es el primero: el día que haya dos, esto sigue diciendo la
  // verdad sobre Google y no sobre "el que viniera antes".
  const google = proveedores.find((identidad) => identidad.proveedor === "google") ?? null

  // La mutación vive en el padre: el form solo delega
  const enviar = handleSubmit(async (datos) => {
    await onSubmit(datos)
    reset()
  })

  return (
    <SectionCard titulo={t("titulo")}>
      <form className="space-y-4" onSubmit={enviar} noValidate>
        <Field data-invalid={!!errors.contrasenaActual}>
          <FieldLabel htmlFor="contrasena-actual">{t("actual")}</FieldLabel>
          <Input
            id="contrasena-actual"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            aria-invalid={!!errors.contrasenaActual}
            {...register("contrasenaActual")}
          />
          <FieldError errors={[errors.contrasenaActual]} />
        </Field>

        <Field data-invalid={!!errors.contrasenaNueva}>
          <FieldLabel htmlFor="contrasena-nueva">{t("nueva")}</FieldLabel>
          <Input
            id="contrasena-nueva"
            type="password"
            placeholder={t("nuevaEjemplo")}
            autoComplete="new-password"
            aria-invalid={!!errors.contrasenaNueva}
            {...register("contrasenaNueva")}
          />
          <FieldError errors={[errors.contrasenaNueva]} />
        </Field>

        <Field data-invalid={!!errors.confirmarContrasena}>
          <FieldLabel htmlFor="confirmar-contrasena">{t("confirmar")}</FieldLabel>
          <Input
            id="confirmar-contrasena"
            type="password"
            placeholder={t("confirmarEjemplo")}
            autoComplete="new-password"
            aria-invalid={!!errors.confirmarContrasena}
            {...register("confirmarContrasena")}
          />
          <FieldError errors={[errors.confirmarContrasena]} />
        </Field>

        <Button type="submit" disabled={isSubmitting} className="mt-2">
          Actualizar contraseña
        </Button>
      </form>

      {/* Conectar Google DESDE AQUÍ y no desde la puerta, y es la diferencia que
          sostiene todo el flujo: al entrar por `/entrar` la identidad todavía no
          está probada, así que vincular por coincidencia de correo entregaría la
          cuenta a quien registre esa dirección en un proveedor. Aquí hay sesión
          abierta: quién es ya está demostrado y no hay nada que decidir.

          Enlace y no botón con fetch: es una NAVEGACIÓN hasta Google y de vuelta
          a la api, que es quien deja la cookie. */}
      <div className="mt-6 border-t border-border pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              Entrar con Google
              {google && (
                <span className="flex items-center gap-1 text-xs font-medium text-(--exito)">
                  <Check className="size-3.5" aria-hidden />
                  Conectada
                </span>
              )}
            </p>

            {google ? (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {/* El correo del proveedor puede NO ser el de la cuenta, y por
                    eso se enseña: es lo único que permite darse cuenta de haber
                    conectado la cuenta equivocada */}
                Entras con{" "}
                <span className="font-medium text-foreground">
                  {google.email ?? "tu cuenta de Google"}
                </span>
                . Puedes seguir usando la contraseña: no la reemplaza.
              </p>
            ) : (
              /* Que hasta conectarlo el acceso con Google FALLA hay que decirlo
                 aquí, y costó una vuelta entera descubrirlo: quien lo intenta
                 desde la puerta recibe «entra con tu contraseña y conéctalo», lo
                 hace, cambia la contraseña creyendo que era eso… y vuelve a
                 fallar, porque cambiar la contraseña no vincula nada. El botón
                 es el único paso que vincula. */
              <p className="mt-0.5 text-xs text-muted-foreground">
                <strong className="font-medium text-foreground">
                  Hasta que la conectes desde aquí, entrar con Google no va a funcionar
                </strong>{" "}
                — es este botón el que hace el vínculo, y solo se puede hacer con la sesión ya
                abierta. Después entrarás sin escribir la contraseña.
              </p>
            )}
          </div>

          {google ? (
            <Button
              type="button"
              variant="outline"
              disabled={cargandoDesconexion}
              onClick={() => void onDesconectar(google.proveedor)}
              className="h-10 shrink-0 text-sm"
            >
              Desconectar
            </Button>
          ) : (
            /* Enlace y no botón con fetch: es una NAVEGACIÓN hasta Google y de
               vuelta a la api, que es quien deja la cookie */
            <a
              href={`${env.apiUrl}/auth/oauth/google/vincular`}
              className={cn(buttonVariants({ variant: "outline" }), "h-10 shrink-0 text-sm")}
            >
              <LogoGoogle />
              Conectar Google
            </a>
          )}
        </div>
      </div>
    </SectionCard>
  )
}
