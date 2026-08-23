"use client"

import { useState } from "react"
import { Loader2, Plus, X } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Input } from "@shared/components/ui/input"
import { Label } from "@shared/components/ui/label"
import { Switch } from "@shared/components/ui/switch"
import { MAX_TRAMOS_POR_DIA, NOMBRE_DIA, diasOrdenados } from "@features/sedes/constants/dias"
import type { HorarioSemanal, Sede } from "@features/sedes/types/sedes.types"
import { useTextos } from "@shared/textos/useTextos"

interface TramoEditable {
  abre: string
  cierra: string
}

interface SedesHorarioFormProps {
  sede: Sede
  horario: HorarioSemanal | null
  cargando?: boolean
  /** Sin `sedes.gestionar` el horario se consulta, no se edita. */
  soloLectura?: boolean
  onSubmit: (tramos: { diaSemana: number; abre: string; cierra: string }[]) => Promise<void>
}

const TRAMO_NUEVO: TramoEditable = { abre: "09:00", cierra: "18:00" }

/**
 * El horario COMERCIAL de la sede: lo que el portal publica y lo que responde
 * "abierto ahora". No son las jornadas de los barberos — un barbero que atienda
 * el domingo por su cuenta no abre la sede el domingo.
 *
 * Se envía la semana entera y no las diferencias: es lo único que permite quitar
 * un tramo. Por eso el formulario mantiene los siete días en estado, y un día
 * sin tramos es un día cerrado.
 */
export function SedesHorarioForm({
  sede,
  horario,
  cargando,
  soloLectura,
  onSubmit,
}: SedesHorarioFormProps) {
  const t = useTextos("sedes")
  const [semana, setSemana] = useState<Map<number, TramoEditable[]>>(() => aSemana(horario))

  const dias = diasOrdenados(sede.inicioSemana)

  const cambiarDia = (dia: number, tramos: TramoEditable[]) => {
    setSemana((previa) => new Map(previa).set(dia, tramos))
  }

  const alternarAbierto = (dia: number, abierto: boolean) => {
    cambiarDia(dia, abierto ? [{ ...TRAMO_NUEVO }] : [])
  }

  const editarTramo = (dia: number, indice: number, cambios: Partial<TramoEditable>) => {
    const tramos = (semana.get(dia) ?? []).map((tramo, i) =>
      i === indice ? { ...tramo, ...cambios } : tramo
    )
    cambiarDia(dia, tramos)
  }

  const anadirTramo = (dia: number) => {
    cambiarDia(dia, [...(semana.get(dia) ?? []), { ...TRAMO_NUEVO }])
  }

  const quitarTramo = (dia: number, indice: number) => {
    cambiarDia(
      dia,
      (semana.get(dia) ?? []).filter((_, i) => i !== indice)
    )
  }

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
        Horas en la zona de la sede (<strong>{horario?.zonaHoraria ?? sede.zonaHoraria}</strong>).
        Un día sin tramos es un día cerrado.
      </p>

      <ul className="flex max-h-[50vh] flex-col gap-1 overflow-y-auto pr-1">
        {dias.map((dia) => {
          const tramos = semana.get(dia) ?? []
          const abierto = tramos.length > 0
          return (
            <li
              key={dia}
              className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border py-2.5 last:border-b-0"
            >
              <Label
                htmlFor={`abierto-${dia}`}
                className="w-24 cursor-pointer text-sm font-medium text-foreground"
              >
                {NOMBRE_DIA[dia]}
              </Label>
              <Switch
                id={`abierto-${dia}`}
                checked={abierto}
                onCheckedChange={(valor) => alternarAbierto(dia, valor)}
                disabled={soloLectura}
              />

              {!abierto && <span className="text-xs text-muted-foreground">{t("cerrado")}</span>}

              {abierto && (
                <div className="ml-auto flex flex-col gap-1.5">
                  {tramos.map((tramo, indice) => (
                    <div key={indice} className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={tramo.abre}
                        onChange={(e) => editarTramo(dia, indice, { abre: e.target.value })}
                        disabled={soloLectura}
                        aria-label={`Apertura del ${NOMBRE_DIA[dia]}, tramo ${indice + 1}`}
                        className="w-fit text-xs"
                      />
                      <span className="text-xs text-muted-foreground" aria-hidden>
                        —
                      </span>
                      <Input
                        type="time"
                        value={tramo.cierra}
                        onChange={(e) => editarTramo(dia, indice, { cierra: e.target.value })}
                        disabled={soloLectura}
                        aria-label={`Cierre del ${NOMBRE_DIA[dia]}, tramo ${indice + 1}`}
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
                      onClick={() => anadirTramo(dia)}
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
          Guardar horario
        </Button>
      )}
    </form>
  )
}

/** Los tramos de la API, agrupados por día para poder editarlos. */
function aSemana(horario: HorarioSemanal | null): Map<number, TramoEditable[]> {
  const semana = new Map<number, TramoEditable[]>()
  for (const tramo of horario?.tramos ?? []) {
    const tramos = semana.get(tramo.diaSemana) ?? []
    tramos.push({ abre: tramo.abre, cierra: tramo.cierra })
    semana.set(tramo.diaSemana, tramos)
  }
  return semana
}
