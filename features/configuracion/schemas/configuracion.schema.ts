import { z } from "zod"

export const esquemaGeneral = z.object({
  nombre: z.string().min(2, "Ingresa el nombre del negocio"),
  telefono: z.string().min(7, "Ingresa un teléfono válido"),
  correo: z.email("Ingresa un correo válido"),
  direccion: z.string().min(5, "Ingresa la dirección"),
  descripcion: z.string().max(280, "Máximo 280 caracteres"),
})

export const esquemaSeguridad = z
  .object({
    contrasenaActual: z.string().min(1, "Ingresa tu contraseña actual"),
    contrasenaNueva: z.string().min(8, "La contraseña debe tener mínimo 8 caracteres"),
    confirmarContrasena: z.string(),
  })
  .refine((datos) => datos.contrasenaNueva === datos.confirmarContrasena, {
    message: "Las contraseñas no coinciden",
    path: ["confirmarContrasena"],
  })

export const esquemaServicio = z.object({
  nombre: z.string().min(2, "Ingresa el nombre del servicio"),
  precio: z.number("Ingresa el precio").positive("El precio debe ser mayor a 0"),
  duracionMin: z
    .number("Ingresa la duración")
    .min(5, "La duración mínima es 5 minutos")
    .max(180, "La duración máxima es 180 minutos"),
})

// Lo que se envía a la API es SIEMPRE el tipo inferido del schema.
export type DatosGeneral = z.infer<typeof esquemaGeneral>
export type DatosSeguridad = z.infer<typeof esquemaSeguridad>
export type DatosServicio = z.infer<typeof esquemaServicio>
