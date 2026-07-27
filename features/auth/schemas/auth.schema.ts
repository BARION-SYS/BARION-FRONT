import { z } from "zod"

// No se pide la barbería. El correo es único en toda la plataforma y una cuenta
// pertenece a una sola barbería, así que identifica a la persona Y determina a
// dónde entra — sin que tenga que recordar bajo qué nombre la registraron.
export const esquemaLogin = z.object({
  correo: z.email("Ingresa un correo válido"),
  contrasena: z.string().min(8, "La contraseña debe tener mínimo 8 caracteres"),
  recordarme: z.boolean(),
})

// Lo que maneja el formulario. El service lo traduce al contrato de la API
// (`correo` → `email`); `recordarme` no viaja: la vigencia de la sesión la
// decide la API en el maxAge de la cookie, no el navegador.
export type DatosLogin = z.infer<typeof esquemaLogin>
