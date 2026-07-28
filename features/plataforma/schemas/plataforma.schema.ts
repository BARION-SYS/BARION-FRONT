import { z } from "zod"

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * Alta de una barbería. Lo rellena el staff de Barion al vender.
 *
 * Es un formulario largo a propósito: la barbería se entrega FUNCIONANDO, con
 * su sede y su propietario dentro. Repartirlo en varios pasos dejaría barberías
 * a medias, que es un estado del que nadie sabe salir.
 */
export const esquemaAltaBarberia = z.object({
  slug: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(60, "Máximo 60 caracteres")
    .regex(SLUG, "Solo minúsculas, números y guiones simples"),
  nombreComercial: z.string().min(2, "Mínimo 2 caracteres").max(120, "Máximo 120"),
  codigoPais: z.string().length(2, "Código de dos letras (CO, US, ES)"),
  planCodigo: z.string().min(2, "Elige un plan"),
  // Sin `coerce`: el resolver exige que el schema entre y salga con la misma
  // forma, y el formulario ya entrega número gracias a `valueAsNumber`.
  diasPrueba: z.number().int().min(0).max(365).optional(),

  sedeNombre: z.string().min(2, "Mínimo 2 caracteres").max(120, "Máximo 120"),
  // Vacío es válido: sin valor, la API usa el huso del país. El service lo
  // limpia antes de enviar, que es donde vive la traducción al contrato.
  sedeZonaHoraria: z.string().optional(),

  propietarioNombre: z.string().min(2, "Mínimo 2 caracteres").max(120, "Máximo 120"),
  propietarioEmail: z.email("Ingresa un correo válido"),
  propietarioTelefonoE164: z
    .string()
    .regex(/^\+[1-9]\d{7,14}$/, "Formato internacional: +573001112233"),
  // Temporal: se la comunica al cliente y él la cambia al entrar. Larga porque
  // va a viajar por WhatsApp o por correo antes de que alguien la cambie.
  propietarioContrasena: z.string().min(12, "Mínimo 12 caracteres"),
})

export type DatosAltaBarberia = z.infer<typeof esquemaAltaBarberia>

export const esquemaCambioEstado = z.object({
  estado: z.enum(["activa", "suspendida", "solo_lectura"]),
})

export type DatosCambioEstado = z.infer<typeof esquemaCambioEstado>
