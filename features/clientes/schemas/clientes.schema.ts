import { z } from "zod"

/**
 * Lo que el front ENVÍA.
 *
 * El correo es obligatorio porque la api lo exige: es un canal del producto, no
 * un contacto opcional, y sin él hay clientes a los que es imposible escribir.
 * Teléfono y correo son únicos por barbería — repetir uno devuelve 409.
 */
const opcional = (max: number) =>
  z
    .string()
    .max(max, `Máximo ${max} caracteres`)
    .optional()
    .or(z.literal("").transform(() => undefined))

export const esquemaCliente = z.object({
  nombre: z.string().min(2, "Mínimo 2 caracteres").max(120, "Máximo 120"),
  telefonoE164: z.string().regex(/^\+[1-9]\d{7,14}$/, "Formato internacional: +573001112233"),
  email: z.email("Ingresa un correo válido"),
  apellido: opcional(120),
  fechaNacimiento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha en formato YYYY-MM-DD")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  barberoFavoritoId: z
    .uuid("Barbero inválido")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  notas: opcional(2000),
})

export type DatosCliente = z.infer<typeof esquemaCliente>

/**
 * Registrar y revocar son la MISMA operación: `otorgado: false` es una fila
 * nueva. La api nunca actualiza un consentimiento —sería borrar la prueba de
 * cuándo se dio— y por eso aquí tampoco hay un esquema de edición.
 */
export const esquemaConsentimiento = z.object({
  tipo: z.enum(["marketing_whatsapp", "marketing_sms", "marketing_email", "tratamiento_datos"]),
  otorgado: z.boolean(),
  origen: z.enum(["formulario_reserva", "admin", "importacion", "enlace"]),
  versionPolitica: z.string().min(1, "Indica la versión de la política"),
})

export type DatosConsentimiento = z.infer<typeof esquemaConsentimiento>

/**
 * Cerrarle la reserva en línea hasta una fecha.
 *
 * La fecha es obligatoria y futura porque un bloqueo indefinido no lo levanta
 * nadie: se queda puesto, el cliente deja de volver y nadie recuerda por qué.
 */
export const esquemaBloqueo = z.object({
  hasta: z.string().min(1, "Elige hasta cuándo"),
  motivo: z
    .string()
    .trim()
    .min(3, "Di por qué: es lo que lee quien atiende cuando esa persona llame")
    .max(500, "Máximo 500 caracteres")
    .optional()
    .or(z.literal("").transform(() => undefined)),
})

export type DatosBloqueo = z.infer<typeof esquemaBloqueo>
