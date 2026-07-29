"use client"

import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@shared/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@shared/components/ui/table"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import { Loadable } from "@shared/components/feedback/Loadable"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import { inicialesDe } from "@shared/utils/iniciales"
import type {
  BarberiaInventario,
  EstadoBarberia,
} from "@features/plataforma/types/plataforma.types"
import type { TonoEstado } from "@shared/types/ui.types"

interface PlataformaListProps {
  barberias: BarberiaInventario[]
  loading: boolean
  /** Sin `plataforma.barberias.gestionar` no hay estado que cambiar. */
  gestiona: boolean
  onCambiarEstado: (barberia: BarberiaInventario, estado: EstadoBarberia) => void
}

/**
 * El estado nunca se distingue solo por color: cada uno lleva su etiqueta.
 * `solo_lectura` es la prueba vencida — consulta sí, escritura no.
 */
const TONO_ESTADO: Record<EstadoBarberia, { tono: TonoEstado; etiqueta: string }> = {
  activa: { tono: "exito", etiqueta: "Activa" },
  solo_lectura: { tono: "advertencia", etiqueta: "Solo lectura" },
  suspendida: { tono: "peligro", etiqueta: "Suspendida" },
}

/** A dónde se puede pasar desde cada estado. Igual que en la API. */
const TRANSICIONES: Record<EstadoBarberia, EstadoBarberia[]> = {
  activa: ["suspendida", "solo_lectura"],
  solo_lectura: ["activa", "suspendida"],
  suspendida: ["activa"],
}

export function PlataformaList({
  barberias,
  loading,
  gestiona,
  onCambiarEstado,
}: PlataformaListProps) {
  return (
    <Loadable
      loading={loading}
      isEmpty={barberias.length === 0}
      variant="table"
      emptyState={
        <p className="py-10 text-center text-sm text-muted-foreground">
          Todavía no hay barberías. Crea la primera con el botón de arriba.
        </p>
      }
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Barbería</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead className="text-right">Sedes</TableHead>
              <TableHead className="text-right">Barberos</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {barberias.map((barberia) => {
              const estado = TONO_ESTADO[barberia.estado]
              return (
                <TableRow key={barberia.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <InitialsAvatar iniciales={inicialesDe(barberia.nombreComercial)} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{barberia.nombreComercial}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          /{barberia.slug} · {barberia.codigoPais}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge tono={estado.tono} etiqueta={estado.etiqueta} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {barberia.suscripcion
                      ? `${barberia.suscripcion.planCodigo ?? "—"} · ${barberia.suscripcion.estado}`
                      : "Sin suscripción"}
                  </TableCell>
                  <TableCell className="text-right text-sm">{barberia.sedesActivas}</TableCell>
                  <TableCell className="text-right text-sm">{barberia.barberosActivos}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                        <MoreHorizontal className="size-4" aria-hidden />
                        <span className="sr-only">Acciones de {barberia.nombreComercial}</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {TRANSICIONES[barberia.estado].map((destino) => (
                          <DropdownMenuItem
                            key={destino}
                            onClick={() => onCambiarEstado(barberia, destino)}
                          >
                            Pasar a {TONO_ESTADO[destino].etiqueta.toLowerCase()}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </Loadable>
  )
}
