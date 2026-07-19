import { z } from "zod"

export const esquemaLogin = z.object({
  correo: z.email("Ingresa un correo válido"),
  contrasena: z.string().min(8, "La contraseña debe tener mínimo 8 caracteres"),
  recordarme: z.boolean(),
})

// Lo que se envía a la API es SIEMPRE el tipo inferido del schema.
export type DatosLogin = z.infer<typeof esquemaLogin>
