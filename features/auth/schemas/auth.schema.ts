import { z } from "zod"

export const esquemaLogin = z.object({
  // La barbería a la que se entra. La API la exige porque `membresias` vive bajo
  // RLS: sin barbería resuelta la consulta devuelve cero filas y nadie podría
  // autenticarse. Es el mismo slug de la URL pública barion.app/b/{slug}.
  barberiaSlug: z
    .string()
    .trim()
    .min(2, "Indica la barbería")
    .max(64)
    .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  correo: z.email("Ingresa un correo válido"),
  contrasena: z.string().min(8, "La contraseña debe tener mínimo 8 caracteres"),
  recordarme: z.boolean(),
})

// Lo que maneja el formulario. El service lo traduce al contrato de la API
// (`correo` → `email`); `recordarme` no viaja: la vigencia de la sesión la
// decide la API en el maxAge de la cookie, no el navegador.
export type DatosLogin = z.infer<typeof esquemaLogin>
