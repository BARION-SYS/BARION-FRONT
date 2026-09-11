"use client"

import type { UseFormRegisterReturn } from "react-hook-form"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@shared/components/ui/field"
import { Input } from "@shared/components/ui/input"

interface CampoContrasenaProps {
  id: string
  etiqueta: string
  registro: UseFormRegisterReturn
  error?: string
  autoComplete: "current-password" | "new-password"
  placeholder?: string
  /**
   * Si se ve en claro. Lo decide el formulario y no el campo: la nueva y su
   * repetición se muestran JUNTAS, o no hay forma de comparar lo que se tecleó.
   */
  visible?: boolean
  /** Con él, el campo lleva el botón del ojo. Sin él, sigue a `visible` en silencio. */
  alternar?: { onClick: () => void; mostrar: string; ocultar: string }
}

/**
 * Un campo de contraseña con su botón para verla.
 *
 * Las tres pantallas de contraseña lo escribían cada una a mano, y con un
 * `<button>` nativo de 40 px en vez del botón del sistema: sin el área táctil de
 * 44 px en móvil y sin su anillo de foco. Ahora es uno solo, sobre los primitivos.
 *
 * `suppressHydrationWarning` en el input por lo mismo que en el login: el gestor
 * de contraseñas de Chrome le mete un atributo propio antes de que React hidrate.
 */
export function CampoContrasena({
  id,
  etiqueta,
  registro,
  error,
  autoComplete,
  placeholder,
  visible = false,
  alternar,
}: CampoContrasenaProps) {
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>{etiqueta}</FieldLabel>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          suppressHydrationWarning
          aria-invalid={Boolean(error)}
          className={alternar ? "pr-11" : undefined}
          {...registro}
        />
        {alternar && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={alternar.onClick}
            aria-label={visible ? alternar.ocultar : alternar.mostrar}
            className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground"
          >
            {visible ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
          </Button>
        )}
      </div>
      {error && <FieldError>{error}</FieldError>}
    </Field>
  )
}
