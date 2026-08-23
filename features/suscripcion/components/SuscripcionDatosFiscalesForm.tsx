"use client"

import { Controller, useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@shared/components/ui/field"
import { Checkbox } from "@shared/components/ui/checkbox"
import { Input } from "@shared/components/ui/input"
import { useTextos } from "@shared/textos/useTextos"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select"
import {
  esquemaDatosFiscalesDe,
  type DatosDatosFiscales,
} from "@features/suscripcion/schemas/suscripcion.schema"
import {
  ETIQUETA_TIPO_DOCUMENTO,
  RESPONSABILIDADES_DIAN,
  type ReglasFiscales,
} from "@features/suscripcion/utils/fiscal"
import type {
  DatosFiscales,
  TipoPersonaFiscal,
} from "@features/suscripcion/types/suscripcion.types"

/** El botón de envío vive en el pie del panel; se atan por este id. */
export const ID_FORM_DATOS_FISCALES = "form-datos-fiscales"

interface SuscripcionDatosFiscalesFormProps {
  /** `null` la primera vez: nadie los ha capturado todavía. */
  datos: DatosFiscales | null
  codigoPais: string
  reglas: ReglasFiscales
  onSubmit: (datos: DatosDatosFiscales) => Promise<void>
}

/**
 * A quién se le factura, **para quien lo necesite**. Sin esto se factura como
 * consumidor final, que es lo que le sirve a un barbero solo.
 *
 * Qué campos aparecen lo deciden **dos cosas**: el país —pedir un código DANE
 * en Madrid es pedir un dato que la api rechaza— y sobre todo **si es empresa o
 * persona**. Una persona natural ve cuatro campos y termina; el domicilio, el
 * municipio y las responsabilidades solo salen para una empresa, que es quien
 * los tiene y quien los necesita en su factura.
 *
 * El país no es un campo: llega del servidor. Dejar elegirlo sería dejar elegir
 * con qué reglas se valida el propio documento.
 */
export function SuscripcionDatosFiscalesForm({
  datos,
  codigoPais,
  reglas,
  onSubmit,
}: SuscripcionDatosFiscalesFormProps) {
  const t = useTextos("suscripcion.form")
  const tPersona = useTextos("suscripcion.tipoPersona")
  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosDatosFiscales>({
    resolver: standardSchemaResolver(esquemaDatosFiscalesDe(codigoPais)),
    defaultValues: {
      // Persona natural por defecto: el caso más común es el barbero solo, y
      // es además el camino corto. Quien sea empresa lo cambia en un clic.
      tipoPersona: datos?.tipoPersona ?? "natural",
      tipoDocumento: datos?.tipoDocumento ?? reglas.documentos.natural[0],
      numeroDocumento: datos?.numeroDocumento ?? "",
      razonSocial: datos?.razonSocial ?? "",
      responsabilidades: datos?.responsabilidades ?? [],
      direccionFiscal: {
        calle: datos?.direccionFiscal?.calle ?? "",
        ciudad: datos?.direccionFiscal?.ciudad ?? "",
        region: datos?.direccionFiscal?.region ?? "",
        codigoPostal: datos?.direccionFiscal?.codigoPostal ?? "",
        // El domicilio fiscal nace en el país del negocio, que es lo habitual.
        pais: datos?.direccionFiscal?.pais ?? codigoPais,
      },
      codigoMunicipio: datos?.codigoMunicipio ?? "",
      emailFacturacion: datos?.emailFacturacion ?? "",
      telefono: datos?.telefono ?? "",
    },
  })

  const tipoPersona = watch("tipoPersona")
  const tipoDocumento = watch("tipoDocumento")
  const documentos = reglas.documentos[tipoPersona] ?? []
  const ejemplo = reglas.ejemplos[tipoDocumento]
  /** Lo que sigue solo se le pide a quien tiene contabilidad detrás. */
  const esEmpresa = tipoPersona === "juridica"

  return (
    <form
      id={ID_FORM_DATOS_FISCALES}
      onSubmit={(e) => void handleSubmit(onSubmit)(e)}
      className="flex flex-col gap-8"
    >
      <FieldSet>
        <FieldLegend variant="label">{t("aNombreDe")}</FieldLegend>
        <FieldDescription>
          Si eres una empresa, el nombre legal —no el comercial—: una factura a la marca es una
          factura a alguien que no existe ante la autoridad.
        </FieldDescription>

        <div className="grid gap-5 sm:grid-cols-2">
          <Controller
            control={control}
            name="tipoPersona"
            render={({ field }) => (
              <Field data-invalid={!!errors.tipoPersona}>
                <FieldLabel htmlFor="tipoPersona">{t("tipo")}</FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={(valor) => {
                    field.onChange(valor)
                    // El documento vigente puede no existir para la otra clase
                    // de persona: se cambia al que sí, en vez de dejar uno que
                    // la api rechazaría.
                    const validos = reglas.documentos[valor as TipoPersonaFiscal] ?? []
                    if (validos[0] && !validos.includes(tipoDocumento)) {
                      setValue("tipoDocumento", validos[0])
                    }
                  }}
                >
                  <SelectTrigger id="tipoPersona" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["juridica", "natural"] as TipoPersonaFiscal[]).map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tPersona(tipo)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[errors.tipoPersona]} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="tipoDocumento"
            render={({ field }) => (
              <Field data-invalid={!!errors.tipoDocumento}>
                <FieldLabel htmlFor="tipoDocumento">{t("documento")}</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="tipoDocumento" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {documentos.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {ETIQUETA_TIPO_DOCUMENTO[tipo]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[errors.tipoDocumento]} />
              </Field>
            )}
          />
        </div>

        <Field data-invalid={!!errors.numeroDocumento}>
          <FieldLabel htmlFor="numeroDocumento">{t("numero")}</FieldLabel>
          <Input
            id="numeroDocumento"
            placeholder={ejemplo}
            aria-invalid={!!errors.numeroDocumento}
            {...register("numeroDocumento")}
          />
          {tipoDocumento === "nit" && (
            <FieldDescription>
              Con el dígito de verificación detrás del guion. Lo comprobamos al guardar.
            </FieldDescription>
          )}
          <FieldError errors={[errors.numeroDocumento]} />
        </Field>

        <Field data-invalid={!!errors.razonSocial}>
          <FieldLabel htmlFor="razonSocial">
            {tipoPersona === "juridica" ? t("razonSocial") : t("nombreCompleto")}
          </FieldLabel>
          <Input
            id="razonSocial"
            placeholder={esEmpresa ? t("razonSocialEjemplo") : t("nombreEjemplo")}
            aria-invalid={!!errors.razonSocial}
            {...register("razonSocial")}
          />
          <FieldError errors={[errors.razonSocial]} />
        </Field>
      </FieldSet>

      {/*
        Domicilio, municipio y responsabilidades SOLO para empresa. A un barbero
        con su cédula no se le piden: no los necesita en su factura y mandarlo a
        buscarlos para pagar un software es perderlo en el formulario.
      */}
      {esEmpresa && (
        <FieldSet>
          <FieldLegend variant="label">{t("domicilio")}</FieldLegend>
          <FieldDescription>
            No tiene que ser el de ninguna sede: una cadena factura desde su oficina.
          </FieldDescription>

          <Field data-invalid={!!errors.direccionFiscal?.calle}>
            <FieldLabel htmlFor="calle">{t("direccion")}</FieldLabel>
            <Input
              id="calle"
              placeholder={t("direccionEjemplo")}
              aria-invalid={!!errors.direccionFiscal?.calle}
              {...register("direccionFiscal.calle")}
            />
            <FieldError errors={[errors.direccionFiscal?.calle]} />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field data-invalid={!!errors.direccionFiscal?.ciudad}>
              <FieldLabel htmlFor="ciudad">{t("ciudad")}</FieldLabel>
              <Input
                id="ciudad"
                aria-invalid={!!errors.direccionFiscal?.ciudad}
                {...register("direccionFiscal.ciudad")}
              />
              <FieldError errors={[errors.direccionFiscal?.ciudad]} />
            </Field>

            <Field data-invalid={!!errors.direccionFiscal?.region}>
              <FieldLabel htmlFor="region">{t("region")}</FieldLabel>
              <Input id="region" {...register("direccionFiscal.region")} />
              <FieldError errors={[errors.direccionFiscal?.region]} />
            </Field>

            <Field data-invalid={!!errors.direccionFiscal?.codigoPostal}>
              <FieldLabel htmlFor="codigoPostal">{t("codigoPostal")}</FieldLabel>
              <Input id="codigoPostal" {...register("direccionFiscal.codigoPostal")} />
              <FieldError errors={[errors.direccionFiscal?.codigoPostal]} />
            </Field>

            <Field data-invalid={!!errors.direccionFiscal?.pais}>
              <FieldLabel htmlFor="pais">{t("pais")}</FieldLabel>
              <Input
                id="pais"
                maxLength={2}
                className="uppercase"
                aria-invalid={!!errors.direccionFiscal?.pais}
                {...register("direccionFiscal.pais")}
              />
              <FieldError errors={[errors.direccionFiscal?.pais]} />
            </Field>
          </div>

          {reglas.pideMunicipio && (
            <Field data-invalid={!!errors.codigoMunicipio}>
              <FieldLabel htmlFor="codigoMunicipio">{t("codigoMunicipio")}</FieldLabel>
              <Input
                id="codigoMunicipio"
                inputMode="numeric"
                placeholder="05001"
                aria-invalid={!!errors.codigoMunicipio}
                {...register("codigoMunicipio")}
              />
              <FieldDescription>
                Cinco dígitos. Sin él, una factura colombiana no se puede legalizar después.
              </FieldDescription>
              <FieldError errors={[errors.codigoMunicipio]} />
            </Field>
          )}
        </FieldSet>
      )}

      {esEmpresa && reglas.pideResponsabilidades && (
        <FieldSet>
          <FieldLegend variant="label">{t("responsabilidades")}</FieldLegend>
          <FieldDescription>
            Las que declaraste ante la DIAN. Si no tienes ninguna especial, marca la última.
          </FieldDescription>
          <Controller
            control={control}
            name="responsabilidades"
            render={({ field }) => (
              <Field data-invalid={!!errors.responsabilidades}>
                <div className="flex flex-col gap-3">
                  {RESPONSABILIDADES_DIAN.map((responsabilidad) => (
                    <label
                      key={responsabilidad.codigo}
                      className="flex cursor-pointer items-center gap-3 text-sm"
                    >
                      <Checkbox
                        checked={(field.value ?? []).includes(responsabilidad.codigo)}
                        onCheckedChange={(marcada) =>
                          field.onChange(
                            marcada
                              ? [...(field.value ?? []), responsabilidad.codigo]
                              : (field.value ?? []).filter(
                                  (codigo) => codigo !== responsabilidad.codigo
                                )
                          )
                        }
                      />
                      <span>
                        <span className="font-medium tabular-nums">{responsabilidad.codigo}</span>
                        <span className="text-muted-foreground"> · {responsabilidad.nombre}</span>
                      </span>
                    </label>
                  ))}
                </div>
                <FieldError errors={[errors.responsabilidades]} />
              </Field>
            )}
          />
        </FieldSet>
      )}

      <FieldSet>
        <FieldLegend variant="label">{t("aDondeMandamos")}</FieldLegend>
        <FieldDescription>
          Opcional. Contabilidad y mostrador rara vez son la misma persona.
        </FieldDescription>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field data-invalid={!!errors.emailFacturacion}>
            <FieldLabel htmlFor="emailFacturacion">{t("correo")}</FieldLabel>
            <Input
              id="emailFacturacion"
              type="email"
              inputMode="email"
              placeholder="contabilidad@elcorte.co"
              aria-invalid={!!errors.emailFacturacion}
              {...register("emailFacturacion")}
            />
            <FieldError errors={[errors.emailFacturacion]} />
          </Field>

          <Field data-invalid={!!errors.telefono}>
            <FieldLabel htmlFor="telefonoFiscal">{t("telefono")}</FieldLabel>
            <Input
              id="telefonoFiscal"
              inputMode="tel"
              placeholder="+573001112233"
              aria-invalid={!!errors.telefono}
              {...register("telefono")}
            />
            <FieldError errors={[errors.telefono]} />
          </Field>
        </div>
      </FieldSet>
    </form>
  )
}
