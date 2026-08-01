"use client"

import { Loadable } from "@shared/components/feedback/Loadable"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import { useFormato } from "@shared/hooks/useFormato"
import { cn } from "@shared/utils/cn"
import { configEstadoCita } from "@features/citas/utils/estadoCita"
import { resumenServicios } from "@features/citas/utils/servicios"
import type { Cita } from "@features/citas/types/citas.types"

interface CitasListProps {
  citas: Cita[]
  loading: boolean
  onSeleccionar: (cita: Cita) => void
}

/**
 * La agenda como lista, agrupada por día LOCAL de la sede.
 *
 * Es la vista que sirve en móvil y la que usa el barbero para su día: la grilla
 * dice cuándo hay hueco, esta dice qué toca ahora.
 */
export function CitasList({ citas, loading, onSeleccionar }: CitasListProps) {
  const { hora, fecha, dinero, fechaClave } = useFormato()

  const porDia = new Map<string, Cita[]>()
  for (const cita of citas) {
    const clave = fechaClave(cita.iniciaEn)
    porDia.set(clave, [...(porDia.get(clave) ?? []), cita])
  }

  return (
    <Loadable
      loading={loading}
      isEmpty={citas.length === 0}
      variant="list"
      count={5}
      emptyState={
        <p className="py-10 text-center text-sm text-muted-foreground">
          No hay citas en este rango.
        </p>
      }
    >
      <div className="flex flex-col gap-5">
        {[...porDia.entries()].map(([dia, delDia]) => (
          <section key={dia} className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              {fecha(`${dia}T12:00:00Z`)}
            </h3>

            <ul className="flex flex-col gap-2">
              {delDia.map((cita) => {
                const estado = configEstadoCita[cita.estado]
                return (
                  <li key={cita.id}>
                    <button
                      type="button"
                      onClick={() => onSeleccionar(cita)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-secondary/60",
                        (cita.estado === "cancelada" || cita.estado === "no_asistio") &&
                          "opacity-60"
                      )}
                    >
                      <span className="w-14 shrink-0 text-sm font-medium">
                        {hora(cita.iniciaEn)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {cita.cliente?.nombre ?? "Sin cliente"} {cita.cliente?.apellido ?? ""}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {resumenServicios(cita.servicios.map((linea) => linea.nombre))}
                          {cita.barbero ? ` · ${cita.barbero.nombrePublico}` : ""}
                        </span>
                      </span>
                      <span className="hidden text-sm sm:block">
                        {dinero(Number(cita.precioCentavos))}
                      </span>
                      <StatusBadge
                        tono={estado.tono}
                        etiqueta={estado.etiqueta}
                        icono={estado.icono}
                        compacta
                      />
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
    </Loadable>
  )
}
