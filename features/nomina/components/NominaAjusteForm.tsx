"use client"

import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Field, FieldDescription, FieldError, FieldLabel } from "@shared/components/ui/field"
import { Input } from "@shared/components/ui/input"
import { Textarea } from "@shared/components/ui/textarea"
import { useFormato } from "@shared/hooks/useFormato"
import { useTextos } from "@shared/textos/useTextos"
import {
  esquemaAjuste,
  type DatosAjuste,
  type EntradaAjuste,
} from "@features/nomina/schemas/nomina.schema"

interface NominaAjusteFormProps {
  /** A quién se le ajusta. Viene fijado desde su fila: aquí no se elige. */
  barberoId: string
  nombre: string
  onSubmit: (datos: DatosAjuste) => void
}

export const ID_FORM_AJUSTE = "form-ajuste-nomina"

/**
 * Corregir la nómina de alguien.
 *
 * ── Lo que hay que entender antes de guardar ────────────────────────────────
 * **No corrige nada: suma.** El ledger es inmutable por trigger —de cada asiento
 * cuelga una cita liquidada con su precio congelado—, así que arreglar una
 * propina mal tecleada o pagar un festivo pactado aparte es **añadir una fila**.
 * Y el error de un ajuste se arregla con otro ajuste: no hay deshacer.
 *
 * Por eso el motivo es obligatorio. Sin él, dentro de tres meses es un número
 * en la nómina de alguien que nadie sabe defender cuando lo pregunten — y
 * preguntan, porque es dinero.
 *
 * ── La fecha, que es lo que más se escapa ───────────────────────────────────
 * Vacía significa hoy, y casi siempre está bien. Pero una corrección de la
 * quincena pasada tiene que CAER en la quincena pasada: puesta en hoy, el
 * resumen de aquel rango sigue dando el número equivocado y el de este empieza
 * a dar otro que tampoco es. Se dice en pantalla porque nadie lo deduce.
 */
export function NominaAjusteForm({ barberoId, nombre, onSubmit }: NominaAjusteFormProps) {
  const t = useTextos("nomina.ajuste")
  const { moneda } = useFormato()

  const {
    register,
    handleSubmit,
    formState: { errors },
    // Lo tecleado y lo validado ya no son el mismo tipo: la fecha vacía se
    // convierte en ausencia al validar, así que el formulario declara los dos.
  } = useForm<EntradaAjuste, unknown, DatosAjuste>({
    resolver: standardSchemaResolver(esquemaAjuste),
    defaultValues: { barberoId, monto: "", motivo: "", ganadoEn: "" },
  })

  return (
    <form id={ID_FORM_AJUSTE} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <input type="hidden" {...register("barberoId")} />

      <p className="rounded-lg border border-border bg-secondary/40 p-3 text-sm text-muted-foreground">
        Se añade un asiento a la nómina de{" "}
        <span className="font-medium text-foreground">{nombre}</span>. No modifica lo ya liquidado:
        lo suma. Una vez guardado, el único arreglo es otro ajuste.
      </p>

      <Field data-invalid={!!errors.monto}>
        <FieldLabel htmlFor="monto">Monto ({moneda})</FieldLabel>
        <Input
          id="monto"
          inputMode="text"
          placeholder="-15000"
          aria-invalid={!!errors.monto}
          {...register("monto")}
        />
        <FieldDescription>
          Con signo: <span className="font-medium text-foreground">negativo descuenta</span>.
        </FieldDescription>
        <FieldError errors={[errors.monto]} />
      </Field>

      <Field data-invalid={!!errors.motivo}>
        <FieldLabel htmlFor="motivo">{t("motivo")}</FieldLabel>
        <Textarea
          id="motivo"
          rows={3}
          placeholder={t("motivoEjemplo")}
          aria-invalid={!!errors.motivo}
          {...register("motivo")}
        />
        <FieldDescription>
          Queda congelado en el asiento. Es lo que se lee cuando alguien pregunte por esta cifra.
        </FieldDescription>
        <FieldError errors={[errors.motivo]} />
      </Field>

      <Field data-invalid={!!errors.ganadoEn}>
        <FieldLabel htmlFor="ganadoEn">{t("fecha")}</FieldLabel>
        <Input
          id="ganadoEn"
          type="date"
          aria-invalid={!!errors.ganadoEn}
          {...register("ganadoEn")}
        />
        <FieldDescription>
          Vacío es hoy. Ponla solo si corrige un período ya cerrado: en hoy, aquel resumen seguiría
          dando el número equivocado.
        </FieldDescription>
        <FieldError errors={[errors.ganadoEn]} />
      </Field>
    </form>
  )
}
