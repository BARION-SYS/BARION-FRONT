"use client"

import { useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Infinity as InfinitySign } from "lucide-react"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@shared/components/ui/field"
import { Input } from "@shared/components/ui/input"
import { Switch } from "@shared/components/ui/switch"
import { useFormato } from "@shared/hooks/useFormato"
import { ETIQUETA_PERIODO, NOMBRE_PERIODO } from "@features/plataforma/constants/planes.copy"
import { RejillaTarifas } from "@features/plataforma/components/RejillaTarifas"
import { nombreDePais } from "@features/plataforma/utils/inventario"
import {
  clavesDeFunciones,
  clavesDeLimites,
  etiquetaFuncion,
  etiquetaLimite,
  paisesDelEditor,
  planDelFormulario,
  tarifasIntactas,
  valoresDelPlan,
} from "@features/plataforma/utils/planes"
import {
  esquemaFormularioPlan,
  type DatosFormularioPlan,
  type DatosPlanNuevo,
  type DatosTarifaPlan,
} from "@features/plataforma/schemas/plataforma.schema"
import type {
  PeriodoTarifa,
  PlanAdmin,
  PrecioPlanAdmin,
} from "@features/plataforma/types/plataforma.types"

/** El botón de envío vive en el pie del panel: se atan por este id. */
export const ID_FORM_PLAN = "form-plan"

interface PlataformaPlanFormProps {
  /** `null` es un alta. Con plan, una edición: el código queda bloqueado. */
  plan: PlanAdmin | null
  onSubmit: (datos: DatosPlanNuevo) => Promise<void>
}

/**
 * Alta y edición de un plan del catálogo.
 *
 * Tres cosas que la pantalla enseña porque el contrato no perdona esconderlas:
 *
 * - **El código no se edita y no hay borrado.** Es la clave con la que se
 *   contrata y con la que el sitio de venta identifica cada columna de su tabla
 *   de precios: renombrarlo los rompería a todos a la vez sin cambiar una fila
 *   de datos. Retirar un plan es apagarlo, y quien lo tenga contratado sigue
 *   exactamente igual.
 * - **Funciones y límites se reemplazan enteros.** Por eso se pintan TODAS las
 *   claves, encendidas y apagadas: lo que no viaje queda apagado, y una clave
 *   que el formulario no enseñara desaparecería en el primer guardado.
 * - **Las tarifas se mandan una por una y se ve cuáles.** El resumen del final
 *   no es decoración: con un upsert parcial, lo que no se manda sobrevive, y
 *   quien guarda tiene derecho a saber qué sobrevive.
 */
