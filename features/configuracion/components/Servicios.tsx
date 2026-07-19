import { Pencil, Plus, Scissors, Trash2 } from "lucide-react"
import { Badge } from "@shared/components/ui/badge"
import { Button } from "@shared/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@shared/components/ui/table"
import { SectionCard } from "@shared/components/cards/SectionCard"
import type { Servicio } from "@features/configuracion/types/configuracion.types"

interface ServiciosProps {
  servicios: Servicio[]
  onNuevo: () => void
  onEditar: (servicio: Servicio) => void
  onEliminar: (servicio: Servicio) => void
}

// Presentacional: las mutaciones viven en el padre; aquí solo se disparan los callbacks.
export function Servicios({ servicios, onNuevo, onEditar, onEliminar }: ServiciosProps) {
  return (
    <SectionCard
      titulo="Catálogo de servicios"
      accion={
        <Button size="sm" onClick={onNuevo}>
          <Plus aria-hidden /> Agregar servicio
        </Button>
      }
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Servicio</TableHead>
            <TableHead>Duración</TableHead>
            <TableHead className="text-right">Precio</TableHead>
            <TableHead className="w-0">
              <span className="sr-only">Acciones</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {servicios.map((servicio) => (
            <TableRow key={servicio.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10"
                    aria-hidden
                  >
                    <Scissors className="size-3.5 text-primary" />
                  </span>
                  <span className="text-sm font-medium text-foreground">{servicio.nombre}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="rounded-full text-xs text-muted-foreground">
                  {servicio.duracionMin} min
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <span className="text-sm font-semibold text-foreground">${servicio.precio}</span>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Editar ${servicio.nombre}`}
                    onClick={() => onEditar(servicio)}
                  >
                    <Pencil aria-hidden />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Eliminar ${servicio.nombre}`}
                    className="text-destructive hover:text-destructive"
                    onClick={() => onEliminar(servicio)}
                  >
                    <Trash2 aria-hidden />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </SectionCard>
  )
}
