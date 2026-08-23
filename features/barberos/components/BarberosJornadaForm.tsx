"use client"

import { useState } from "react"
import { Loader2, Plus, X } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Input } from "@shared/components/ui/input"
import { Label } from "@shared/components/ui/label"
import { Switch } from "@shared/components/ui/switch"
import { MAX_TRAMOS_POR_DIA, NOMBRE_DIA, diasOrdenados } from "@features/barberos/constants/dias"
import type { JornadaSemanal } from "@features/barberos/types/barberos.types"
import { useTextos } from "@shared/textos/useTextos"

interface TramoEditable {
  inicio: string
  fin: string
}

interface BarberosJornadaFormProps {
  jornada: JornadaSemanal | null
  cargando?: boolean
  soloLectura?: boolean
  onSubmit: (tramos: { diaSemana: number; inicio: string; fin: string }[]) => Promise<void>
}

const TRAMO_NUEVO: TramoEditable = { inicio: "09:00", fin: "18:00" }

/**
 * Cuándo atiende el barbero.
 *
 * No es el horario de la sede: la sede declara cuándo abre al público, esto dice
 * cuándo está esta persona. Los cupos salen de cruzar los dos, así que una
 * jornada que se salga del horario de la sede no es un error — simplemente no
 * genera cupos ahí.
 *
 * Se envía la semana entera y no las diferencias: es lo único que permite quitar
 * un tramo. Un día sin tramos es un día que no trabaja.
 */
export function BarberosJornadaForm({
  jornada,
  cargando,
  soloLectura,
  onSubmit,
}: BarberosJornadaFormProps) {
  const t = useTextos("barberos")
  const [semana, setSemana] = useState<Map<number, TramoEditable[]>>(() => aSemana(jornada))

  const dias = diasOrdenados()

  const cambiarDia = (dia: number, tramos: TramoEditable[]) =>
    setSemana((previa) => new Map(previa).set(dia, tramos))

  const alternarTrabaja = (dia: number, trabaja: boolean) =>
    cambiarDia(dia, trabaja ? [{ ...TRAMO_NUEVO }] : [])

  const editarTramo = (dia: number, indice: number, cambios: Partial<TramoEditable>) =>
    cambiarDia(
      dia,
      (semana.get(dia) ?? []).map((tramo, i) => (i === indice ? { ...tramo, ...cambios } : tramo))
    )

  const quitarTramo = (dia: number, indice: number) =>
    cambiarDia(
      dia,
      (semana.get(dia) ?? []).filter((_, i) => i !== indice)
    )

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        const tramos = dias.flatMap((dia) =>
          (semana.get(dia) ?? []).map((tramo) => ({ diaSemana: dia, ...tramo }))
        )
        void onSubmit(tramos)
      }}
    >
      <p className="text-xs text-muted-foreground">
        Horas en la zona de su sede. Un día sin tramos es un día que no trabaja.
      </p>

      <ul className="flex max-h-[50vh] flex-col gap-1 overflow-y-auto pr-1">
        {dias.map((dia) => {
          const tramos = semana.get(dia) ?? []
          const trabaja = tramos.length > 0
          return (
            <li
              key={dia}
              className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border py-2.5 last:border-b-0"
            >
              <Label
                htmlFor={`trabaja-${dia}`}
                className="w-24 cursor-pointer text-sm font-medium text-foreground"
              >
                {NOMBRE_DIA[dia]}
              </Label>
              <Switch
                id={`trabaja-${dia}`}
                checked={trabaja}
                disabled={soloLectura}
                onCheckedChange={(valor) => alternarTrabaja(dia, valor)}
              />

              {!trabaja && <span className="text-xs text-muted-foreground">{t("descansa")}</span>}

              {trabaja && (
                <div className="ml-auto flex flex-col gap-1.5">
                  {tramos.map((tramo, indice) => (
                    <div key={indice} className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={tramo.inicio}
                        disabled={soloLectura}
                        onChange={(e) => editarTramo(dia, indice, { inicio: e.target.value })}
                        aria-label={`Entrada del ${NOMBRE_DIA[dia]}, tramo ${indice + 1}`}
                        className="w-fit text-xs"
                      />
                      <span className="text-xs text-muted-foreground" aria-hidden>
                        —
                      </span>
                      <Input
                        type="time"
                        value={tramo.fin}
                        disabled={soloLectura}
                        onChange={(e) => editarTramo(dia, indice, { fin: e.target.value })}
                        aria-label={`Salida del ${NOMBRE_DIA[dia]}, tramo ${indice + 1}`}
                        className="w-fit text-xs"
                      />
                      {!soloLectura && tramos.length > 1 && (
                        <button
                          type="button"
                          onClick={() => quitarTramo(dia, indice)}
                          className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                          <X className="size-3.5" aria-hidden />
                          <span className="sr-only">
                            Quitar el tramo {indice + 1} del {NOMBRE_DIA[dia]}
                          </span>
                        </button>
                      )}
                    </div>
                  ))}

                  {!soloLectura && tramos.length < MAX_TRAMOS_POR_DIA && (
                    <button
                      type="button"
                      onClick={() => cambiarDia(dia, [...tramos, { ...TRAMO_NUEVO }])}
                      className="inline-flex items-center gap-1 self-end text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Plus className="size-3" aria-hidden />
                      Añadir tramo
                    </button>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ul>

      {!soloLectura && (
        <Button type="submit" disabled={cargando} className="h-10">
          {cargando && <Loader2 className="size-4 animate-spin" aria-hidden />}
          Guardar jornada
        </Button>
      )}
    </form>
  )
}

/** Los tramos de la API, agrupados por día para poder editarlos. */
function aSemana(jornada: JornadaSemanal | null): Map<number, TramoEditable[]> {
  const semana = new Map<number, TramoEditable[]>()
  for (const tramo of jornada?.tramos ?? []) {
    semana.set(tramo.diaSemana, [
      ...(semana.get(tramo.diaSemana) ?? []),
      { inicio: tramo.inicio, fin: tramo.fin },
    ])
  }
  return semana
}
