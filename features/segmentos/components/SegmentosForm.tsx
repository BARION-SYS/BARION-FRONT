"use client"

import { Controller, useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Checkbox } from "@shared/components/ui/checkbox"
import { Field, FieldError, FieldLabel } from "@shared/components/ui/field"
import { Input } from "@shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select"
import { Textarea } from "@shared/components/ui/textarea"
import { useFormato } from "@shared/hooks/useFormato"
import { CRITERIOS, definicionDe, valorDelCriterio } from "@features/segmentos/constants/criterios"
import { textoCriterio } from "@features/segmentos/utils/textoCriterio"
import { useTextos } from "@shared/textos/useTextos"
import { esquemaSegmento, type DatosSegmento } from "@features/segmentos/schemas/segmentos.schema"
import type { Segmento } from "@features/segmentos/types/segmentos.types"

interface SegmentosFormProps {
  /** Sin segmento = alta. Con segmento = edición. */
  segmento?: Segmento | null
  onSubmit: (datos: DatosSegmento) => Promise<void>
}

export const ID_FORM_SEGMENTO = "form-segmento"

const TITULO_GRUPO =
  "text-[10px] font-semibold tracking-[0.14em] text-muted-foreground/80 uppercase"

/**
 * Alta y edición de una etiqueta.
 *
 * ── El tipo se elige una vez y no se vuelve a tocar ─────────────────────────
 * Es la decisión que ordena el resto del formulario: una etiqueta que se rehace
 * sola cada noche, o una que mantiene el equipo a mano. La api no admite
 * cambiarlo después, y hace bien — cambiarlo dejaría los miembros que ya tiene
 * sin nadie que los mantenga, y un segmento a medio llenar se sigue pintando
 * junto al cliente como si significara algo. Al editar se enseña, deshabilitado:
 * esconderlo haría que la pantalla de edición pareciera otra cosa.
 *
 * ── El dinero se teclea en pesos y viaja en centavos ────────────────────────
 * De los seis criterios solo uno lleva importe, y va marcado en la tabla en vez
 * de deducirse del nombre del parámetro. La conversión la hace la pantalla
 * porque es la que sabe en qué moneda cobra la sede; el service no tiene ese
 * contexto. Es la misma confusión que un día enseñó todo el panel multiplicado
 * por cien.
 */
