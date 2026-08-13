import { z } from "zod"

/**
 * Lo que el front ENVÍA. El dinero sale como cadena de centavos: el formulario
 * pide pesos y `useFormato().aCentavos` los convierte antes de llegar aquí.
 *
 * `moneda`, `duracionBaseMin` y `bufferMin` son obligatorios porque la api los
 * exige: los tres se deducen mal en silencio —una duración por defecto llena la
 * agenda de citas que no caben y un buffer en cero pega un corte con el
 * siguiente—, y mandarlos vacíos devuelve 400.
 */
const centavos = z
  .string()
  .regex(/^\d{1,18}$/, "Importe inválido")
  .optional()
  .or(z.literal("").transform(() => undefined))

const opcional = (max: number) =>
  z
    .string()
    .max(max, `Máximo ${max} caracteres`)
    .optional()
    .or(z.literal("").transform(() => undefined))

export const esquemaServicio = z.object({
  nombre: z.string().min(2, "Mínimo 2 caracteres").max(120, "Máximo 120"),
  moneda: z.string().length(3, "Código ISO 4217 de 3 letras"),
  duracionBaseMin: z
    .number({ error: "Indica cuánto dura" })
    .int("Solo minutos enteros")
    .min(5, "Mínimo 5 minutos")
    .max(600, "Máximo 600 minutos"),
  bufferMin: z
    .number({ error: "Indica el tiempo de limpieza" })
    .int("Solo minutos enteros")
    .min(0, "No puede ser negativo")
    .max(240, "Máximo 240 minutos"),
  descripcion: opcional(2000),
  categoria: opcional(60),
  sedeId: z.uuid("Sede inválida").optional(),
  precioBaseCentavos: centavos,
  precioMinCentavos: centavos,
  precioMaxCentavos: centavos,
  destacado: z.boolean().optional(),
})

export type DatosServicio = z.infer<typeof esquemaServicio>

/** Una línea de la oferta de un barbero. */
export const esquemaLineaOferta = z.object({
  servicioId: z.uuid(),
  precioCentavos: z.string().regex(/^\d{1,18}$/, "Indica el precio"),
  duracionMin: z
    .number()
    .int("Solo minutos enteros")
    .min(5, "Mínimo 5 minutos")
    .max(600, "Máximo 600 minutos"),
  bufferMin: z.number().int().min(0).max(240).optional(),
  orden: z.number().int().min(0).optional(),
})

/**
 * La oferta COMPLETA: enviar la lista entera es lo único que permite quitar un
 * servicio. Lo que no viene, la api lo desactiva.
 */
export const esquemaOferta = z.object({
  lineas: z.array(esquemaLineaOferta).max(200, "Máximo 200 servicios"),
})

export type DatosOferta = z.infer<typeof esquemaOferta>

/**
 * Quiénes ofrecen un servicio.
 *
 * El precio y la duración van OPCIONALES a propósito: asignar un corte a varias
 * personas es decidir quién lo hace, no negociar una tarifa por cabeza. Lo que
 * no se manda lo hereda la api del catálogo.
 */
const esquemaBarberoDelServicio = z.object({
  barberoId: z.uuid(),
  precioCentavos: z
    .string()
    .regex(/^\d{1,18}$/, "El precio va en centavos, sin signo ni decimales")
    .optional(),
  duracionMin: z.number().int().min(5).max(600).optional(),
  bufferMin: z.number().int().min(0).max(240).optional(),
})

export const esquemaAsignacionServicio = z.object({
  barberos: z.array(esquemaBarberoDelServicio).max(200, "Máximo 200 barberos"),
})

export type DatosAsignacionServicio = z.infer<typeof esquemaAsignacionServicio>
