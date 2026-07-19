import { z } from "zod"

// Roles disponibles — también alimentan el select del formulario.
export const rolesBarbero = ["Barbero Senior", "Barbero"] as const

export const esquemaBarbero = z.object({
  nombre: z.string().min(2, "Ingresa el nombre del barbero"),
  rol: z.enum(rolesBarbero, "Selecciona un rol"),
  telefono: z.string().min(7, "Ingresa un teléfono válido"),
  correo: z.email("Ingresa un correo válido"),
  porcentajeComision: z
    .number("Ingresa el porcentaje de comisión")
    .min(10, "La comisión mínima es 10%")
    .max(70, "La comisión máxima es 70%"),
  diasLaborales: z.array(z.boolean()).length(7, "Deben ser 7 días").optional(),
})

// Lo que se envía a la API es SIEMPRE el tipo inferido del schema.
export type DatosBarbero = z.infer<typeof esquemaBarbero>
