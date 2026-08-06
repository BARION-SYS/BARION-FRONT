import { z } from "zod"

/**
 * Lo único que esta pantalla envía: qué plan y cada cuánto se cobra.
 *
 * El país no viaja — lo pone el servidor a partir de la barbería—, y mandarlo
 * dejaría comprar la tarifa de otro país desde aquí.
 */
export const esquemaElegirPlan = z.object({
  planCodigo: z.string().min(1, "Elige un plan"),
  periodo: z.enum(["mensual", "anual"]),
})

export type DatosElegirPlan = z.infer<typeof esquemaElegirPlan>

/** `''` no viaja: se convierte en `undefined` para que la api decida. */
const literalVacia = z.literal("").transform(() => undefined)

const esquemaDireccionFiscal = z.object({
  calle: z.string().trim().min(1, "Escribe la dirección").max(200, "Máximo 200"),
  ciudad: z.string().trim().min(1, "Escribe la ciudad").max(100, "Máximo 100"),
  region: z.string().trim().max(100, "Máximo 100").optional().or(literalVacia),
  codigoPostal: z.string().trim().max(20, "Máximo 20").optional().or(literalVacia),
  pais: z.string().trim().length(2, "Código de dos letras"),
})

/**
 * La identidad tributaria con la que Barion emite la factura, **para quien la
 * necesite**: sin esto se factura como consumidor final, que es lo que le sirve
 * a un barbero solo.
 *
 * **El país no viaja**, igual que al elegir plan: lo pone el servidor a partir
 * de la barbería. Mandarlo dejaría elegir con qué reglas se valida el propio
 * documento.
 */
export const esquemaDatosFiscales = z.object({
  tipoPersona: z.enum(["natural", "juridica"]),
  tipoDocumento: z.enum(["nit", "cc", "ce", "pasaporte", "nif", "cif", "ein"]),
  numeroDocumento: z.string().trim().min(1, "Escribe el número").max(40, "Máximo 40"),
  razonSocial: z.string().trim().min(1, "Escribe el nombre legal").max(200, "Máximo 200"),
  responsabilidades: z.array(z.string().trim().max(20)).max(20).optional(),
  direccionFiscal: esquemaDireccionFiscal.optional(),
  codigoMunicipio: z.string().trim().max(10).optional().or(literalVacia),
  emailFacturacion: z.email("Ingresa un correo válido").optional().or(literalVacia),
  telefono: z.string().trim().max(30, "Máximo 30").optional().or(literalVacia),
})

export type DatosDatosFiscales = z.infer<typeof esquemaDatosFiscales>

/**
 * El mismo esquema con lo que **solo se le exige a una empresa**: domicilio
 * fiscal siempre, y en Colombia además municipio DANE y al menos una
 * responsabilidad.
 *
 * A una persona natural no se le pide ninguna de las tres, y esa asimetría es
 * el punto: un barbero solo no tiene responsabilidades declaradas ante la DIAN
 * ni se sabe el código de su municipio, y mandarlo a buscarlos para pagar un
 * software es perderlo.
 *
 * Va aparte del esquema base porque depende del país, que el service no tiene,
 * y porque su trabajo es otro: enseñar el error **junto al campo**. La api lo
 * vuelve a comprobar entera y es ella quien manda.
 */
export function esquemaDatosFiscalesDe(codigoPais: string) {
  return esquemaDatosFiscales
    .refine((datos) => datos.tipoPersona !== "juridica" || !!datos.direccionFiscal?.calle, {
      path: ["direccionFiscal", "calle"],
      message: "Una empresa necesita su domicilio fiscal",
    })
    .refine(
      (datos) =>
        codigoPais !== "CO" ||
        datos.tipoPersona !== "juridica" ||
        /^\d{5}$/.test(datos.codigoMunicipio ?? ""),
      {
        path: ["codigoMunicipio"],
        message: "Cinco dígitos del código DANE: 05001 para Medellín",
      }
    )
    .refine(
      (datos) =>
        codigoPais !== "CO" ||
        datos.tipoPersona !== "juridica" ||
        (datos.responsabilidades ?? []).length > 0,
      {
        path: ["responsabilidades"],
        message: "Elige al menos una responsabilidad fiscal",
      }
    )
}
