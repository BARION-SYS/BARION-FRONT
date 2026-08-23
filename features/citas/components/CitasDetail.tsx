"use client"

import { useState } from "react"
import { Button } from "@shared/components/ui/button"
import { Input } from "@shared/components/ui/input"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import { useFormato } from "@shared/hooks/useFormato"
import { inicialesDe } from "@shared/utils/iniciales"
import { configEstadoCita, textoEstadoCita } from "@features/citas/utils/estadoCita"
import type { AsientoHistorialCita, Cita, EstadoCita } from "@features/citas/types/citas.types"
import { useTextos } from "@shared/textos/useTextos"

interface CitasDetailProps {
  cita: Cita
  historial: AsientoHistorialCita[]
  /** `agenda.gestionar` o `agenda.gestionar_propia` sobre esta cita. */
  gestiona: boolean
  cargando?: boolean
  /** El destino, y la propina cuando se está completando. */
  onEstado: (estado: EstadoCita, propinaCentavos?: string) => void
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
  const tEstados = useTextos("citas.estados")
  const t = useTextos("citas")
  const { hora, fecha, fechaHora, dinero, aCentavos } = useFormato()
  // En unidad mayor: quien la teclea piensa en pesos, no en centavos.
  const [propina, setPropina] = useState("")
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
            {cita.cliente?.telefonoE164 ?? t("sinTelefono")}
          </p>
        </div>
        <StatusBadge
          tono={estado.tono}
          etiqueta={textoEstadoCita(tEstados, cita.estado)}
          icono={estado.icono}
        />
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">{t("detalle.cuando")}</dt>
          <dd>
            {fecha(cita.iniciaEn)} · {hora(cita.iniciaEn)}–{hora(cita.terminaEn)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Con</dt>
          <dd>{cita.barbero?.nombrePublico ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">{t("detalle.total")}</dt>
          <dd>{dinero(Number(cita.precioCentavos))}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">{t("detalle.seguimiento")}</dt>
          <dd className="font-mono text-xs">{cita.codigoSeguimiento}</dd>
        </div>
      </dl>

      <div>
        <p className="mb-2 text-xs text-muted-foreground">{t("detalle.servicios")}</p>
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

      {/*
        Cerrar una cita es cobrarla, así que la propina se pregunta AQUÍ y no en
        otra pantalla: es el mismo gesto. Va en blanco porque la mayoría de las
        citas no llevan, y solo se manda si alguien escribe algo — un cero
        explícito y un campo vacío significan lo mismo para el ledger, pero
        obligar a teclearlo convertiría cada cierre en un formulario.
      */}
      {gestiona && siguientes.includes("completada") && (
        <label className="flex flex-col gap-1.5 rounded-lg border border-border bg-secondary/40 p-3">
          <span className="text-xs font-medium text-foreground">
            Propina <span className="font-normal text-muted-foreground">(opcional)</span>
          </span>
          <Input
            inputMode="decimal"
            placeholder="0"
            value={propina}
            onChange={(evento) => setPropina(evento.target.value)}
            aria-label={t("propina")}
          />
          <span className="text-xs text-muted-foreground">
            Va íntegra al barbero. Una vez guardada solo se corrige con un ajuste de nómina.
          </span>
        </label>
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
              onClick={() =>
                onEstado(
                  destino,
                  // La propina solo viaja al completar: en cualquier otro salto
                  // la api responde 422, y con razón — nadie sabría qué
                  // significa una propina en una cita cancelada.
                  destino === "completada" && propina.trim()
                    ? aCentavos(Number(propina))
                    : undefined
                )
              }
            >
              {textoEstadoCita(tEstados, destino)}
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
          <p className="mb-2 text-xs text-muted-foreground">{t("detalle.historial")}</p>
          <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
            {historial.map((asiento, indice) => (
              <li key={`${asiento.ocurridoEn}-${indice}`}>
                {fechaHora(asiento.ocurridoEn)} · {textoEstadoCita(tEstados, asiento.estadoNuevo)} (
                {asiento.actor}){asiento.motivo ? ` — ${asiento.motivo}` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
