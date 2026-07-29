import { z } from "zod"

/**
 * Lo único que este front envía sobre autorización: las excepciones de UNA
 * persona. Los roles los define Barion y no se crean ni se editan desde el
 * panel, así que no hay schema de alta ni de edición de rol.
 */
export const esquemaExcepciones = z.object({
  excepciones: z.array(z.object({ permiso: z.string(), concedido: z.boolean() })),
})

export type DatosExcepciones = z.infer<typeof esquemaExcepciones>
