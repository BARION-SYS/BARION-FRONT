import esCO from "@/messages/es-CO.json"

/**
 * Las frases de validación del acceso, ya resueltas a texto.
 *
 * ── Por qué el schema recibe esto y no el traductor ─────────────────────────
 * Porque zod las quiere como cadenas en el momento de CONSTRUIR el schema, no
 * al validar. Pasarle el traductor obligaría a que `auth.schema.ts` supiera de
 * idiomas, espacios y librería de i18n para acabar haciendo lo mismo: leer seis
 * frases. Así esa capa no sabe nada de todo eso y sigue siendo zod puro.
 *
 * El español es el valor por defecto y no un respaldo de emergencia: el service
 * llama al schema sin nada porque ahí el mensaje no lo lee nadie —lo que hace es
 * descartar claves ajenas y transformar—, y lo que no puede pasar es que existan
 * dos definiciones de lo válido.
 */
export type TextosDeError = typeof esCO.auth.errores

export const erroresPorDefecto: TextosDeError = esCO.auth.errores

/**
 * Las seis frases sacadas del traductor de raíz.
 *
 * El tipo del parámetro es estructural —«algo que se llama con estas seis claves
 * y devuelve texto»— y no el `Translator` de la librería: así este archivo no
 * arrastra los tipos de next-intl hasta zod, y una clave mal escrita sigue sin
 * compilar porque las seis están enumeradas abajo.
 */
export function erroresDe(
  t: (clave: `auth.errores.${keyof TextosDeError}`) => string
): TextosDeError {
  return {
    correo: t("auth.errores.correo"),
    contrasenaCorta: t("auth.errores.contrasenaCorta"),
    escribeLaActual: t("auth.errores.escribeLaActual"),
    minimo12: t("auth.errores.minimo12"),
    noCoinciden: t("auth.errores.noCoinciden"),
    distintaDeLaDada: t("auth.errores.distintaDeLaDada"),
  }
}
