"use client"

import { MoreHorizontal, Star } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@shared/components/ui/dropdown-menu"
import { Loadable } from "@shared/components/feedback/Loadable"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import { useFormato } from "@shared/hooks/useFormato"
import type { Servicio } from "@features/servicios/types/servicios.types"
import type { TonoEstado } from "@shared/types/ui.types"

interface ServiciosListProps {
  servicios: Servicio[]
  loading: boolean
  /** `catalogo.gestionar`: crear, editar, retirar y aprobar propuestas. */
  gestiona: boolean
  onEditar: (servicio: Servicio) => void
  onAlternarActivo: (servicio: Servicio) => void
}

/**
 * La carta de la barbería.
 *
 * El precio que se enseña es el de REFERENCIA: lo que se cobra de verdad es la
 * oferta de cada barbero, y por eso va con el prefijo "desde" y no como tarifa.
 */
export function ServiciosList({
  servicios,
  loading,
  gestiona,
  onEditar,
  onAlternarActivo,
}: ServiciosListProps) {
  const { dinero } = useFormato()

  return (
    <Loadable
      loading={loading}
      isEmpty={servicios.length === 0}
      variant="list"
      emptyState={
        <p className="py-10 text-center text-sm text-muted-foreground">
          Todavía no hay servicios. Crea el primero: sin catálogo no hay nada que reservar.
        </p>
      }
    >
      <ul className="flex flex-col gap-2">
        {servicios.map((servicio) => {
          const estado = estadoDe(servicio)
          return (
            <li
              key={servicio.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate text-sm font-medium">
                  {servicio.nombre}
                  {servicio.destacado && (
                    <Star
                      className="size-3.5 shrink-0 text-(--advertencia)"
                      aria-label="Destacado"
                    />
                  )}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {[
                    servicio.categoria,
                    `${servicio.duracionBaseMin} min`,
                    servicio.bufferMin > 0 ? `+${servicio.bufferMin} de limpieza` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>

              <span className="hidden text-sm sm:block">
                {servicio.precioBaseCentavos
                  ? `desde ${dinero(Number(servicio.precioBaseCentavos))}`
                  : "sin referencia"}
              </span>

              <StatusBadge tono={estado.tono} etiqueta={estado.etiqueta} compacta />

              {gestiona && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                    <MoreHorizontal className="size-4" aria-hidden />
                    <span className="sr-only">Acciones de {servicio.nombre}</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditar(servicio)}>Editar</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAlternarActivo(servicio)}>
                      {/* Publicar es lo mismo que aprobar: la propuesta de un
                          barbero llega inactiva y esto es lo que la abre. */}
                      {servicio.activo
                        ? "Retirar del catálogo"
                        : servicio.requiereAprobacion
                          ? "Aprobar y publicar"
                          : "Publicar"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </li>
          )
        })}
      </ul>
    </Loadable>
  )
}

function estadoDe(servicio: Servicio): { tono: TonoEstado; etiqueta: string } {
  if (servicio.activo) return { tono: "exito", etiqueta: "En carta" }
  // Inactivo por dos razones distintas, y para quien administra no son lo
  // mismo: una espera su decisión, la otra ya la tomó.
  if (servicio.requiereAprobacion) return { tono: "advertencia", etiqueta: "Propuesto" }
  return { tono: "neutro", etiqueta: "Retirado" }
}
