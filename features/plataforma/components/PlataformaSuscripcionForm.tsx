"use client"

import { Controller, useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { AlertTriangle } from "lucide-react"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldSet,
} from "@shared/components/ui/field"
import { Input } from "@shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select"
import { Switch } from "@shared/components/ui/switch"
import { useFormato } from "@shared/hooks/useFormato"
import { diaDeFacturacion, instanteDeFacturacion } from "@features/plataforma/utils/suscripciones"
import {
  esquemaFormularioSuscripcion,
  type DatosCorreccionSuscripcion,
  type DatosFormularioSuscripcion,
} from "@features/plataforma/schemas/plataforma.schema"
import type { PlanAdmin, SuscripcionPlataforma } from "@features/plataforma/types/plataforma.types"

/** El botón de envío vive en el pie del panel: se atan por este id. */
export const ID_FORM_SUSCRIPCION = "form-suscripcion"

interface PlataformaSuscripcionFormProps {
  suscripcion: SuscripcionPlataforma
  /** El catálogo COMPLETO: mover a un plan retirado está permitido, y a veces toca. */
  planes: PlanAdmin[]
  onSubmit: (datos: DatosCorreccionSuscripcion) => Promise<void>
}

/**
 * La corrección de soporte: CUATRO campos y ni uno más.
 *
 * `estado`, `canceladaEn`, `suspendidaEn`, `periodoActualDesde`, `graciaHasta` y
 * los identificadores de la pasarela no están aquí y no es un olvido: los
 * escribe el worker al consumir los webhooks del cobro. Son el registro de algo
 * que ya ocurrió, y reescribirlos a mano sería contarle a la base una historia
 * que el banco no confirmó.
 *
 * Cada campo lleva escrita su consecuencia, porque ninguna se adivina: mover de
 * plan no cobra, los días de gracia valen para el próximo impago y programar la
 * baja no corta el acceso.
 */
