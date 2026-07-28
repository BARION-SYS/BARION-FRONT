import { z } from "zod"

// El formulario tiene DOS campos y solo dos. La barbería no se teclea: sale de
// la ruta de la puerta por la que se entra (`/b/{slug}/entrar`) y el service la
// añade aparte.
//
// Por eso no está en este schema: zod valida lo que una persona escribió, y ahí
// nadie escribió nada.
export const esquemaLogin = z.object({
  correo: z.email("Ingresa un correo válido"),
  contrasena: z.string().min(8, "La contraseña debe tener mínimo 8 caracteres"),
  recordarme: z.boolean(),
})

// Lo que maneja el formulario. El service lo traduce al contrato de la API
// (`correo` → `email`); `recordarme` no viaja: la vigencia de la sesión la
// decide la API en el maxAge de la cookie, no el navegador.
export type DatosLogin = z.infer<typeof esquemaLogin>