export function PlataformaPlanForm({ plan, onSubmit }: PlataformaPlanFormProps) {
  const paises = useMemo(() => paisesDelEditor(plan), [plan])
  const funciones = useMemo(() => clavesDeFunciones(plan), [plan])
  const limites = useMemo(() => clavesDeLimites(plan), [plan])

  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosFormularioPlan>({
    resolver: standardSchemaResolver(esquemaFormularioPlan),
    defaultValues: valoresDelPlan(plan, paises),
  })

  const valores = watch()
  // Lo que de verdad va a viajar, calculado con las mismas funciones que lo
  // arman: enseñar un resumen escrito aparte sería enseñar otra cosa.
  const aEnviar = planDelFormulario(valores, paises).precios
  const intactas = tarifasIntactas(plan, valores)

  return (
    <form
      id={ID_FORM_PLAN}
      onSubmit={(e) => void handleSubmit((datos) => onSubmit(planDelFormulario(datos, paises)))(e)}
      className="flex flex-col gap-8"
    >
      <FieldSet>
        <FieldLegend variant="label">Qué plan es</FieldLegend>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field data-invalid={!!errors.codigo}>
            <FieldLabel htmlFor="codigo">Código</FieldLabel>
            <Input
              id="codigo"
              placeholder="pro"
              disabled={plan !== null}
              aria-invalid={!!errors.codigo}
              {...register("codigo")}
            />
            <FieldDescription>
              {plan
                ? "No se puede cambiar: es con lo que se contrata y con lo que el sitio de venta identifica este plan."
                : "Con esto se contratará. Elígelo bien: después no se puede cambiar."}
            </FieldDescription>
            <FieldError errors={[errors.codigo]} />
          </Field>

          <Field data-invalid={!!errors.nombre}>
            <FieldLabel htmlFor="nombre">Nombre</FieldLabel>
            <Input
              id="nombre"
              placeholder="Profesional"
              aria-invalid={!!errors.nombre}
              {...register("nombre")}
            />
            <FieldDescription>El que se lee en el sitio y en el panel.</FieldDescription>
            <FieldError errors={[errors.nombre]} />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field data-invalid={!!errors.orden}>
            <FieldLabel htmlFor="orden">Orden</FieldLabel>
            <Input
              id="orden"
              type="number"
              inputMode="numeric"
              min={0}
              aria-invalid={!!errors.orden}
              {...register("orden", { valueAsNumber: true })}
            />
            <FieldDescription>De menor a mayor, como se listan.</FieldDescription>
            <FieldError errors={[errors.orden]} />
          </Field>

          <Controller
            control={control}
            name="activo"
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="activo">Publicado</FieldLabel>
                <div className="flex items-center gap-3 py-2">
                  <Switch
                    id="activo"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label="Publicado en el catálogo"
                  />
                  <span className="text-sm">{field.value ? "En el catálogo" : "Retirado"}</span>
                </div>
                <FieldDescription>
                  Retirarlo lo saca del catálogo y de lo contratable. No borra nada: las barberías
                  que ya lo tienen siguen igual.
                </FieldDescription>
              </Field>
            )}
          />
        </div>
      </FieldSet>

      <FieldSet>
        <FieldLegend variant="label">Qué incluye</FieldLegend>
        <FieldDescription>
          Se guardan todas: lo que quede apagado, queda apagado. De estas banderas depende qué
          módulo está encendido en el panel de la barbería.
        </FieldDescription>

        <div className="grid gap-3 sm:grid-cols-2">
          {funciones.map((clave) => (
            <Controller
              key={clave}
              control={control}
              name={`funciones.${clave}`}
              render={({ field }) => (
                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5">
                  <span className="text-sm">{etiquetaFuncion(clave)}</span>
                  <Switch
                    size="sm"
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                    aria-label={etiquetaFuncion(clave)}
                  />
                </label>
              )}
            />
          ))}
        </div>
      </FieldSet>

      <FieldSet>
        <FieldLegend variant="label">Hasta dónde llega</FieldLegend>
        <FieldDescription>
          Vacío es <span className="font-medium text-foreground">sin límite</span>, que no es lo
          mismo que cero.
        </FieldDescription>

        <div className="grid gap-5 sm:grid-cols-2">
          {limites.map((clave) => (
            <Field key={clave} data-invalid={!!errors.limites?.[clave]}>
              <FieldLabel htmlFor={`limite-${clave}`}>{etiquetaLimite(clave)}</FieldLabel>
              <div className="flex items-center gap-2">
                <Input
                  id={`limite-${clave}`}
                  inputMode="numeric"
                  placeholder="Sin límite"
                  aria-invalid={!!errors.limites?.[clave]}
                  {...register(`limites.${clave}`)}
                />
                {(valores.limites?.[clave] ?? "") === "" && (
                  <InfinitySign className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                )}
              </div>
              <FieldError errors={[errors.limites?.[clave]]} />
            </Field>
          ))}
        </div>
      </FieldSet>

      <FieldSet>
        <FieldLegend variant="label">Cuánto cuesta</FieldLegend>
        <RejillaTarifas paises={paises} control={control} errors={errors} />
      </FieldSet>

      <ResumenEnvio aEnviar={aEnviar} intactas={intactas} />
    </form>
  )
}

interface ResumenEnvioProps {
  aEnviar: DatosTarifaPlan[]
  intactas: PrecioPlanAdmin[]
}

/**
 * Qué tarifas lleva este envío y cuáles se quedan como están.
 *
 * No es un adorno: el guardado hace upsert por (país, período) y lo que no
 * viaja sobrevive. Sin esto, quien vació una celda creyendo que retiraba un
 * precio se iría convencido de haberlo hecho.
 */
function ResumenEnvio({ aEnviar, intactas }: ResumenEnvioProps) {
  const { dineroEn } = useFormato()

  return (
    <section className="flex flex-col gap-2 rounded-xl border border-dashed border-border px-4 py-4">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Lo que se va a guardar
      </p>

      {aEnviar.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Ninguna tarifa. Un plan publicado sin precio activo lo rechaza la API: el sitio de venta
          lo pintaría y rechazaría a quien lo eligiera.
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {aEnviar.map((tarifa) => (
            <li
              key={`${tarifa.codigoPais}-${tarifa.periodo}`}
              className="flex items-baseline justify-between gap-3 text-sm"
            >
              <span className="text-muted-foreground">
                {nombreDePais(tarifa.codigoPais)} · {NOMBRE_PERIODO[tarifa.periodo]}
              </span>
              <span className="tabular-nums">
                {dineroEn(Number(tarifa.montoCentavos), tarifa.moneda)}
                <span className="text-muted-foreground">{ETIQUETA_PERIODO[tarifa.periodo]}</span>
                {!tarifa.activo && <span className="ml-2 text-(--advertencia)">se retira</span>}
              </span>
            </li>
          ))}
        </ul>
      )}

      {intactas.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Se quedan como están{" "}
          {intactas
            .map(
              (precio) => `${nombreDePais(precio.codigoPais)} ${etiquetaPeriodo(precio.periodo)}`
            )
            .join(", ")}
          : dejar una celda vacía no retira nada. Para dejar de vender, apaga su interruptor.
        </p>
      )}
    </section>
  )
}

/** Un período que la API podría estrenar sin avisar se enseña con su código crudo. */
function etiquetaPeriodo(periodo: string): string {
  return NOMBRE_PERIODO[periodo as PeriodoTarifa]?.toLowerCase() ?? periodo
}
