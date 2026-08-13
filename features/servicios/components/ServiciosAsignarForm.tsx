"use client"

import { useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Input } from "@shared/components/ui/input"
import { Switch } from "@shared/components/ui/switch"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import { tokenDeColor } from "@shared/utils/color"
import { inicialesDe } from "@shared/utils/iniciales"
import { useFormato } from "@shared/hooks/useFormato"
import type { Barbero } from "@features/barberos/types/barberos.types"
import type { DatosAsignacionServicio } from "@features/servicios/schemas/servicios.schema"
import type { LineaOferta, Servicio } from "@features/servicios/types/servicios.types"

interface ServiciosAsignarFormProps {
  servicio: Servicio
  /** El plantel entero: quiénes PODRÍAN ofrecerlo. */
  barberos: Barbero[]
  /** Quiénes lo ofrecen hoy. Las líneas inactivas son quienes lo dejaron. */
  asignados: LineaOferta[]
  cargando?: boolean
  onSubmit: (datos: DatosAsignacionServicio) => Promise<void>
}

interface FilaAsignacion {
  incluido: boolean
  /** En unidad mayor y vacío = heredar: quien lo llena piensa en pesos. */
  precio: string
  duracion: string
}

export const ID_FORM_ASIGNAR = "form-asignar-servicio"

/**
 * Quiénes ofrecen este servicio.
 *
 * ── Por qué existe esta pantalla ────────────────────────────────────────────
 * Un servicio que nadie ofrece **no se puede reservar**: es una fila del
 * catálogo y nada más. Antes había que ir a la ficha de cada barbero y
 * reemplazarle la carta entera, así que crear un corte y repartirlo entre cinco
 * personas eran cinco pantallas — y la más fácil de dejar a medias.
 *
 * ── Heredar es el caso normal, y por eso es lo que pasa sin tocar nada ──────
 * Los dos campos van VACÍOS y eso significa «lo que dice el catálogo». Quien
 * reparte un corte está decidiendo quién lo hace, no negociando una tarifa por
 * cabeza: pedirle tres números por barbero convertiría un gesto de dos clics en
 * un formulario, y el panel acabaría rellenándolos por comodidad con valores que
 * nadie acordó. Quien sí tiene un acuerdo distinto lo escribe aquí, o lo ajusta
 * después desde la ficha de esa persona — es la misma línea.
 *
 * Se envía la lista COMPLETA, igual que la oferta del barbero: es lo único que
 * permite quitar a alguien. Lo que se apaga aquí la api lo desactiva —no lo
 * borra—, porque de cada línea cuelgan las citas ya atendidas con su precio
 * congelado, y quien vuelve recupera su acuerdo anterior.
 */
