"use client"

import { Button } from "@shared/components/ui/button"
import { Input } from "@shared/components/ui/input"
import { Label } from "@shared/components/ui/label"
import { Switch } from "@shared/components/ui/switch"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import { SectionCard } from "@shared/components/cards/SectionCard"
import type { HorarioDia } from "@features/configuracion/types/configuracion.types"

interface HorariosProps {
  horarios: HorarioDia[]
  alCambiar: (dia: string, cambios: Partial<HorarioDia>) => void
  guardando: boolean
  onSubmit: () => Promise<void>
}

export function Horarios({ horarios, alCambiar, guardando, onSubmit }: HorariosProps) {
  return (
    <SectionCard titulo="Horarios de apertura">
      <ul>
        {horarios.map((horario) => (
          <li
            key={horario.dia}
            className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border py-2.5 last:border-b-0"
          >
            <Label
              htmlFor={`abierto-${horario.dia}`}
              className="w-24 cursor-pointer text-sm font-medium text-foreground"
            >
              {horario.dia}
            </Label>
            <Switch
              id={`abierto-${horario.dia}`}
              checked={horario.abierto}
              onCheckedChange={(abierto) => alCambiar(horario.dia, { abierto })}
            />
            <StatusBadge
              etiqueta={horario.abierto ? "Abierto" : "Cerrado"}
              tono={horario.abierto ? "exito" : "neutro"}
            />
            {horario.abierto && (
              <div className="ml-auto flex items-center gap-2">
                <Input
                  type="time"
                  value={horario.apertura}
                  onChange={(evento) => alCambiar(horario.dia, { apertura: evento.target.value })}
                  aria-label={`Hora de apertura del ${horario.dia}`}
                  className="w-fit text-xs"
                />
                <span className="text-xs text-muted-foreground" aria-hidden>
                  —
                </span>
                <Input
                  type="time"
                  value={horario.cierre}
                  onChange={(evento) => alCambiar(horario.dia, { cierre: evento.target.value })}
                  aria-label={`Hora de cierre del ${horario.dia}`}
                  className="w-fit text-xs"
                />
              </div>
            )}
          </li>
        ))}
      </ul>
      <Button onClick={() => void onSubmit()} disabled={guardando} className="mt-4 self-start">
        Guardar horarios
      </Button>
    </SectionCard>
  )
}
