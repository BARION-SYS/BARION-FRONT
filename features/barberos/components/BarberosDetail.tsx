import {
  Calendar,
  Clock,
  DollarSign,
  MoreHorizontal,
  Plus,
  Scissors,
  Star,
  type LucideIcon,
} from "lucide-react"
import { Badge } from "@shared/components/ui/badge"
import { Button } from "@shared/components/ui/button"
import { Card } from "@shared/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/components/ui/dropdown-menu"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { HorarioSemanal } from "@features/barberos/components/HorarioSemanal"
import { cn } from "@shared/utils/cn"
import type { TonoEstado } from "@shared/types/ui.types"
import type { Barbero, EstadoBarbero } from "@features/barberos/types/barberos.types"
import { formatNumber } from "@shared/utils/numbers"

const configEstado: Record<EstadoBarbero, { etiqueta: string; tono: TonoEstado }> = {
  activo: { etiqueta: "Activo", tono: "exito" },
  vacaciones: { etiqueta: "Vacaciones", tono: "advertencia" },
}

interface BarberosDetailProps {
  barbero: Barbero
  onEditar: () => void
  onEliminar: () => void
}

// Panel derecho: perfil completo del barbero seleccionado. Presentacional — solo dispara callbacks.
export function BarberosDetail({ barbero, onEditar, onEliminar }: BarberosDetailProps) {
  const estado = configEstado[barbero.estado]
  const resumen: { etiqueta: string; valor: string; icono: LucideIcon; clase: string }[] = [
    {
      etiqueta: "Citas esta semana",
      valor: `${barbero.estadisticas.citas}`,
      icono: Calendar,
      clase: "text-(--info)",
    },
    {
      etiqueta: "Ingresos semana",
      valor: `$${formatNumber(barbero.estadisticas.ingresos)}`,
      icono: DollarSign,
      clase: "text-primary",
    },
    {
      etiqueta: `Comisión (${barbero.estadisticas.porcentajeComision}%)`,
      valor: `$${barbero.estadisticas.comision}`,
      icono: Scissors,
      clase: "text-(--exito)",
    },
    {
      etiqueta: "Horario",
      valor: `${barbero.estadisticas.horasPorDia}h/día`,
      icono: Clock,
      clase: "text-muted-foreground",
    },
  ]
  const contacto = [
    { etiqueta: "Teléfono", valor: barbero.telefono },
    { etiqueta: "Correo", valor: barbero.correo },
  ]

  return (
    <div className="space-y-4">
      <Card className="gap-5 p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <InitialsAvatar iniciales={barbero.iniciales} color={barbero.color} tamano="lg" />
            <div>
              <h2 className="text-lg font-bold text-foreground">{barbero.nombre}</h2>
              <p className="text-sm text-muted-foreground">{barbero.rol}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <StatusBadge etiqueta={estado.etiqueta} tono={estado.tono} />
                <span className="flex items-center gap-1 text-[11px] font-semibold text-primary tabular-nums">
                  <Star className="h-3 w-3 fill-primary" aria-hidden /> {barbero.calificacion} (
                  {barbero.resenas} reseñas)
                </span>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="secondary"
                  size="icon-lg"
                  aria-label={`Más opciones de ${barbero.nombre}`}
                />
              }
            >
              <MoreHorizontal aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEditar}>Editar perfil</DropdownMenuItem>
              <DropdownMenuItem>Ver agenda</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={onEliminar}>
                Eliminar barbero
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {resumen.map((dato) => (
            <div key={dato.etiqueta} className="rounded-xl bg-secondary p-4">
              <div className="mb-2 flex items-center gap-2">
                <dato.icono className={cn("h-4 w-4", dato.clase)} aria-hidden />
                <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
                  {dato.etiqueta}
                </p>
              </div>
              <p className="text-xl font-bold text-foreground tabular-nums">{dato.valor}</p>
            </div>
          ))}
        </div>
      </Card>

      <SectionCard titulo="Horario semanal" subtitulo={barbero.horario}>
        <HorarioSemanal diasLaborales={barbero.diasLaborales} />
      </SectionCard>

      <SectionCard titulo="Servicios que realiza">
        <div className="flex flex-wrap gap-2">
          {barbero.servicios.map((servicio) => (
            <Badge
              key={servicio}
              variant="secondary"
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground"
            >
              {servicio}
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="h-9 rounded-lg border border-dashed border-border px-3 text-xs font-medium text-muted-foreground hover:border-primary/50 hover:bg-transparent hover:text-primary"
          >
            <Plus aria-hidden /> Agregar
          </Button>
        </div>
      </SectionCard>

      <SectionCard titulo="Información de contacto">
        <ul>
          {contacto.map((dato) => (
            <li
              key={dato.etiqueta}
              className="flex items-center justify-between border-b border-border py-2 last:border-0"
            >
              <span className="text-xs text-muted-foreground">{dato.etiqueta}</span>
              <span className="text-xs font-medium text-foreground">{dato.valor}</span>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  )
}
