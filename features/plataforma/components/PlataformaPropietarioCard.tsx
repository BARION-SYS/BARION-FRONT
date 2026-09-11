"use client"

import { Mail, Phone, UserX } from "lucide-react"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import { Button } from "@shared/components/ui/button"
import { useFormato } from "@shared/hooks/useFormato"
import { inicialesDe } from "@shared/utils/iniciales"
import type { PropietarioFicha } from "@features/plataforma/types/plataforma.types"

interface PlataformaPropietarioCardProps {
  propietario: PropietarioFicha | null
}

/**
 * A quién llama soporte. Es la contraparte del contrato con Barion, no un
 * cliente de la barbería: por eso sale con su contacto mientras que de la
 * clientela solo salen conteos.
 *
 * Correo y teléfono son enlaces (`mailto:`/`tel:`): desde un móvil, llamar es
 * un toque, y copiar un número a mano es donde se equivoca un dígito.
 */
export function PlataformaPropietarioCard({ propietario }: PlataformaPropietarioCardProps) {
  const { relativo } = useFormato()

  return (
    <SectionCard titulo="Propietario" subtitulo="Con quién se habla">
      {propietario ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <InitialsAvatar iniciales={inicialesDe(propietario.nombre)} tamano="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{propietario.nombre}</p>
              <p className="text-xs text-muted-foreground">
                {propietario.ultimoAccesoEn
                  ? `Entró ${relativo(propietario.ultimoAccesoEn)}`
                  : "No ha entrado nunca"}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
            {propietario.email && (
              <Button
                variant="outline"
                className="min-w-0 flex-1 justify-start"
                render={<a href={`mailto:${propietario.email}`} />}
              >
                <Mail className="size-4 shrink-0" aria-hidden />
                <span className="truncate">{propietario.email}</span>
              </Button>
            )}
            {propietario.telefonoE164 && (
              <Button
                variant="outline"
                className="justify-start"
                render={<a href={`tel:${propietario.telefonoE164}`} />}
              >
                <Phone className="size-4 shrink-0" aria-hidden />
                <span className="tabular-nums">{propietario.telefonoE164}</span>
              </Button>
            )}
          </div>

          {/* Sin proveedor vinculado entra con contraseña. Se dice para que
              soporte no mande a restablecer una clave que nunca puso quien
              abrió su barbería con Google */}
          <p className="rounded-lg bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
            {propietario.proveedores.length > 0
              ? `Entra con ${propietario.proveedores.join(", ")}.`
              : "Entra con correo y contraseña."}
          </p>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-lg bg-[color-mix(in_srgb,var(--advertencia)_10%,transparent)] px-3 py-3">
          <UserX className="size-4 shrink-0 text-(--advertencia)" aria-hidden />
          <p className="text-sm text-foreground">
            No tiene ninguna cuenta de propietario activa. Nadie puede administrarla.
          </p>
        </div>
      )}
    </SectionCard>
  )
}
