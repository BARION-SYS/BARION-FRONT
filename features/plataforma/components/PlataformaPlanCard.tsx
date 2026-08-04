"use client"

import { Check, Infinity as InfinitySign, Minus, Pencil } from "lucide-react"
import { Badge } from "@shared/components/ui/badge"
import { Button } from "@shared/components/ui/button"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import { useFormato } from "@shared/hooks/useFormato"
import { ETIQUETA_PERIODO, NOMBRE_PERIODO } from "@features/plataforma/constants/planes.copy"
import { nombreDePais } from "@features/plataforma/utils/inventario"
import { etiquetaFuncion, etiquetaLimite } from "@features/plataforma/utils/planes"
import type {
  PeriodoTarifa,
  PlanAdmin,
  PrecioPlanAdmin,
} from "@features/plataforma/types/plataforma.types"

interface PlataformaPlanCardProps {
  plan: PlanAdmin
  /** Cuántas barberías lo tienen contratado hoy, contadas sobre el inventario. */
  contratado: number
  /** Sin `plataforma.planes.gestionar` el catálogo se consulta, no se toca. */
  gestiona: boolean
  onEditar: (plan: PlanAdmin) => void
}

/**
 * Un plan del catálogo INTERNO: qué incluye, hasta dónde llega, cuánto cuesta en
 * cada mercado y en qué estado está.
 *
 * Enseña lo que EXISTE y no lo que se vende: las funciones apagadas, los planes
 * retirados y las tarifas que ya no se ofrecen. Quien administra necesita ver lo
 * apagado para poder encenderlo — el catálogo público ya publica lo otro.
 *
 * **No hay botón de borrar y no falta**: retirar es `activo: false`, que lo saca
 * del catálogo dejando exactamente igual a quien ya lo tiene contratado. La API
 * no publica un `DELETE` porque el código es la clave con la que se contrata.
 */
export function PlataformaPlanCard({
  plan,
  contratado,
  gestiona,
  onEditar,
}: PlataformaPlanCardProps) {
  const { numero } = useFormato()
  const limites = Object.entries(plan.limites)
  const funciones = Object.entries(plan.funciones)

  return (
    <SectionCard
      titulo={plan.nombre}
      subtitulo={`Código: ${plan.codigo} · orden ${numero(plan.orden)}`}
      className="h-full"
      accion={
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="tabular-nums">
            {numero(contratado)} {contratado === 1 ? "barbería" : "barberías"}
          </Badge>
          {gestiona && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditar(plan)}
              aria-label={`Editar ${plan.nombre}`}
            >
              <Pencil className="size-3.5" aria-hidden />
              Editar
            </Button>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <div>
          <StatusBadge
            tono={plan.activo ? "exito" : "neutro"}
            etiqueta={plan.activo ? "En el catálogo" : "Retirado"}
          />
          {!plan.activo && (
            <p className="mt-2 text-xs text-muted-foreground">
              No se puede contratar. Las barberías que ya lo tienen siguen igual.
            </p>
          )}
        </div>

        <TarifasDelPlan precios={plan.precios} />

        <div>
          <Rotulo>Límites</Rotulo>
          <ul className="mt-2 flex flex-wrap gap-2">
            {limites.length === 0 && <SinClaves>Sin topes declarados</SinClaves>}
            {limites.map(([clave, valor]) => (
              <li
                key={clave}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary/40 px-2.5 py-1 text-xs"
              >
                <span className="text-muted-foreground">{etiquetaLimite(clave)}</span>
                {/* `null` es «sin techo», no cero: son cosas distintas. */}
                {valor === null ? (
                  <InfinitySign className="size-3.5" aria-label="Sin límite" />
                ) : (
                  <span className="font-semibold tabular-nums">{numero(valor)}</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <Rotulo>Funciones</Rotulo>
          <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {funciones.length === 0 && <SinClaves>Sin banderas declaradas</SinClaves>}
            {funciones.map(([clave, encendida]) => (
              <li
                key={clave}
                className={
                  encendida
                    ? "flex items-center gap-1.5 text-sm"
                    : "flex items-center gap-1.5 text-sm text-muted-foreground line-through"
                }
              >
                {encendida ? (
                  <Check className="size-3.5 shrink-0 text-(--exito)" aria-hidden />
                ) : (
                  <Minus className="size-3.5 shrink-0" aria-hidden />
                )}
                {etiquetaFuncion(clave)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionCard>
  )
}

/**
 * El precio por mercado y período.
 *
 * Se agrupa por país porque es como se decide un precio, y **un período sin
 * tarifa se dice, no se calcula**: el semestral y el anual llevan el descuento
 * que alguien pactó, y deducirlos del mensual publicaría una cifra que nadie
 * acordó.
 */
function TarifasDelPlan({ precios }: { precios: PrecioPlanAdmin[] }) {
  const { dineroEn } = useFormato()
  const paises = [...new Set(precios.map((precio) => precio.codigoPais))]

  if (precios.length === 0) {
    return (
      <div>
        <Rotulo>Precio por mercado</Rotulo>
        <p className="mt-2 text-sm text-muted-foreground">
          Sin ninguna tarifa. Así no se puede contratar en ningún país.
        </p>
      </div>
    )
  }

  return (
    <div>
      <Rotulo>Precio por mercado</Rotulo>
      <ul className="mt-2 flex flex-col gap-2">
        {paises.map((codigoPais) => {
          const delPais = precios.filter((precio) => precio.codigoPais === codigoPais)
          return (
            <li key={codigoPais} className="border-b border-border/60 pb-2 last:border-0">
              <p className="text-xs text-muted-foreground">{nombreDePais(codigoPais)}</p>
              <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                {delPais.map((precio) => (
                  <li key={precio.periodo} className="text-sm">
                    <span className="font-semibold tabular-nums">
                      {dineroEn(Number(precio.montoCentavos), precio.moneda)}
                    </span>
                    <span className="text-muted-foreground">
                      {ETIQUETA_PERIODO[precio.periodo] ?? ` / ${precio.periodo}`}
                    </span>
                    {!precio.activo && (
                      <span className="ml-1 text-xs text-(--advertencia)">retirada</span>
                    )}
                  </li>
                ))}
              </ul>
              <PeriodosSinTarifa periodos={delPais.map((precio) => precio.periodo)} />
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** Lo que NO se vende en ese mercado, dicho en vez de omitido. */
function PeriodosSinTarifa({ periodos }: { periodos: string[] }) {
  const faltan = (Object.keys(NOMBRE_PERIODO) as PeriodoTarifa[]).filter(
    (periodo) => !periodos.includes(periodo)
  )
  if (faltan.length === 0) return null

  return (
    <p className="mt-1 text-[11px] text-muted-foreground">
      Sin tarifa {faltan.map((periodo) => NOMBRE_PERIODO[periodo].toLowerCase()).join(" ni ")}
    </p>
  )
}

function Rotulo({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
      {children}
    </p>
  )
}

function SinClaves({ children }: { children: React.ReactNode }) {
  return <li className="text-sm text-muted-foreground">{children}</li>
}
