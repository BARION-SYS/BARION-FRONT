"use client"

import type { CSSProperties } from "react"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import { SinDatos } from "@shared/components/feedback/SinDatos"
import { tokenDeColor } from "@shared/utils/color"
import { inicialesDe } from "@shared/utils/iniciales"
import type { ResumenNomina } from "@features/nomina/types/nomina.types"
import { participacionDe } from "@features/nomina/utils/periodo"
import { useFormato } from "@shared/hooks/useFormato"
import { useTextos } from "@shared/textos/useTextos"

interface DashboardBarberosCardProps {
  /**
   * Sale de `/ganancias/resumen`, que es TRANSACCIONAL y siempre está al día.
   * `/reportes/barberos` mide rendimiento y depende del job nocturno; para
   * "quién produjo cuánto" el ledger ya tiene la respuesta.
   */
  filas: ResumenNomina[]
  subtitulo: string
}

export function DashboardBarberosCard({ filas, subtitulo }: DashboardBarberosCardProps) {
  const t = useTextos("dashboard.barberos")
  const { dinero, numero } = useFormato()

  const totalProduccion = filas.reduce((suma, fila) => suma + Number(fila.produccionCentavos), 0)

  return (
    <SectionCard
      titulo={t("titulo")}
      accion={
        <span className="rounded-md bg-secondary px-2 py-1 text-[10px] text-muted-foreground">
          {subtitulo}
        </span>
      }
    >
      {filas.length === 0 ? (
        <SinDatos titulo={t("sinDatos")} alto={100} />
      ) : (
        <ul className="space-y-4">
          {filas.map((fila) => {
            const nombre = fila.barbero?.nombrePublico ?? t("retirado")
            const color = tokenDeColor(fila.barbero?.indiceColor ?? 0)
            const participacion = participacionDe(fila.produccionCentavos, String(totalProduccion))

            return (
              <li key={`${fila.barberoId}-${fila.moneda}`} className="flex items-center gap-3">
                <InitialsAvatar iniciales={inicialesDe(nombre)} color={color} />
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <div>
                      <p className="text-xs leading-none font-semibold text-foreground">{nombre}</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {t("citas", { cuantas: numero(fila.citas) })}
                      </p>
                    </div>
                    <p
                      className="text-xs font-bold text-(--tono) tabular-nums"
                      style={{ "--tono": color } as CSSProperties}
                    >
                      {dinero(Number(fila.produccionCentavos))}
                    </p>
                  </div>
                  <div
                    className="h-1.5 w-full overflow-hidden rounded-full bg-secondary"
                    role="progressbar"
                    aria-valuenow={Math.round(participacion)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={t("participacion", {
                      nombre: nombre,
                      porcentaje: Math.round(participacion),
                    })}
                  >
                    <div
                      className="h-full rounded-full bg-(--tono) transition-[width] duration-700 motion-reduce:transition-none"
                      style={{ "--tono": color, width: `${participacion}%` } as CSSProperties}
                    />
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </SectionCard>
  )
}