export function PlataformaSuscripcionForm({
  suscripcion,
  planes,
  onSubmit,
}: PlataformaSuscripcionFormProps) {
  const { fechaCorta } = useFormato()

  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosFormularioSuscripcion>({
    resolver: standardSchemaResolver(esquemaFormularioSuscripcion),
    defaultValues: {
      planCodigo: suscripcion.plan.codigo,
      vigenteHasta: diaDeFacturacion(suscripcion.vigenteHasta),
      graciaDias: suscripcion.graciaDias,
      cancelaAlFinPeriodo: suscripcion.cancelaAlFinPeriodo,
    },
  })

  const planElegido = watch("planCodigo")
  const cambiaDePlan = planElegido !== suscripcion.plan.codigo
  const planRetirado = planes.find((plan) => plan.codigo === planElegido)?.activo === false

  /**
   * El catálogo llega vacío cuando quien atiende no tiene `planes.gestionar`:
   * son dos capacidades distintas y una no arrastra a la otra. Entonces el
   * selector se queda con el plan vigente en vez de quedarse en blanco — mover
   * de plan no se puede sin el catálogo, pero corregir la vigencia sí.
   */
  const opciones =
    planes.length > 0
      ? planes.map((plan) => ({ clave: plan.id, codigo: plan.codigo, texto: plan.nombre }))
      : [
          {
            clave: suscripcion.plan.codigo,
            codigo: suscripcion.plan.codigo,
            texto: suscripcion.plan.nombre,
          },
        ]

  const enviar = (valores: DatosFormularioSuscripcion) =>
    onSubmit({
      planCodigo: valores.planCodigo,
      vigenteHasta: instanteDeFacturacion(valores.vigenteHasta),
      graciaDias: valores.graciaDias,
      cancelaAlFinPeriodo: valores.cancelaAlFinPeriodo,
    })

  return (
    <form
      id={ID_FORM_SUSCRIPCION}
      onSubmit={(e) => void handleSubmit(enviar)(e)}
      className="flex flex-col gap-8"
    >
      <FieldSet>
        <Controller
          control={control}
          name="planCodigo"
          render={({ field }) => (
            <Field data-invalid={!!errors.planCodigo}>
              <FieldLabel htmlFor="planCodigo">Plan</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="planCodigo" className="w-full">
                  <SelectValue placeholder="Elige un plan" />
                </SelectTrigger>
                <SelectContent>
                  {opciones.map((opcion) => (
                    <SelectItem key={opcion.clave} value={opcion.codigo}>
                      {opcion.texto}
                      {planes.find((plan) => plan.codigo === opcion.codigo)?.activo === false &&
                        " · retirado"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldDescription>
                Mover de plan <span className="font-medium text-foreground">no cobra</span> ni abre
                un período nuevo: abrirlo aquí duplicaría el cargo de quien ya pagó este mes.
              </FieldDescription>
              <FieldError errors={[errors.planCodigo]} />
            </Field>
          )}
        />

        {cambiaDePlan && (
          <Aviso>
            Si con el plan nuevo se pasa de sedes o de barberos, la cuenta se{" "}
            <span className="font-medium text-foreground">marca como «sobre el límite»</span>: no se
            rechaza el cambio ni se desactiva a nadie.
            {planRetirado &&
              " Este plan está retirado; se admite a propósito, para dejar a alguien en el que se le vendió."}
          </Aviso>
        )}
      </FieldSet>

      <FieldSet>
        <Field data-invalid={!!errors.vigenteHasta}>
          <FieldLabel htmlFor="vigenteHasta">Vigente hasta</FieldLabel>
          <Input
            id="vigenteHasta"
            type="date"
            aria-invalid={!!errors.vigenteHasta}
            {...register("vigenteHasta")}
          />
          <FieldDescription>
            {suscripcion.estado === "prueba"
              ? "En prueba corrige el fin de la prueba."
              : "Corrige el fin del período abierto."}{" "}
            Se admite una fecha pasada: soporte corrige vencimientos que debieron ocurrir. Hoy vence{" "}
            {suscripcion.vigenteHasta ? fechaCorta(suscripcion.vigenteHasta) : "sin fecha"}.
          </FieldDescription>
          <FieldError errors={[errors.vigenteHasta]} />
        </Field>

        <Field data-invalid={!!errors.graciaDias}>
          <FieldLabel htmlFor="graciaDias">Días de gracia</FieldLabel>
          <Input
            id="graciaDias"
            type="number"
            inputMode="numeric"
            min={0}
            max={90}
            aria-invalid={!!errors.graciaDias}
            {...register("graciaDias", { valueAsNumber: true })}
          />
          <FieldDescription>
            Cortesía tras un impago, de 0 a 90. Vale para el{" "}
            <span className="font-medium text-foreground">próximo</span>: no reabre uno en curso,
            porque la fecha de gracia se fija al entrar en mora.
          </FieldDescription>
          <FieldError errors={[errors.graciaDias]} />
        </Field>

        <Controller
          control={control}
          name="cancelaAlFinPeriodo"
          render={({ field }) => (
            <Field>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <FieldLabel htmlFor="cancelaAlFinPeriodo">Baja al fin del período</FieldLabel>
                  <FieldDescription className="mt-1">
                    Para el cliente que la pidió por teléfono.{" "}
                    <span className="font-medium text-foreground">No corta el acceso</span>: lo
                    pagado se disfruta hasta el vencimiento y la baja la ejecuta el worker al llegar
                    la fecha.
                  </FieldDescription>
                </div>
                <Switch
                  id="cancelaAlFinPeriodo"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-label="Baja al fin del período"
                />
              </div>
            </Field>
          )}
        />
      </FieldSet>
    </form>
  )
}

function Aviso({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2.5 text-xs text-muted-foreground">
      <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-(--advertencia)" aria-hidden />
      <span>{children}</span>
    </p>
  )
}
