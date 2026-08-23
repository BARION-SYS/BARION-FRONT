"use client"

import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@shared/components/ui/tabs"
import { useFormato } from "@shared/hooks/useFormato"
import type { EstadoCita, VistaCalendario } from "@features/citas/types/citas.types"
import { configEstadoCita, textoEstadoCita } from "@features/citas/utils/estadoCita"
import { useTextos } from "@shared/textos/useTextos"

interface CitasToolbarProps {
  vista: VistaCalendario
  /** Fechas locales de la sede que se están pintando. */
  fechas: string[]
  barberoId: string
  estado: string
  barberos: { id: string; nombrePublico: string }[]
  /** `agenda.gestionar` o `agenda.gestionar_propia`. */
  gestiona: boolean
  onVista: (vista: VistaCalendario) => void
  onMover: (dias: number) => void
  onHoy: () => void
  onBarbero: (valor: string) => void
  onEstado: (valor: string) => void
  onNueva: () => void
}

const TODOS = "todos"

/**
 * Las tres vistas, en el orden en que se ofrecen.
 *
 * La LISTA vive aquí porque el orden es una decisión de diseño y no cambia con
 * el idioma; el texto sale del diccionario dentro del componente. Antes era un
 * mapa de vista a etiqueta a nivel de módulo, y ahí no alcanza ningún hook.
 */
const VISTAS: readonly VistaCalendario[] = ["semana", "dia", "lista"]

export function CitasToolbar({
  vista,
  fechas,
  barberoId,
  estado,
  barberos,
  gestiona,
  onVista,
  onMover,
  onHoy,
  onBarbero,
  onEstado,
  onNueva,
}: CitasToolbarProps) {
  const tEstados = useTextos("citas.estados")
  const t = useTextos("citas")
  const { fechaCorta } = useFormato()

  // El rótulo se arma con la fecha local, no con un instante: el día que se
  // pinta es el de la sede.
  const rotulo =
    fechas.length > 1
      ? `${fechaCorta(`${fechas[0]}T12:00:00Z`)} — ${fechaCorta(`${fechas[fechas.length - 1]}T12:00:00Z`)}`
      : fechaCorta(`${fechas[0]}T12:00:00Z`)

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="icon"
          variant="outline"
          aria-label={t("toolbar.anterior")}
          onClick={() => onMover(-1)}
        >
          <ChevronLeft className="size-4" aria-hidden />
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onHoy}>
          Hoy
        </Button>
        <Button
          type="button"
          size="icon"
          variant="outline"
          aria-label={t("toolbar.siguiente")}
          onClick={() => onMover(1)}
        >
          <ChevronRight className="size-4" aria-hidden />
        </Button>
        <span className="ml-1 text-sm font-medium" aria-live="polite">
          {rotulo}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Tabs value={vista}>
          <TabsList>
            {VISTAS.map((clave) => (
              <TabsTrigger key={clave} value={clave} onClick={() => onVista(clave)}>
                {t(`toolbar.${clave}`)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Select
          value={barberoId || TODOS}
          onValueChange={(valor) => onBarbero(!valor || valor === TODOS ? "" : valor)}
        >
          <SelectTrigger aria-label={t("toolbar.barbero")} className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>{t("toolbar.todosLosBarberos")}</SelectItem>
            {barberos.map((barbero) => (
              <SelectItem key={barbero.id} value={barbero.id}>
                {barbero.nombrePublico}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={estado || TODOS}
          onValueChange={(valor) => onEstado(!valor || valor === TODOS ? "" : valor)}
        >
          <SelectTrigger aria-label={t("toolbar.estado")} className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>{t("toolbar.todosLosEstados")}</SelectItem>
            {(Object.keys(configEstadoCita) as EstadoCita[]).map((clave) => (
              <SelectItem key={clave} value={clave}>
                {textoEstadoCita(tEstados, clave)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {gestiona && (
          <Button type="button" size="sm" onClick={onNueva}>
            <Plus className="size-4" aria-hidden />
            Nueva cita
          </Button>
        )}
      </div>
    </div>
  )
}
