import { z } from "zod"

/**
 * El alta hace DOS preguntas, no dos formularios: si entra a la aplicación y si
 * atiende clientes. La api resuelve con eso la cuenta, la membresía y la ficha
 * de barbero en una sola operación.
 */
export const esquemaAltaMiembro = z.object({
  nombre: z.string().min(2, "Mínimo 2 caracteres").max(120, "Máximo 120"),
  // Obligatorio: es por donde entrará con un proveedor externo, porque la
  // vinculación se hace por correo.
  email: z.email("Ingresa un correo válido"),
  /**
   * Contacto, no identidad: se entra con el correo. Opcional porque el número
   * es único en toda la plataforma y uno ya registrado —el móvil del dueño, la
   * línea del local— bloquearía el alta sin salida.
   */
  telefonoE164: z
    .string()
    .trim()
    .regex(/^\+[1-9]\d{7,14}$/, "Revisa el número: faltan o sobran dígitos")
    .optional(),
  rol: z.string().min(2, "Elige un rol"),
  /**
   * Vacía significa "genérala tú": `''` no viaja como cadena vacía, se convierte
   * en `undefined` para que la api decida. Con 8 caracteres o más, la dicta
   * quien da de alta.
   */
  contrasenaInicial: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .max(72, "Máximo 72")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  /** Con rol `barbero` la api lo fuerza a true: un barbero sin agenda no existe. */
  atiende: z.boolean(),
  /** Ata a la persona a una sede: la membresía y, si atiende, también su ficha. */
  sedeId: z.uuid().optional(),
  /**
   * Puntos base, igual que la API: 5000 es el 50 %. Solo cuenta con `atiende`, y
   * solo al abrir la ficha — una que ya existía tiene su acuerdo pactado.
   */
  comisionBps: z.number().int().min(0).max(10000).optional(),
})

export type DatosAltaMiembro = z.infer<typeof esquemaAltaMiembro>

export const esquemaCambioRol = z.object({
  rol: z.string().min(2, "Elige un rol"),
})

export type DatosCambioRol = z.infer<typeof esquemaCambioRol>
