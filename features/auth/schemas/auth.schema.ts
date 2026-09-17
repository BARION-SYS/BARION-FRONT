import { z } from "zod"
import { erroresPorDefecto, type TextosDeError } from "@features/auth/schemas/errores"

/**
 * ── Por qué los schemas son FUNCIONES ───────────────────────────────────────
 * Porque sus mensajes los lee una persona, y esa persona tiene idioma. Un schema
 * declarado como constante congela el español en el módulo.
 *
 * Los mensajes llegan por parámetro y **el español es el valor por defecto**, que
 * es lo que permite que haya un solo schema y no dos: el formulario lo construye
 * con el idioma activo (`esquemaLogin(erroresDe(t))`) y el service, que no es un
 * componente y no tiene traductor, lo llama sin nada (`esquemaLogin()`). Ahí el
 * mensaje da igual —lo que hace es descartar claves ajenas y transformar—; lo que
 * no puede pasar es que existan dos definiciones de lo válido.
 *
 * Reciben un objeto de frases YA resueltas y no el traductor: zod las quiere como
 * cadenas en el momento de construir el schema, así que resolverlas fuera deja
 * esta capa sin saber nada de idiomas.
 */

// El formulario tiene DOS campos y solo dos. La barbería no se teclea: sale de
// la ruta de la puerta por la que se entra (`/b/{slug}/entrar`) y el service la
// añade aparte.
//
// Por eso no está en este schema: zod valida lo que una persona escribió, y ahí
// nadie escribió nada.
export function esquemaLogin(t: TextosDeError = erroresPorDefecto) {
  return z.object({
    correo: z.email(t.correo),
    contrasena: z.string().min(8, t.contrasenaCorta),
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
//
// `exigeActual` NO lo decide esta pantalla: lo dice la sesión
// (`exigeContrasenaActual` de `GET /auth/me`). Quien entró con Google arrastrando
// una clave que le puso otro nunca la tuvo, así que pedírsela lo dejaba
// encerrado fuera de su cuenta; la API acepta el cambio sin ella y aquí el campo
// deja de ser obligatorio para que el formulario no invente un requisito que el
// servidor no tiene.
export function esquemaCambioContrasena(
  t: TextosDeError = erroresPorDefecto,
  { exigeActual = true }: { exigeActual?: boolean } = {}
) {
  return z
    .object({
      // Sin mínimo cuando no se exige: ese campo no se pinta y llega vacío.
      contrasenaActual: exigeActual ? z.string().min(8, t.escribeLaActual) : z.string(),
      contrasenaNueva: z.string().min(12, t.minimo12),
      confirmacion: z.string(),
    })
    .refine((d) => d.contrasenaNueva === d.confirmacion, {
      message: t.noCoinciden,
      path: ["confirmacion"],
    })
    .refine((d) => d.contrasenaActual === "" || d.contrasenaNueva !== d.contrasenaActual, {
      message: t.distintaDeLaDada,
      path: ["contrasenaNueva"],
    })
}

/** Lo que la pantalla sabe de la cuenta antes de armar el formulario. */
export interface OpcionesCambioContrasena {
  exigeActual?: boolean
}

export type DatosCambioContrasena = z.infer<ReturnType<typeof esquemaCambioContrasena>>

/** Pedir el enlace. La API responde lo mismo exista o no el correo. */
export function esquemaSolicitudRecuperacion(t: TextosDeError = erroresPorDefecto) {
  return z.object({
    email: z.email(t.correo),
  })
}

export type DatosSolicitudRecuperacion = z.infer<ReturnType<typeof esquemaSolicitudRecuperacion>>

// El token no lo escribe nadie: viene en el enlace del correo y lo añade la
// página. Por eso vive fuera del schema, igual que el slug en el login.
export function esquemaNuevaContrasena(t: TextosDeError = erroresPorDefecto) {
  return z
    .object({
      contrasenaNueva: z.string().min(12, t.minimo12),
      confirmacion: z.string(),
    })
    .refine((d) => d.contrasenaNueva === d.confirmacion, {
      message: t.noCoinciden,
      path: ["confirmacion"],
    })
}

export type DatosNuevaContrasena = z.infer<ReturnType<typeof esquemaNuevaContrasena>>
