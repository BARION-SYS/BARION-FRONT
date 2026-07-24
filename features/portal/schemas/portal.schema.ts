import { z } from "zod"

// Teléfono del cliente: dígitos, espacios, guiones y prefijo internacional.
const telefono = z
  .string()
  .trim()
  .min(7, "Ingresa tu número de celular")
  .regex(/^\+?[\d\s-]{7,18}$/, "Número inválido, ej. +57 300 123 4567")

/** Datos de contacto que el cliente escribe en el formulario de reserva. */
export const esquemaContacto = z.object({
  nombre: z.string().trim().min(2, "Ingresa tu nombre"),
  telefono,
  notas: z.string().trim().max(160, "Máximo 160 caracteres").optional(),
})

/** Reserva completa: la selección del flujo + los datos de contacto. */
export const esquemaReserva = esquemaContacto.extend({
  // El campo vacío no viaja a la API.
  notas: z
    .string()
    .trim()
    .max(160, "Máximo 160 caracteres")
    .optional()
    .transform((valor) => valor || undefined),
  servicioId: z.number("Selecciona un servicio").int().positive("Selecciona un servicio"),
  /** 0 = cualquier barbero disponible */
  barberoId: z.number("Selecciona un barbero").int().min(0, "Selecciona un barbero"),
  inicio: z.iso.datetime("Selecciona un horario"),
})

/** Verificación del teléfono por código de un solo uso. */
export const esquemaCodigo = z.object({
  codigo: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "El código es de 6 dígitos"),
})

/** Alta del cliente en la barbería desde el portal público. */
export const esquemaRegistro = z.object({
  nombre: z.string().trim().min(2, "Ingresa tu nombre"),
  telefono,
  // El correo es opcional: el canal obligatorio del negocio es el celular.
  correo: z.union([z.email("Ingresa un correo válido"), z.literal("")]).optional(),
  barberoFavorito: z.string().optional(),
  aceptaPromos: z.boolean(),
})

/** Acceso del cliente a "Mis citas" — solo con su celular. */
export const esquemaAcceso = z.object({ telefono })

// Lo que se envía a la API es SIEMPRE el tipo inferido del schema.
export type DatosContacto = z.infer<typeof esquemaContacto>
// Reserva: se tipa la ENTRADA del schema — es lo que la página arma y el service parsea.
export type DatosReserva = z.input<typeof esquemaReserva>
export type DatosCodigo = z.infer<typeof esquemaCodigo>
export type DatosAcceso = z.infer<typeof esquemaAcceso>
export type DatosRegistro = z.infer<typeof esquemaRegistro>
