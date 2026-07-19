import { z } from "zod"

// Catálogos del mock — al integrar la API estos valores vendrán de sus endpoints.
export const serviciosCita = [
  "Corte Clásico",
  "Corte + Barba",
  "Fade + Diseño",
  "Fade Completo",
  "Fade Skin",
  "Barba",
  "Barba Completa",
  "Corte + Diseño",
  "Corte Niño",
] as const

export const barberosCita = ["Miguel", "Pedro", "Juan"] as const

export const esquemaCita = z.object({
  cliente: z.string().min(1, "Ingresa el nombre del cliente"),
  servicio: z.enum(serviciosCita, "Selecciona un servicio"),
  barbero: z.enum(barberosCita, "Selecciona un barbero"),
  dia: z.number("Selecciona el día").int().min(0, "Día inválido").max(6, "Día inválido"),
  horaInicio: z.number("Selecciona la hora").int().min(0, "Hora inválida").max(11, "Hora inválida"),
  duracion: z
    .number("Selecciona la duración")
    .int()
    .min(1, "Duración inválida")
    .max(2, "Duración inválida"),
})

// Lo que se envía a la API es SIEMPRE el tipo inferido del schema.
export type DatosCita = z.infer<typeof esquemaCita>