export function ServiciosAsignarForm({
  servicio,
  barberos,
  asignados,
  cargando,
  onSubmit,
}: ServiciosAsignarFormProps) {
  const { dinero, deCentavos, aCentavos } = useFormato()

  const inicial = useMemo(() => {
    const porBarbero = new Map(asignados.map((linea) => [linea.barberoId, linea]))

    return new Map<string, FilaAsignacion>(
      barberos.map((barbero) => {
        const linea = porBarbero.get(barbero.id)
        const heredaPrecio = !linea || linea.precioCentavos === (servicio.precioBaseCentavos ?? "")
        const heredaDuracion = !linea || linea.duracionMin === servicio.duracionBaseMin

        return [
          barbero.id,
          {
            incluido: !!linea?.activo,
            // Solo se precarga lo que DIFIERE del catálogo: repetir el valor
            // heredado lo convertiría en un acuerdo propio en el primer guardado.
            precio: linea && !heredaPrecio ? String(deCentavos(Number(linea.precioCentavos))) : "",
            duracion: linea && !heredaDuracion ? String(linea.duracionMin) : "",
          },
        ]
      })
    )
  }, [barberos, asignados, servicio, deCentavos])

  const [filas, setFilas] = useState(inicial)
  const [enviando, setEnviando] = useState(false)

  const actualizar = (barberoId: string, cambio: Partial<FilaAsignacion>) => {
    setFilas((previas) => {
      const siguiente = new Map(previas)
      const actual = siguiente.get(barberoId)
      if (actual) siguiente.set(barberoId, { ...actual, ...cambio })
      return siguiente
    })
  }

  const incluidos = [...filas.values()].filter((fila) => fila.incluido).length

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault()
    setEnviando(true)
    try {
      await onSubmit({
        barberos: [...filas.entries()]
          .filter(([, fila]) => fila.incluido)
          .map(([barberoId, fila]) => ({
            barberoId,
            // Vacío = no viaja = lo hereda la api. Mandar el valor del catálogo
            // sería escribir como acuerdo propio algo que nadie decidió.
            ...(fila.precio.trim() ? { precioCentavos: aCentavos(Number(fila.precio)) } : {}),
            ...(fila.duracion.trim() ? { duracionMin: Number(fila.duracion) } : {}),
          })),
      })
    } finally {
      setEnviando(false)
    }
  }

  if (cargando) return <DataSkeleton variant="list" count={4} />

  if (barberos.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Todavía no hay nadie con agenda en esta barbería. Agrega a alguien en Personas y vuelve: un
        servicio que nadie ofrece no se puede reservar.
      </p>
    )
  }

  return (
    <form id={ID_FORM_ASIGNAR} onSubmit={enviar} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Marca a quién se lo asignas. El precio y la duración se dejan en blanco para heredar los del
        catálogo —
        {servicio.precioBaseCentavos
          ? ` ${dinero(Number(servicio.precioBaseCentavos))}`
          : " sin precio base"}
        {` · ${servicio.duracionBaseMin} min`}— y solo se llenan si esa persona cobra distinto.
      </p>

      {!servicio.precioBaseCentavos && (
        <p
          role="note"
          className="rounded-lg border border-(--advertencia)/40 bg-[color-mix(in_srgb,var(--advertencia)_8%,transparent)] p-3 text-xs text-muted-foreground"
        >
          Este servicio no tiene precio base, así que hay que decir cuánto cobra cada barbero: sin
          eso no se puede publicar un precio al reservar.
        </p>
      )}

      <ul className="divide-y divide-border rounded-lg border border-border">
        {barberos.map((barbero) => {
          const fila = filas.get(barbero.id)
          if (!fila) return null

          return (
            <li key={barbero.id} className="space-y-3 p-3 sm:p-4">
              <div className="flex items-center gap-3">
                <InitialsAvatar
                  iniciales={inicialesDe(barbero.nombrePublico)}
                  color={tokenDeColor(barbero.indiceColor)}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {barbero.nombrePublico}
                  </p>
                  {!barbero.activo && (
                    <p className="text-xs text-muted-foreground">Retirado de la agenda</p>
                  )}
                </div>
                <Switch
                  checked={fila.incluido}
                  onCheckedChange={(valor) => actualizar(barbero.id, { incluido: valor })}
                  aria-label={`${barbero.nombrePublico} ofrece ${servicio.nombre}`}
                />
              </div>

              {/* Los ajustes solo aparecen cuando ya se dijo que sí: pintarlos
                  siempre convierte una lista de nombres en una tabla de números. */}
              {fila.incluido && (
                <div className="grid grid-cols-2 gap-3 pl-11">
                  <label className="space-y-1 text-xs text-muted-foreground">
                    Precio
                    <Input
                      inputMode="decimal"
                      className="h-11 text-base sm:h-9 sm:text-sm"
                      placeholder="Hereda"
                      value={fila.precio}
                      onChange={(evento) => actualizar(barbero.id, { precio: evento.target.value })}
                    />
                  </label>
                  <label className="space-y-1 text-xs text-muted-foreground">
                    Duración (min)
                    <Input
                      inputMode="numeric"
                      className="h-11 text-base sm:h-9 sm:text-sm"
                      placeholder="Hereda"
                      value={fila.duracion}
                      onChange={(evento) =>
                        actualizar(barbero.id, { duracion: evento.target.value })
                      }
                    />
                  </label>
                </div>
              )}
            </li>
          )
        })}
      </ul>

      <p aria-live="polite" className="text-xs text-muted-foreground">
        {incluidos === 0
          ? "Nadie lo ofrece: no aparecerá al reservar."
          : `Lo ofrecen ${incluidos} de ${barberos.length}.`}
      </p>

      {/* El botón vive aquí y también en el pie del panel: el pie lo ata por id
          para que no se salga de alcance en una lista larga. */}
      <Button type="submit" className="hidden" disabled={enviando}>
        {enviando && <Loader2 className="size-4 animate-spin" aria-hidden />}
        Guardar
      </Button>
    </form>
  )
}
