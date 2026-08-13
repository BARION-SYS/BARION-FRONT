import { z } from "zod"
import { esCO, type Diccionario } from "@shared/textos/diccionarios/es-CO"

/**
 * ── Por qué los schemas son FUNCIONES ───────────────────────────────────────
 * Porque sus mensajes los lee una persona, y esa persona tiene idioma. Un schema
 * declarado como constante congela el español en el módulo.
 *
 * El diccionario llega por parámetro y **el base es el valor por defecto**, que
 * es lo que permite que haya un solo schema y no dos: el formulario lo construye
 * con el idioma activo (`esquemaLogin(t)`) y el service, que no es un componente
 * y no tiene contexto, lo llama sin nada (`esquemaLogin()`). Ahí el mensaje da
 * igual —lo que hace es descartar claves ajenas y transformar—; lo que no puede
 * pasar es que existan dos definiciones de lo válido.
 */

// El formulario tiene DOS campos y solo dos. La barbería no se teclea: sale de
// la ruta de la puerta por la que se entra (`/b/{slug}/entrar`) y el service la
// añade aparte.
//
// Por eso no está en este schema: zod valida lo que una persona escribió, y ahí
// nadie escribió nada.
export function esquemaLogin(t: Diccionario = esCO) {
  return z.object({
    correo: z.email(t.auth.errores.correo),
    contrasena: z.string().min(8, t.auth.errores.contrasenaCorta),
    recordarme: z.boolean(),
  })
}

// Lo que maneja el formulario. El service lo traduce al contrato de la API
// (`correo` → `email`); `recordarme` no viaja: la vigencia de la sesión la
// decide la API en el maxAge de la cookie, no el navegador.
export type DatosLogin = z.infer<ReturnType<typeof esquemaLogin>>

// La contraseña nueva: la exige la pantalla bloqueante del primer acceso y el
// cambio voluntario desde configuración. La actual se sigue pidiendo aunque haya
// sesión — sin eso, un equipo desbloqueado un minuto basta para dejar a su dueño
// fuera de su propia cuenta.
export function esquemaCambioContrasena(t: Diccionario = esCO) {
  return z
    .object({
      contrasenaActual: z.string().min(8, t.auth.errores.escribeLaActual),
      contrasenaNueva: z.string().min(12, t.auth.errores.minimo12),
      confirmacion: z.string(),
    })
    .refine((d) => d.contrasenaNueva === d.confirmacion, {
      message: t.auth.errores.noCoinciden,
      path: ["confirmacion"],
    })
    .refine((d) => d.contrasenaNueva !== d.contrasenaActual, {
      message: t.auth.errores.distintaDeLaDada,
      path: ["contrasenaNueva"],
    })
}

export type DatosCambioContrasena = z.infer<ReturnType<typeof esquemaCambioContrasena>>

/** Pedir el enlace. La API responde lo mismo exista o no el correo. */
export function esquemaSolicitudRecuperacion(t: Diccionario = esCO) {
  return z.object({
    email: z.email(t.auth.errores.correo),
  })
}

export type DatosSolicitudRecuperacion = z.infer<ReturnType<typeof esquemaSolicitudRecuperacion>>

// El token no lo escribe nadie: viene en el enlace del correo y lo añade la
// página. Por eso vive fuera del schema, igual que el slug en el login.
export function esquemaNuevaContrasena(t: Diccionario = esCO) {
  return z
    .object({
      contrasenaNueva: z.string().min(12, t.auth.errores.minimo12),
      confirmacion: z.string(),
    })
    .refine((d) => d.contrasenaNueva === d.confirmacion, {
      message: t.auth.errores.noCoinciden,
      path: ["confirmacion"],
    })
}

export type DatosNuevaContrasena = z.infer<ReturnType<typeof esquemaNuevaContrasena>>
