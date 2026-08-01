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

// La contraseña nueva: la exige la pantalla bloqueante del primer acceso y el
// cambio voluntario desde configuración. La actual se sigue pidiendo aunque haya
// sesión — sin eso, un equipo desbloqueado un minuto basta para dejar a su dueño
// fuera de su propia cuenta.
export const esquemaCambioContrasena = z
  .object({
    contrasenaActual: z.string().min(8, "Escribe la contraseña con la que entraste"),
    contrasenaNueva: z.string().min(12, "Mínimo 12 caracteres"),
    confirmacion: z.string(),
  })
  .refine((d) => d.contrasenaNueva === d.confirmacion, {
    message: "Las dos contraseñas no coinciden",
    path: ["confirmacion"],
  })
  .refine((d) => d.contrasenaNueva !== d.contrasenaActual, {
    message: "Elige una distinta de la que te dieron",
    path: ["contrasenaNueva"],
  })

export type DatosCambioContrasena = z.infer<typeof esquemaCambioContrasena>

/** Pedir el enlace. La API responde lo mismo exista o no el correo. */
export const esquemaSolicitudRecuperacion = z.object({
  email: z.email("Ingresa un correo válido"),
})

export type DatosSolicitudRecuperacion = z.infer<typeof esquemaSolicitudRecuperacion>

// El token no lo escribe nadie: viene en el enlace del correo y lo añade la
// página. Por eso vive fuera del schema, igual que el slug en el login.
export const esquemaNuevaContrasena = z
  .object({
    contrasenaNueva: z.string().min(12, "Mínimo 12 caracteres"),
    confirmacion: z.string(),
  })
  .refine((d) => d.contrasenaNueva === d.confirmacion, {
    message: "Las dos contraseñas no coinciden",
    path: ["confirmacion"],
  })

export type DatosNuevaContrasena = z.infer<typeof esquemaNuevaContrasena>
