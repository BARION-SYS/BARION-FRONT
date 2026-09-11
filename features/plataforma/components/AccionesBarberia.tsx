"use client"

import Link from "next/link"
import { ExternalLink, FileText, MoreHorizontal } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/components/ui/dropdown-menu"
import {
  ESTADO_BARBERIA,
  MOTIVO_TRANSICION,
  TRANSICIONES_ESTADO,
} from "@features/plataforma/utils/inventario"
import type {
  BarberiaInventario,
  EstadoBarberia,
} from "@features/plataforma/types/plataforma.types"

interface AccionesBarberiaProps {
  barberia: BarberiaInventario
  /** Sin `plataforma.barberias.gestionar` no hay estado que cambiar. */
  gestiona: boolean
  /** Pide el cambio; confirmar es cosa del padre. */
  onCambiarEstado: (barberia: BarberiaInventario, destino: EstadoBarberia) => void
  /** Dentro de la propia ficha «Ver ficha» sobra. */
  enFicha?: boolean
}

/**
 * El menú de una fila del inventario. Lo comparten la tabla y la tarjeta de
 * móvil: si cada una tuviera el suyo, el día que se añada una acción una de las
 * dos se quedaría sin ella.
 *
 * Cambiar el estado **no ocurre aquí**: esto solo lo pide y el padre abre la
 * confirmación. Suspender una barbería por un toque en el sitio equivocado de un
 * menú deja a un negocio entero sin panel.
 */
export function AccionesBarberia({
  barberia,
  gestiona,
  onCambiarEstado,
  enFicha = false,
}: AccionesBarberiaProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Acciones de ${barberia.nombreComercial}`}
          >
            <MoreHorizontal aria-hidden />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-64">
        {!enFicha && (
          <DropdownMenuItem render={<Link href={`/admin/barberias/${barberia.id}`} />}>
            <FileText aria-hidden />
            Ver ficha
          </DropdownMenuItem>
        )}
        {/* El portal es de ESTA aplicación, pero se abre aparte: quien lo mira
            quiere comparar con la ficha, no perderla */}
        <DropdownMenuItem
          render={<a href={`/b/${barberia.slug}`} target="_blank" rel="noopener noreferrer" />}
        >
          <ExternalLink aria-hidden />
          Abrir su portal
        </DropdownMenuItem>
        {gestiona && (
          <>
            <DropdownMenuSeparator />
            {/* El título va DENTRO de un grupo, y no es cosmético:
                `DropdownMenuLabel` es el `GroupLabel` de Base UI y revienta en
                ejecución fuera de un `Menu.Group` —«MenuGroupContext is
                missing»— */}
            <DropdownMenuGroup>
              <DropdownMenuLabel>Cambiar estado</DropdownMenuLabel>
              {TRANSICIONES_ESTADO[barberia.estado].map((destino) => (
                <DropdownMenuItem
                  key={destino}
                  variant={destino === "suspendida" ? "destructive" : "default"}
                  onClick={() => onCambiarEstado(barberia, destino)}
                  className="flex-col items-start gap-0.5"
                >
                  <span>Pasar a {ESTADO_BARBERIA[destino].etiqueta.toLowerCase()}</span>
                  <span className="text-xs text-muted-foreground">
                    {MOTIVO_TRANSICION[destino]}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
