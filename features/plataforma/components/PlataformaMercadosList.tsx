"use client"

import { Globe, Power } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Input } from "@shared/components/ui/input"
import { Field, FieldDescription, FieldLabel } from "@shared/components/ui/field"
import { Loadable } from "@shared/components/feedback/Loadable"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import type { PaisAdmin } from "@features/plataforma/types/plataforma.types"

interface PlataformaMercadosListProps {
  paises: PaisAdmin[]
  loading: boolean
  cargandoAccion: boolean
  onAlternar: (pais: PaisAdmin) => void
  /** Puntos básicos, o `null` para apagar el impuesto en ese país. */
  onFijarImpuesto: (pais: PaisAdmin, bps: number | null) => void
}

/**
 * Dónde opera Barion y con qué impuesto factura allí.
 *
 * **«Mercados» y no «países» en el nombre, y no es un capricho**: ya existe un
 * `PlataformaPaisesList` que enseña el USO por país en el tablero —cuánta
 * clientela y cuántas citas hay en cada uno—. Son dos preguntas distintas sobre
 * la misma dimensión: aquella es medición, esta es configuración.
 *
 * **Las dos cosas están en la misma pantalla porque las dos son configuración
 * que cambia con el NEGOCIO y no con el código**: abrir España el día que haya
 * pasarela allí, o encender el impuesto el día que Barion pase el tope que lo
 * hace responsable. Lo segundo importa especialmente — una factura emitida no se
 * corrige, se anula, así que el valor tiene que poder cambiarse el día exacto en
 * que empieza a aplicar, no en el siguiente despliegue.
 *
 * **Y esta lista es la fuente de verdad de los dos frentes**: el selector de
 * país del alta y el de precios del sitio de venta salen de aquí. Antes cada uno
 * declaraba la suya, así que la landing ofrecía mercados donde el alta respondía
 * 422 después de rellenar el formulario entero.
 */
export function PlataformaMercadosList({
  paises,
  loading,
  cargandoAccion,
  onAlternar,
  onFijarImpuesto,
}: PlataformaMercadosListProps) {
  return (
    <Loadable
      loading={loading}
      isEmpty={paises.length === 0}
      variant="list"
      count={3}
      emptyState={
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <Globe className="size-5 text-muted-foreground" aria-hidden />
          <p className="text-sm font-medium">No hay países sembrados</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            Los países se siembran con la base; desde aquí se abren y se cierran.
          </p>
        </div>
      }
    >
      <ul className="flex flex-col gap-3">
        {paises.map((pais) => (
          <li key={pais.codigo} className="rounded-xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-medium">
                  {pais.nombre}
                  <StatusBadge
                    tono={pais.activo ? "exito" : "neutro"}
                    etiqueta={pais.activo ? "Abierto" : "Cerrado"}
                    compacta
                  />
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {pais.moneda} · {pais.zonaHoraria} · {pais.prefijoTelefono}
                </p>
              </div>

              <Button
                type="button"
                variant={pais.activo ? "outline" : "default"}
                size="sm"
                disabled={cargandoAccion}
                onClick={() => onAlternar(pais)}
              >
                <Power className="size-4" aria-hidden />
                {pais.activo ? "Cerrar" : "Abrir"}
              </Button>
            </div>

            <div className="mt-4 grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
              {/* El impuesto de BARION. Es el único que se toca desde aquí */}
              <Field>
                <FieldLabel htmlFor={`impuesto-${pais.codigo}`}>
                  Impuesto que Barion factura
                </FieldLabel>
                <div className="flex items-center gap-2">
                  <Input
                    id={`impuesto-${pais.codigo}`}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={100}
                    step="0.01"
                    className="h-10"
                    // Vacío es un valor con significado —«aquí no se cobra»— y no
                    // «sin definir»: por eso el campo nace vacío cuando es null en
                    // vez de con un cero, que se leería como una tasa puesta a mano.
                    defaultValue={pais.impuestoSaasBps === null ? "" : pais.impuestoSaasBps / 100}
                    disabled={cargandoAccion}
                    onBlur={(evento) => {
                      const crudo = evento.target.value.trim()
                      const bps = crudo === "" ? null : Math.round(Number(crudo) * 100)
                      if (bps !== null && !Number.isFinite(bps)) return
                      if (bps !== pais.impuestoSaasBps) onFijarImpuesto(pais, bps)
                    }}
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
                <FieldDescription>
                  Lo que Barion le factura a la barbería por el software. Vacío significa que aquí
                  no se cobra impuesto — y es una respuesta, no una configuración a medias.
                </FieldDescription>
              </Field>

              {/* El de la BARBERÍA, en solo lectura. Está aquí para que no se
                  vuelvan a confundir: son dos contribuyentes distintos */}
              <Field>
                <FieldLabel htmlFor={`impuesto-barberia-${pais.codigo}`}>
                  Impuesto de la barbería a sus clientes
                </FieldLabel>
                <Input
                  id={`impuesto-barberia-${pais.codigo}`}
                  readOnly
                  className="h-10 bg-secondary/40"
                  value={
                    pais.impuestoPorDefectoBps === null
                      ? "Sin definir"
                      : `${pais.impuestoPorDefectoBps / 100} % · ${pais.modoImpuesto}`
                  }
                />
                <FieldDescription>
                  Lo que la barbería le cobra a quien va a cortarse el pelo. Es otro contribuyente y
                  no se administra desde aquí.
                </FieldDescription>
              </Field>
            </div>
          </li>
        ))}
      </ul>
    </Loadable>
  )
}
