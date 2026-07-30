import { z } from "zod"

/**
 * Identidad y facturación de la barbería (`PATCH /barberias/mi`).
 *
 * Sin teléfono, correo ni dirección: no son de la barbería sino de la sede, y se
 * editan en `/dashboard/sedes`. El identificador público tampoco está aquí — se
 * imprime en los QR ya repartidos, así que no es un campo de formulario.
 *
 * Sin razón social: no existe en el modelo. La API rechaza con 400 cualquier
 * propiedad que su DTO no declare, así que mandarla rompía el guardado entero en
 * cuanto alguien escribía algo en ese campo. Si el negocio la necesita para
 * facturar, empieza por una columna en `BARION-DB`.
 */
export const esquemaGeneral = z.object({
  nombreComercial: z.string().min(2, "Ingresa el nombre del negocio").max(120, "Máximo 120"),
  modoImpuesto: z.enum(["incluido", "agregado"]),
  // Basis points, no porcentaje: 1900 = 19 %. La conversión la hace el
  // formulario, porque quien lo llena piensa en porcentaje.
  tasaImpuestoBps: z.number().int().min(0).max(10000).optional(),
})

/**
 * El texto con el que la barbería se presenta en su portal
 * (`PATCH /barberias/mi/ficha`). Es lo único que su dueño escribe sobre su
 * propio negocio.
 */
export const esquemaTextoFicha = z.object({
  eslogan: z.string().max(120, "Máximo 120 caracteres").optional(),
  descripcion: z.string().max(2000, "Máximo 2000 caracteres").optional(),
})

/**
 * Las viñetas van fuera del schema del formulario porque se editan como lista y
 * no como campo: el resolver de react-hook-form valida lo que registra, y una
 * lista de cadenas sueltas no se registra bien. El contrato completo se valida
 * igual en el service, antes de salir.
 */
export const esquemaFicha = esquemaTextoFicha.extend({
  ventajas: z
    .array(z.string().max(80, "Máximo 80 caracteres por viñeta"))
    .max(8, "Hasta 8 viñetas"),
})

/**
 * Cambio de contraseña (`POST /auth/cambiar-contrasena`). El mínimo de 12 lo
 * exige la API: pedir menos aquí solo cambia un error inline por un 400.
 *
 * `confirmarContrasena` es del formulario y no del contrato — el service lo
 * descarta antes de enviar.
 */
export const esquemaSeguridad = z
  .object({
    contrasenaActual: z.string().min(1, "Ingresa tu contraseña actual"),
    contrasenaNueva: z.string().min(12, "La contraseña debe tener mínimo 12 caracteres"),
    confirmarContrasena: z.string(),
  })
  .refine((datos) => datos.contrasenaNueva === datos.confirmarContrasena, {
    message: "Las contraseñas no coinciden",
    path: ["confirmarContrasena"],
  })

// Lo que se envía a la API es SIEMPRE el tipo inferido del schema.
export type DatosGeneral = z.infer<typeof esquemaGeneral>
export type DatosTextoFicha = z.infer<typeof esquemaTextoFicha>
export type DatosFicha = z.infer<typeof esquemaFicha>
export type DatosSeguridad = z.infer<typeof esquemaSeguridad>
