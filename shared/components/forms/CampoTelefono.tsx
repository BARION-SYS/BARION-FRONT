"use client"

import { useMemo } from "react"
import { nombresDeRegion, regiones, type CodigoRegion } from "@config/regiones"
import { Input } from "@shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select"
import { cn } from "@shared/utils/cn"

interface CampoTelefonoProps {
  id: string
  /** El E.164 completo (`+573001112233`), que es lo que viaja a la api. */
  value: string
  onChange: (e164: string) => void
  onBlur?: () => void
  /**
   * País elegido en el formulario. Cambiarlo mueve el indicativo **solo si
   * quien escribe no lo ha tocado**: ver la nota de abajo.
   */
  paisSugerido?: CodigoRegion
  invalido?: boolean
  disabled?: boolean
}

/** Los indicativos que Barion maneja, derivados de las regiones. */
const PREFIJOS = Object.entries(regiones).map(([codigo, config]) => ({
  codigo: codigo as CodigoRegion,
  prefijo: config.prefijoTelefonico,
}))

/** El más largo primero: `+1` no puede ganarle a `+34` al partir la cadena. */
const PREFIJOS_POR_LARGO = [...PREFIJOS].sort(
  (uno, otro) => otro.prefijo.length - uno.prefijo.length
)

/**
 * Lo que el disparador enseña: **solo el indicativo**.
 *
 * El `Select` de este repo deriva la etiqueta del propio `SelectItem`, y ahí la
 * etiqueta es `+57 · Colombia` — que es lo correcto en la lista, donde hay que
 * saber qué se está eligiendo, y demasiado para un control que comparte fila con
 * el número: el país acababa recortado y el conjunto se leía apretado. `items`
 * explícito manda sobre lo derivado, que es justo para lo que existe.
 */
const ITEMS_DISPARADOR = PREFIJOS.map(({ prefijo }) => ({ value: prefijo, label: prefijo }))

/**
 * Teléfono en dos piezas: indicativo de una lista y número a secas.
 *
 * **Por qué no un solo campo.** La api exige E.164 y hace bien —un número sin
 * país no se puede marcar desde fuera—, pero nadie escribe su teléfono así:
 * escribe `3001112233`. Pedirlo entero llevaba al «El teléfono debe estar en
 * formato E.164 (+573001112233)», que no significa nada para quien acaba de
 * teclear su número de siempre, y que además obliga a saberse el indicativo.
 *
 * El componente **compone el E.164 hacia afuera**: el formulario sigue viendo un
 * `string` como antes y su esquema no cambia. Lo que cambia es lo que se teclea.
 *
 * ── El indicativo NO se ata al país de la barbería ──────────────────────────
 * Se sugiere desde él —lo normal es que coincidan— pero se puede cambiar: una
 * barbería que opera en España bien puede tener a su dueño con un móvil
 * colombiano, y forzarlo dejaría un teléfono al que nadie contesta.
 */
export function CampoTelefono({
  id,
  value,
  onChange,
  onBlur,
  paisSugerido,
  invalido,
  disabled,
}: CampoTelefonoProps) {
  const { prefijo, numero } = useMemo(() => partir(value, paisSugerido), [value, paisSugerido])

  return (
    // `text-base` en las dos piezas, y no es estética: **iOS hace zoom sobre
    // cualquier campo de texto por debajo de 16px al enfocarlo**, y este campo
    // vive en el escaparate y en el alta, que se abren desde un móvil. El zoom
    // deja la página desencuadrada y quien lo sufre no sabe cómo volver. El
    // indicativo lo lleva por lo mismo que lo lleva el número: dos controles
    // pegados con tamaños distintos se leen como un montaje.
    <div className={cn("flex gap-2.5", disabled && "opacity-60")}>
      <Select
        value={prefijo}
        items={ITEMS_DISPARADOR}
        onValueChange={(nuevo) => nuevo && onChange(`${nuevo}${numero}`)}
        disabled={disabled}
      >
        <SelectTrigger
          id={`${id}-prefijo`}
          className="h-11 w-[5.5rem] shrink-0 text-base"
          aria-label="Indicativo del país"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PREFIJOS.map(({ codigo, prefijo: valor }) => (
            <SelectItem key={codigo} value={valor}>
              {valor} · {nombresDeRegion[codigo]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        placeholder="300 111 2233"
        className="h-11 flex-1 text-base"
        aria-invalid={invalido}
        disabled={disabled}
        value={numero}
        // Solo dígitos: un número pegado desde la agenda del móvil llega con
        // espacios, guiones o paréntesis, y todos ellos rompen el E.164. Se
        // limpian aquí en vez de rechazarlos con un error.
        onChange={(evento) => onChange(`${prefijo}${evento.target.value.replace(/\D/g, "")}`)}
        onBlur={onBlur}
      />
    </div>
  )
}

/**
 * Parte un E.164 en indicativo y número.
 *
 * Sin valor todavía, el indicativo sale del país elegido en el formulario, que
 * es el acierto en la inmensa mayoría de los casos. Un valor que no empiece por
 * ninguno de los conocidos —pegado a mano, o de un país que Barion aún no
 * cubre— se deja íntegro en el número: recortarlo por la fuerza destruiría lo
 * que la persona escribió.
 */
function partir(e164: string, paisSugerido?: CodigoRegion): { prefijo: string; numero: string } {
  const porDefecto = regiones[paisSugerido ?? "CO"].prefijoTelefonico

  if (!e164) return { prefijo: porDefecto, numero: "" }

  const encontrado = PREFIJOS_POR_LARGO.find(({ prefijo }) => e164.startsWith(prefijo))
  return encontrado
    ? { prefijo: encontrado.prefijo, numero: e164.slice(encontrado.prefijo.length) }
    : { prefijo: porDefecto, numero: e164.replace(/\D/g, "") }
}
