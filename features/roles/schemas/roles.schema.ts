import { z } from "zod"

const CODIGO = /^[a-z][a-z0-9_]{1,30}$/

export const esquemaRol = z.object({
  codigo: z.string().regex(CODIGO, "Minúsculas, números y guion bajo. Entre 2 y 31 caracteres"),
  nombre: z.string().min(2, "Mínimo 2 caracteres").max(60, "Máximo 60"),
  orden: z.number().int().min(0).max(999).optional(),
  // El paquete COMPLETO, no altas sueltas: es lo único que permite quitar uno.
  permisos: z.array(z.string()),
})

export type DatosRol = z.infer<typeof esquemaRol>

/** Al editar, el código no se toca: es estable y lo compara el código. */
export const esquemaEditarRol = esquemaRol.omit({ codigo: true }).partial()

export type DatosEditarRol = z.infer<typeof esquemaEditarRol>

export const esquemaExcepciones = z.object({
  excepciones: z.array(z.object({ permiso: z.string(), concedido: z.boolean() })),
})

export type DatosExcepciones = z.infer<typeof esquemaExcepciones>
