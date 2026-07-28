import { z } from "zod"

export const esquemaInvitacion = z.object({
  nombre: z.string().min(2, "Mínimo 2 caracteres").max(120, "Máximo 120"),
  // Obligatorio: es por donde entrará con un proveedor externo, porque la
  // vinculación se hace por correo.
  email: z.email("Ingresa un correo válido"),
  telefonoE164: z.string().regex(/^\+[1-9]\d{7,14}$/, "Formato internacional: +573001112233"),
  rol: z.string().min(2, "Elige un rol"),
})

export type DatosInvitacion = z.infer<typeof esquemaInvitacion>

export const esquemaCambioRol = z.object({
  rol: z.string().min(2, "Elige un rol"),
})

export type DatosCambioRol = z.infer<typeof esquemaCambioRol>
