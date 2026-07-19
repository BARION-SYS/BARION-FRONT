import { z } from "zod"

export const esquemaCliente = z.object({
  nombre: z.string().trim().min(1, "El nombre es requerido"),
  telefono: z.string().trim().min(1, "El teléfono es requerido"),
  correo: z.email("Ingresa un correo válido"),
  barberoFavorito: z.string().min(1, "Selecciona un barbero"),
  etiqueta: z.enum(["VIP", "Frecuente", "Regular", "Nuevo"], "Selecciona una etiqueta"),
})

// Lo que se envía a la API es SIEMPRE el tipo inferido del schema.
export type DatosCliente = z.infer<typeof esquemaCliente>
