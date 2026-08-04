import { z } from "zod"
import { pasaLuhn, soloDigitos, tarjetaVencida } from "@features/pagos/utils/tarjeta"

/**
 * Lo que se teclea en el formulario de tarjeta.
 *
 * **Nada de esto se envía a Barion.** Va directo a la pasarela, en su dominio, y
 * lo único que cruza hacia la api es el token que ella devuelve. Se valida aquí
 * porque el token es de un solo uso: cada intento fallido gasta uno.
 */
export const esquemaTarjeta = z
  .object({
    numero: z
      .string()
      .transform(soloDigitos)
      .refine(
        (numero) => numero.length >= 13 && numero.length <= 19,
        "Revisa el número: faltan dígitos"
      )
      .refine(pasaLuhn, "Ese número de tarjeta no es válido"),
    titular: z
      .string()
      .trim()
      .min(3, "Escribe el nombre tal como aparece en la tarjeta")
      .max(64, "Máximo 64 caracteres"),
    // Dos dígitos, como los pide la pasarela: 08 y 28, no agosto y 2028.
    expiraMes: z
      .string()
      .trim()
      .regex(/^(0[1-9]|1[0-2])$/, "Mes en dos dígitos: 01 a 12"),
    expiraAnio: z
      .string()
      .trim()
      .regex(/^\d{2}$/, "Año en dos dígitos: 28"),
    cvc: z
      .string()
      .trim()
      .regex(/^\d{3,4}$/, "3 o 4 dígitos"),
    /**
     * Las dos aceptaciones que exige el proveedor. **No se marcan solas**: son
     * un consentimiento, y precargarlas lo convertiría en un trámite falso.
     */
    aceptaTerminos: z.boolean().refine((acepta) => acepta, "Acepta los términos y condiciones"),
    aceptaDatos: z
      .boolean()
      .refine((acepta) => acepta, "Autoriza el tratamiento de tus datos personales"),
  })
  .refine(({ expiraMes, expiraAnio }) => !tarjetaVencida(expiraMes, expiraAnio), {
    message: "Esa tarjeta ya venció",
    path: ["expiraAnio"],
  })

export type DatosTarjeta = z.infer<typeof esquemaTarjeta>

/**
 * El cuerpo exacto de `POST /v1/tokens/cards` de Wompi.
 *
 * Se deriva del formulario en vez de escribirse a mano en el service: así las
 * casillas de aceptación se caen solas del cuerpo —no son de la tarjeta— y el
 * número ya viene sin espacios de la validación de arriba.
 */
export const esquemaTokenizacionWompi = esquemaTarjeta.transform((datos) => ({
  number: datos.numero,
  cvc: datos.cvc,
  exp_month: datos.expiraMes,
  exp_year: datos.expiraAnio,
  card_holder: datos.titular,
}))

/**
 * Lo único que Barion recibe de una tarjeta: un token de un solo uso y las
 * aceptaciones opacas del proveedor.
 */
export const esquemaGuardarMedioPago = z.object({
  tokenEfimero: z.string().min(1, "Falta el token de la pasarela").max(255),
  aceptaciones: z.array(z.string().max(4096)).max(5).optional(),
  clienteExterno: z.string().max(255).optional(),
})

export type DatosGuardarMedioPago = z.infer<typeof esquemaGuardarMedioPago>
