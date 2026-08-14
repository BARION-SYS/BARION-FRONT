"use client"

import type { FieldError as ErrorDeCampo } from "react-hook-form"
import { rutasWeb } from "@routes/rutasPublicas"
import { Checkbox } from "@shared/components/ui/checkbox"
import { Field, FieldError } from "@shared/components/ui/field"

interface AceptacionTerminosProps {
  checked: boolean
  onCheckedChange: (marcado: boolean) => void
  error?: ErrorDeCampo
  disabled?: boolean
}

/**
 * La casilla de los términos, para los dos caminos del alta.
 *
 * **Nace desmarcada, y no es una decisión de diseño**: una casilla premarcada no
 * es una aceptación —lo dice la norma antes que el gusto—, y además convierte
 * un consentimiento en algo que nadie lee. Marcarla es el acto.
 *
 * Los enlaces salen a OTRO dominio (el sitio de venta, repo `BARION-WEB`), así
 * que van con `<a>` y no con `next/link`. Y con `target="_blank"`: quien abre
 * los términos a mitad de un formulario y navega fuera vuelve a encontrarse los
 * campos vacíos, que es la forma más segura de que no los lea nunca más.
 *
 * Presentacional: el estado lo lleva el `Controller` del formulario padre. Está
 * en `registro` y no en `shared/` porque hoy la usan dos componentes de esta
 * misma feature; sube el día que la pida una tercera.
 */
export function AceptacionTerminos({
  checked,
  onCheckedChange,
  error,
  disabled,
}: AceptacionTerminosProps) {
  return (
    <Field data-invalid={!!error}>
      <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-secondary/40 p-3">
        <Checkbox
          checked={checked}
          onCheckedChange={(marcado) => onCheckedChange(marcado === true)}
          disabled={disabled}
          aria-invalid={!!error}
          aria-label="Acepto los términos y la política de privacidad"
        />
        <span className="text-xs leading-relaxed text-muted-foreground">
          He leído y acepto los{" "}
          <a
            href={rutasWeb.terminos}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline underline-offset-2"
          >
            términos y condiciones
          </a>{" "}
          y la{" "}
          <a
            href={rutasWeb.privacidad}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline underline-offset-2"
          >
            política de privacidad
          </a>
          . Incluyen el tratamiento de los datos de tus clientes, donde tu barbería es la
          responsable y Barion el encargado.
        </span>
      </label>
      <FieldError errors={[error]} />
    </Field>
  )
}
