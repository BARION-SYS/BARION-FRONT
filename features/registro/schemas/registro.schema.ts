import { z } from "zod"

// Mismos límites que valida la api. Repetirlos aquí no es duplicar la regla:
// es dejar que el error salga junto al campo en vez de volver en un 400.
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const E164 = /^\+[1-9]\d{7,14}$/

/**
 * Cuatro datos y la contraseña. El plan, los días de prueba y el nombre de la
 * sede los pone la api: preguntarle el plan a quien todavía no conoce el
 * producto es la peor pregunta posible.
 */
export const esquemaRegistro = z.object({
  nombreComercial: z
    .string()
    .trim()
    .min(2, "Escribe el nombre de tu barbería")
    .max(120, "Máximo 120 caracteres"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "Elige un identificador")
    .max(60, "Máximo 60 caracteres")
    .regex(SLUG, "Solo minúsculas, números y guiones simples"),
  codigoPais: z.enum(["CO", "US", "ES"], { message: "Elige el país" }),
  propietarioNombre: z
    .string()
    .trim()
    .min(2, "Escribe tu nombre")
    .max(120, "Máximo 120 caracteres"),
  propietarioEmail: z.email("Ingresa un correo válido"),
  propietarioTelefonoE164: z.string().trim().regex(E164, "Escríbelo con indicativo: +573001112233"),
  contrasena: z.string().min(12, "Mínimo 12 caracteres"),
})

export type DatosRegistro = z.infer<typeof esquemaRegistro>

/**
 * Lo que la persona SÍ escribe. El identificador no está: se genera del nombre
 * comercial y se comprueba contra la api, así que no es un campo del formulario
 * y no tiene sentido validarlo como si alguien lo hubiera tecleado.
 */
export const esquemaFormularioRegistro = esquemaRegistro.omit({ slug: true })

export type DatosFormularioRegistro = z.infer<typeof esquemaFormularioRegistro>

/**
 * El alta cuando la identidad la aporta Google.
 *
 * **Sin correo y sin contraseña, y esa ausencia es la garantía**: el correo sale
 * de la cookie firmada que dejó la vuelta del proveedor, así que enviarlo desde
 * aquí permitiría abrir una barbería a nombre de una dirección ajena con solo
 * escribirla. Contraseña no hay ninguna: la cuenta nace solo con proveedor y
 * quien quiera una la pone después por el restablecimiento de siempre.
 *
 * El teléfono se queda porque Google no lo entrega y a una barbería hay que
 * poder llamarla.
 */
export const esquemaRegistroGoogle = esquemaRegistro.omit({
  propietarioEmail: true,
  contrasena: true,
})

export type DatosRegistroGoogle = z.infer<typeof esquemaRegistroGoogle>

/** Lo mismo sin el identificador: se genera del nombre, no se teclea. */
export const esquemaFormularioRegistroGoogle = esquemaRegistroGoogle.omit({ slug: true })

export type DatosFormularioRegistroGoogle = z.infer<typeof esquemaFormularioRegistroGoogle>
