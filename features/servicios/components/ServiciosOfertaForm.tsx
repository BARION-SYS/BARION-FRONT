"use client"

import { useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Input } from "@shared/components/ui/input"
import { Switch } from "@shared/components/ui/switch"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"
import { useFormato } from "@shared/hooks/useFormato"
import type { DatosOferta } from "@features/servicios/schemas/servicios.schema"
import type { LineaOferta, Servicio } from "@features/servicios/types/servicios.types"

interface ServiciosOfertaFormProps {
  /** El catálogo entero: lo que este barbero PODRÍA ofrecer. */
  servicios: Servicio[]
  /** Lo que ofrece hoy. Las líneas inactivas son servicios que retiró. */
  oferta: LineaOferta[]
  cargando?: boolean
  soloLectura?: boolean
  onSubmit: (datos: DatosOferta) => Promise<void>
}

interface FilaOferta {
  incluido: boolean
  /** En unidad mayor: quien lo llena piensa en pesos, no en centavos. */
  monto: string
  duracion: string
}

/**
 * Qué hace este barbero, a qué precio y en cuánto tiempo. **Es lo que se reserva
 * de verdad**: la cita apunta aquí y no al catálogo.
 *
 * Se envía la lista COMPLETA, no los cambios: es lo único que permite quitar un
 * servicio. Lo que se apaga aquí la api lo desactiva —no lo borra—, porque de
 * cada línea cuelgan las citas ya atendidas con su precio congelado.
 */
export function ServiciosOfertaForm({
  servicios,
  oferta,
  cargando,
  soloLectura,
  onSubmit,
}: ServiciosOfertaFormProps) {
  const { aCentavos, deCentavos, dinero, moneda } = useFormato()

  /**
   * Las filas se DERIVAN de las props, no se copian al montar. El catálogo y la
   * oferta se piden al abrir el modal y llegan después: una copia hecha en el
   * primer render se queda con la lista vacía y el servicio que aparece luego no
   * tiene fila.
   */
  const filasBase = useMemo<Record<string, FilaOferta>>(
    () =>
      Object.fromEntries(
        servicios.map((servicio) => {
          const linea = oferta.find((l) => l.servicioId === servicio.id)
          return [
            servicio.id,
            {
              incluido: linea?.activo ?? false,
              // Sin línea propia se sugiere el precio de referencia del catálogo:
              // es el número que quien administra ya pensó para ese corte.
              monto: String(
                deCentavos(Number(linea?.precioCentavos ?? servicio.precioBaseCentavos ?? "0"))
              ),
              duracion: String(linea?.duracionMin ?? servicio.duracionBaseMin),
            },
          ]
        })
      ),
    [servicios, oferta, moneda] // eslint-disable-line react-hooks/exhaustive-deps
  )

  /** Solo lo que se tocó en pantalla; el resto se lee de lo que trajo la api. */
  const [editadas, setEditadas] = useState<Record<string, Partial<FilaOferta>>>({})

  const filaDe = (servicioId: string): FilaOferta => ({
    ...filasBase[servicioId],
    ...editadas[servicioId],
  })

  const cambiar = (servicioId: string, parche: Partial<FilaOferta>) =>
    setEditadas((previas) => ({ ...previas, [servicioId]: { ...previas[servicioId], ...parche } }))

  const enviar = () =>
    void onSubmit({
      lineas: servicios
        .filter((servicio) => filaDe(servicio.id).incluido)
        .map((servicio, indice) => ({
          servicioId: servicio.id,
          precioCentavos: aCentavos(Number(filaDe(servicio.id).monto || 0)),
          duracionMin: Number(filaDe(servicio.id).duracion || servicio.duracionBaseMin),
          orden: indice,
        })),
    })

  // Mientras el catálogo viaja no hay nada que decidir: sin esto, el vacío de
  // «no hay servicios» parpadea como si el catálogo estuviera realmente vacío.
  if (cargando && servicios.length === 0) {
    return <DataSkeleton variant="form" />
  }

  if (servicios.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        No hay servicios en el catálogo todavía. Créalos primero: la oferta cuelga de ellos.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="scroll-fino flex max-h-[50vh] flex-col gap-2 overflow-y-auto">
        {servicios.map((servicio) => {
          const fila = filaDe(servicio.id)
          const limites = rangoDe(servicio, dinero)
          return (
            <li
              key={servicio.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Switch
                  id={`ofrece-${servicio.id}`}
                  checked={fila.incluido}
                  disabled={soloLectura}
                  onCheckedChange={(valor) => cambiar(servicio.id, { incluido: valor })}
                  aria-label={`Ofrecer ${servicio.nombre}`}
                />
                <div className="min-w-0">
                  <label
                    htmlFor={`ofrece-${servicio.id}`}
                    className="block truncate text-sm font-medium"
                  >
                    {servicio.nombre}
                  </label>
                  {limites && <p className="truncate text-xs text-muted-foreground">{limites}</p>}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  inputMode="decimal"
                  aria-label={`Precio de ${servicio.nombre}`}
                  className="w-32"
                  disabled={soloLectura || !fila.incluido}
                  value={fila.monto}
                  onChange={(e) => cambiar(servicio.id, { monto: e.target.value })}
                />
                <Input
                  type="number"
                  min={5}
                  max={600}
                  step={5}
                  aria-label={`Duración de ${servicio.nombre} en minutos`}
                  className="w-24"
                  disabled={soloLectura || !fila.incluido}
                  value={fila.duracion}
                  onChange={(e) => cambiar(servicio.id, { duracion: e.target.value })}
                />
                <span className="text-xs text-muted-foreground">min</span>
              </div>
            </li>
          )
        })}
      </ul>

      {!soloLectura && (
        <Button type="button" onClick={enviar} disabled={cargando} className="h-10">
          {cargando && <Loader2 className="size-4 animate-spin" aria-hidden />}
          Guardar oferta
        </Button>
      )}
    </div>
  )
}

/** El piso y el techo que la barbería impone, si los impone. */
function rangoDe(servicio: Servicio, dinero: (centavos: number) => string): string | null {
  const min = servicio.precioMinCentavos
  const max = servicio.precioMaxCentavos
  if (!min && !max) return null
  if (min && max) return `Entre ${dinero(Number(min))} y ${dinero(Number(max))}`
  if (min) return `Desde ${dinero(Number(min))}`
  return `Hasta ${dinero(Number(max))}`
}
