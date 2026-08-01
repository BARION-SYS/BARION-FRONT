"use client"

import { Button } from "@shared/components/ui/button"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import { useFormato } from "@shared/hooks/useFormato"
import { inicialesDe } from "@shared/utils/iniciales"
import { configEstadoCita } from "@features/citas/utils/estadoCita"
import type { AsientoHistorialCita, Cita, EstadoCita } from "@features/citas/types/citas.types"

interface CitasDetailProps {
  cita: Cita
  historial: AsientoHistorialCita[]
  /** `agenda.gestionar` o `agenda.gestionar_propia` sobre esta cita. */
  gestiona: boolean
  cargando?: boolean
  onEstado: (estado: EstadoCita) => void
  onReprogramar: () => void
}

/**
 * Los saltos que se ofrecen desde cada estado.
 *
 * Es un espejo de la tabla que manda —la de la api—, y solo para no ofrecer
 * botones que van a devolver 422. **La decisión la sigue tomando la api**: si
 * las dos discrepan, gana ella y aquí se corrige.
 */
const SIGUIENTES: Record<EstadoCita, EstadoCita[]> = {
  reservada: ["confirmada", "en_curso", "retrasada", "cancelada", "no_asistio"],
  pendiente_confirmacion: ["confirmada", "cancelada", "no_asistio"],
  confirmada: ["en_curso", "retrasada", "cancelada", "no_asistio"],
  retrasada: ["en_curso", "cancelada", "no_asistio"],
  en_curso: ["completada", "cancelada"],
  completada: [],
  cancelada: [],
  no_asistio: [],
}

export function CitasDetail({
  cita,
  historial,
  gestiona,
  cargando,
  onEstado,
  onReprogramar,
}: CitasDetailProps) {
  const { hora, fecha, fechaHora, dinero } = useFormato()
  const estado = configEstadoCita[cita.estado]
  const siguientes = SIGUIENTES[cita.estado]

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <InitialsAvatar iniciales={inicialesDe(cita.cliente?.nombre ?? "??")} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {cita.cliente?.nombre} {cita.cliente?.apellido}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {cita.cliente?.telefonoE164 ?? "Sin teléfono"}
          </p>
        </div>
        <StatusBadge tono={estado.tono} etiqueta={estado.etiqueta} icono={estado.icono} />
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Cuándo</dt>
          <dd>
            {fecha(cita.iniciaEn)} · {hora(cita.iniciaEn)}–{hora(cita.terminaEn)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Con</dt>
          <dd>{cita.barbero?.nombrePublico ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Total</dt>
          <dd>{dinero(Number(cita.precioCentavos))}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Seguimiento</dt>
          <dd className="font-mono text-xs">{cita.codigoSeguimiento}</dd>
        </div>
      </dl>

      <div>
        <p className="mb-2 text-xs text-muted-foreground">Servicios</p>
        <ul className="flex flex-col gap-1">
          {cita.servicios.map((linea) => (
            <li key={linea.id} className="flex items-center justify-between text-sm">
              {/* Congelado en la cita: puede no coincidir con el catálogo de hoy. */}
              <span className="truncate">
                {linea.nombre}
                <span className="ml-2 text-xs text-muted-foreground">{linea.duracionMin} min</span>
              </span>
              <span>{dinero(Number(linea.precioCentavos))}</span>
            </li>
          ))}
        </ul>
      </div>

      {cita.notasCliente && (
        <p className="rounded-lg border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
          {cita.notasCliente}
        </p>
      )}

      {gestiona && siguientes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {siguientes.map((destino) => (
            <Button
              key={destino}
              type="button"
              size="sm"
              variant={destino === "cancelada" ? "destructive" : "outline"}
              disabled={cargando}
              onClick={() => onEstado(destino)}
            >
              {configEstadoCita[destino].etiqueta}
            </Button>
          ))}
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={cargando}
            onClick={onReprogramar}
          >
            Reprogramar
          </Button>
        </div>
      )}

      {historial.length > 0 && (
        <div>
          <p className="mb-2 text-xs text-muted-foreground">Por dónde ha pasado</p>
          <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
            {historial.map((asiento, indice) => (
              <li key={`${asiento.ocurridoEn}-${indice}`}>
                {fechaHora(asiento.ocurridoEn)} · {configEstadoCita[asiento.estadoNuevo].etiqueta} (
                {asiento.actor}){asiento.motivo ? ` — ${asiento.motivo}` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