export function SegmentosForm({ segmento, onSubmit }: SegmentosFormProps) {
  const editando = Boolean(segmento)
  const t = useTextos("segmentos.form")
  const tCriterios = useTextos("segmentos.criterios")
  const { aCentavos, deCentavos, moneda } = useFormato()

  const criterioGuardado = String(segmento?.criterio?.tipo ?? "")
  const definicionGuardada = definicionDe(criterioGuardado)
  const valorGuardado = segmento ? valorDelCriterio(segmento.criterio) : undefined

  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosSegmento>({
    resolver: standardSchemaResolver(esquemaSegmento),
    defaultValues: {
      nombre: segmento?.nombre ?? "",
      descripcion: segmento?.descripcion ?? undefined,
      tipo: segmento?.tipo ?? "dinamico",
      criterioTipo: criterioGuardado || "inactivos",
      criterioValor:
        valorGuardado === undefined
          ? ""
          : String(definicionGuardada?.esDinero ? deCentavos(valorGuardado) : valorGuardado),
      esEtiqueta: segmento?.esEtiqueta ?? true,
      prioridad: String(segmento?.prioridad ?? 0),
    },
  })

  const tipo = watch("tipo")
  const criterioTipo = watch("criterioTipo")
  const definicion = definicionDe(criterioTipo ?? "")
  const texto = definicion ? textoCriterio(tCriterios, definicion.tipo) : null

  // El importe se convierte aquí, no en el service: la moneda es de la sede y
  // eso solo lo sabe la capa que tiene contexto de React.
  const enviar = async (datos: DatosSegmento): Promise<void> => {
    const enCentavos =
      definicion?.esDinero && datos.criterioValor
        ? aCentavos(Number(datos.criterioValor))
        : datos.criterioValor
    await onSubmit({ ...datos, criterioValor: enCentavos })
  }

  return (
    <form
      id={ID_FORM_SEGMENTO}
      onSubmit={(e) => void handleSubmit(enviar)(e)}
      className="flex flex-col gap-5"
    >
      <fieldset className="flex flex-col gap-3">
        <legend className={TITULO_GRUPO}>{t("grupoNombre")}</legend>

        <Field data-invalid={!!errors.nombre}>
          <FieldLabel htmlFor="nombre">{t("nombre")}</FieldLabel>
          <Input id="nombre" placeholder={t("nombreEjemplo")} {...register("nombre")} />
          <p className="text-xs text-muted-foreground">{t("nombreAyuda")}</p>
          <FieldError errors={[errors.nombre]} />
        </Field>

        <Field data-invalid={!!errors.descripcion}>
          <FieldLabel htmlFor="descripcion">{t("descripcion")}</FieldLabel>
          <Textarea
            id="descripcion"
            rows={2}
            placeholder={t("descripcionEjemplo")}
            {...register("descripcion")}
          />
          <p className="text-xs text-muted-foreground">{t("descripcionAyuda")}</p>
          <FieldError errors={[errors.descripcion]} />
        </Field>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className={TITULO_GRUPO}>{t("grupoQuienEntra")}</legend>

        <Field>
          <FieldLabel htmlFor="tipo">{t("comoSeLlena")}</FieldLabel>
          <Controller
            control={control}
            name="tipo"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={editando}>
                <SelectTrigger id="tipo" aria-label={t("comoSeLlena")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dinamico">{t("sola")}</SelectItem>
                  <SelectItem value="estatico">{t("aMano")}</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <p className="text-xs text-muted-foreground">
            {editando ? t("tipoFijoEdicion") : t("tipoFijoAlta")}
          </p>
        </Field>

        {tipo === "dinamico" ? (
          <>
            <Field>
              <FieldLabel htmlFor="criterioTipo">{t("regla")}</FieldLabel>
              <Controller
                control={control}
                name="criterioTipo"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="criterioTipo" aria-label={t("regla")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CRITERIOS.map((criterio) => (
                        <SelectItem key={criterio.tipo} value={criterio.tipo}>
                          {textoCriterio(tCriterios, criterio.tipo).etiqueta}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {texto && <p className="text-xs text-muted-foreground">{texto.ayuda}</p>}
            </Field>

            {definicion?.parametro && (
              <Field data-invalid={!!errors.criterioValor}>
                <FieldLabel htmlFor="criterioValor">
                  {texto?.parametro}
                  {definicion.esDinero ? ` (${moneda})` : ""}
                </FieldLabel>
                <Input
                  id="criterioValor"
                  inputMode="numeric"
                  placeholder={String(
                    definicion.esDinero ? deCentavos(definicion.porDefecto) : definicion.porDefecto
                  )}
                  {...register("criterioValor")}
                />
                <p className="text-xs text-muted-foreground">
                  {t("porDefecto", {
                    valor: String(
                      definicion.esDinero
                        ? deCentavos(definicion.porDefecto)
                        : definicion.porDefecto
                    ),
                  })}
                </p>
                <FieldError errors={[errors.criterioValor]} />
              </Field>
            )}
          </>
        ) : (
          <p className="rounded-xl border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
            {t("avisoManual")}
          </p>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className={TITULO_GRUPO}>{t("grupoDondeSeVe")}</legend>

        <Controller
          control={control}
          name="esEtiqueta"
          render={({ field }) => (
            <label className="flex items-start gap-3 text-sm">
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                aria-label={t("esEtiqueta")}
              />
              <span>
                {t("esEtiqueta")}
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {t("esEtiquetaAyuda")}
                </span>
              </span>
            </label>
          )}
        />

        <Field data-invalid={!!errors.prioridad}>
          <FieldLabel htmlFor="prioridad">{t("prioridad")}</FieldLabel>
          <Input id="prioridad" inputMode="numeric" {...register("prioridad")} />
          <p className="text-xs text-muted-foreground">{t("prioridadAyuda")}</p>
          <FieldError errors={[errors.prioridad]} />
        </Field>
      </fieldset>
    </form>
  )
}
