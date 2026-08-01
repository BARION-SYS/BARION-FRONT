import { z } from "zod"

/**
 * Lo que el front ENVÍA al reservar.
 *
 * `ofertaIds` son ids de la **oferta del barbero** (lo que él cobra), no del
 * catálogo: es lo que se reserva de verdad. Y el barbero es SIEMPRE concreto —
 * "cualquiera disponible" se resuelve antes, eligiendo uno de los `barberoIds`
 * que devuelve la franja.
 *
 * Ni la duración ni el precio viajan: los calcula la api desde las líneas. Que
 * los mandara el navegador permitiría guardar una cita de dos servicios
 * ocupando el hueco de uno.
 */
export const esquemaCita = z.object({
  sedeId: z.uuid("Sede inválida"),
  barberoId: z.uuid("Selecciona un barbero"),
  clienteId: z.uuid("Selecciona un cliente"),
  ofertaIds: z.array(z.uuid()).min(1, "Selecciona al menos un servicio").max(10),
  /** Instante UTC: sale de la franja elegida, no se teclea. */
  iniciaEn: z.iso.datetime("Selecciona una hora disponible"),
  notasCliente: z
    .string()
    .max(1000, "Máximo 1000 caracteres")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  /** Reenviar el formulario con la misma clave no duplica la cita. */
  claveIdempotencia: z.string().min(8).max(128).optional(),
})

export type DatosCita = z.infer<typeof esquemaCita>

export const esquemaReprogramar = z.object({
  iniciaEn: z.iso.datetime("Selecciona una hora disponible"),
  barberoId: z.uuid().optional(),
  motivo: z
    .string()
    .max(500, "Máximo 500 caracteres")
    .optional()
    .or(z.literal("").transform(() => undefined)),
})

export type DatosReprogramar = z.infer<typeof esquemaReprogramar>

/**
 * Se envía el ESTADO DESTINO, no una acción. Si el salto no es legal desde el
 * estado actual, la api responde 422 y dice a dónde sí se puede ir: esa tabla
 * de transiciones vive allá y no se duplica aquí.
 */
export const esquemaEstadoCita = z.object({
  estado: z.enum([
    "reservada",
    "pendiente_confirmacion",
    "confirmada",
    "retrasada",
    "en_curso",
    "completada",
    "cancelada",
    "no_asistio",
  ]),
  motivo: z
    .string()
    .max(500, "Máximo 500 caracteres")
    .optional()
    .or(z.literal("").transform(() => undefined)),
})

export type DatosEstadoCita = z.infer<typeof esquemaEstadoCita>
