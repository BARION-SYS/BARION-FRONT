import { z } from "zod"

const E164 = /^\+[1-9]\d{7,14}$/

/** 10000 puntos base = 100 %, igual que la API. */
export const MAX_COMISION_BPS = 10000

/** `''` no viaja: se convierte en `undefined` para que la api decida. */
const literalVacia = z.literal("").transform(() => undefined)

/**
 * El alta de una persona. Una sola pregunta con consecuencias: **quien atiende,
 * entra**.
 *
 * Antes había dos interruptores y «atiende» podía ir solo: se daba de alta a
 * alguien con agenda y sin cuenta. Se retiró, y la razón es de producto — Barion
 * no hace nada físico. Un barbero que no entra no gestiona su agenda: la
 * gestiona otro por él, y como el rol `recepcion` no existe, ese otro acaba
 * siendo el propietario haciendo de secretaria. Eso vacía justo lo que el
 * producto vende: que cada barbero vea sus citas, las mueva, declare su jornada
 * y consulte lo que lleva ganado.
 *
 * Así que toda alta crea acceso, y por eso el correo y el teléfono son
 * obligatorios: son la credencial. Lo único que queda por decidir es si además
 * atiende, y **eso lo acota el rol** (`Rol.agenda`): `barbero` siempre,
 * `propietario` y `administrador` si se marca, cualquier otro nunca.
 *
 * «Atiende y no entra» sigue existiendo en el modelo —es lo que queda cuando a
 * alguien que atendía se le quita el acceso, con su historial y sus citas
 * pasadas—, pero deja de ser algo que se pueda CREAR.
 */
export const esquemaAltaPersona = z.object({
  nombre: z.string().min(2, "Mínimo 2 caracteres").max(120, "Máximo 120"),
  /** Es por donde entra, y por donde se vincula un proveedor externo. */
  email: z.email("Ingresa un correo válido"),
  telefonoE164: z.string().regex(E164, "Formato internacional: +573001112233"),

  rol: z.string().min(2, "Elige un rol"),
  contrasenaInicial: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .max(72, "Máximo 72")
    .optional()
    .or(literalVacia),

  atiende: z.boolean(),
  sedeId: z.uuid().optional().or(literalVacia),
  comisionBps: z.number().int().min(0).max(MAX_COMISION_BPS).optional(),
})

export type DatosAltaPersona = z.infer<typeof esquemaAltaPersona>
