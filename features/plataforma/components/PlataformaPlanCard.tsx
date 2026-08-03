"use client"

import { Check, Infinity as InfinitySign } from "lucide-react"
import { Badge } from "@shared/components/ui/badge"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { useFormato } from "@shared/hooks/useFormato"
import { ETIQUETA_PERIODO } from "@features/plataforma/constants/planes.copy"
import { nombreDePais } from "@features/plataforma/utils/inventario"
import { etiquetaFuncion, limitesDePlan } from "@features/plataforma/utils/planes"
import type { PlanPlataforma } from "@features/plataforma/types/plataforma.types"

interface PlataformaPlanCardProps {
  plan: PlanPlataforma
  /** Cuántas barberías lo tienen contratado hoy, contadas sobre el inventario. */
  contratado: number
}

/**
 * Un plan del catálogo: qué incluye, hasta dónde llega y cuánto cuesta en cada
 * país.
 *
 * El catálogo es de SOLO LECTURA a propósito: la API todavía no publica un CRUD
 * de planes, así que ofrecer aquí un botón de editar sería prometer una
 * administración que no existe. Lo que sí aporta es dejar de tener que abrir la
 * base para saber qué se está vendiendo.
 */
export function PlataformaPlanCard({ plan, contratado }: PlataformaPlanCardProps) {
  const { dineroEn, numero } = useFormato()
  const limites = limitesDePlan(plan)

  return (
    <SectionCard
      titulo={plan.nombre}
      subtitulo={`Código: ${plan.codigo}`}
      className="h-full"
      accion={
        <Badge variant="secondary" className="tabular-nums">
          {numero(contratado)} {contratado === 1 ? "barbería" : "barberías"}
        </Badge>
      }
    >
      <div className="flex flex-col gap-5">
        <div>
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Precio por país
          </p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {plan.precios.length === 0 && (
              <li className="text-sm text-muted-foreground">
                Sin precio publicado. Se acuerda fuera del sistema.
              </li>
            )}
            {plan.precios.map((precio) => (
              <li
                key={`${precio.codigoPais}-${precio.periodo}`}
                className="flex items-baseline justify-between gap-3 border-b border-border/60 pb-1.5 last:border-0"
              >
                <span className="text-sm text-muted-foreground">
                  {nombreDePais(precio.codigoPais)}
                </span>
                <span className="text-sm font-semibold tabular-nums">
                  {dineroEn(Number(precio.montoCentavos), precio.moneda)}
                  <span className="font-normal text-muted-foreground">
                    {ETIQUETA_PERIODO[precio.periodo] ?? ` / ${precio.periodo}`}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Límites
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {limites.map((limite) => (
              <li
                key={limite.clave}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary/40 px-2.5 py-1 text-xs"
              >
                <span className="text-muted-foreground">{limite.etiqueta}</span>
                {/* `null` es «sin techo», no cero: son cosas distintas. */}
                {limite.valor === null ? (
                  <InfinitySign className="size-3.5" aria-label="Sin límite" />
                ) : (
                  <span className="font-semibold tabular-nums">{numero(limite.valor)}</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Incluye
          </p>
          <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {plan.funciones.map((funcion) => (
              <li key={funcion} className="flex items-center gap-1.5 text-sm">
                <Check className="size-3.5 shrink-0 text-(--exito)" aria-hidden />
                {etiquetaFuncion(funcion)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionCard>
  )
}
