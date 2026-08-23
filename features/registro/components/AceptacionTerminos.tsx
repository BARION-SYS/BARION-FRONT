"use client"

import type { FieldError as ErrorDeCampo } from "react-hook-form"
import { rutasWeb } from "@routes/rutasPublicas"
import { Checkbox } from "@shared/components/ui/checkbox"
import { Field, FieldError } from "@shared/components/ui/field"
import { useTextos } from "@shared/textos/useTextos"

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
  const t = useTextos("registro.terminos")
  return (
    <Field data-invalid={!!error}>
      <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-secondary/40 p-3">
        <Checkbox
          checked={checked}
          onCheckedChange={(marcado) => onCheckedChange(marcado === true)}
          disabled={disabled}
          aria-invalid={!!error}
          aria-label={t("aria")}
        />
        <span className="text-xs leading-relaxed text-muted-foreground">
          {t("heLeido")}{" "}
          <a
            href={rutasWeb.terminos}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline underline-offset-2"
          >
            {t("terminos")}
          </a>{" "}
          {t("yLa")}{" "}
          <a
            href={rutasWeb.privacidad}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline underline-offset-2"
          >
            {t("privacidad")}
          </a>
          {t("encargo")}
        </span>
      </label>
      <FieldError errors={[error]} />
    </Field>
  )
}
