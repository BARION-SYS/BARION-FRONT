import { z } from "zod"

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const HORA = /^(?:[01]\d|2[0-3]):[0-5]\d$|^24:00$/
const FECHA = /^\d{4}-\d{2}-\d{2}$/

const direccion = z.object({
  calle: z.string().max(160).optional(),
  ciudad: z.string().max(120).optional(),
  region: z.string().max(120).optional(),
  codigoPostal: z.string().max(20).optional(),
  pais: z.string().length(2, "Código de dos letras (CO, US, ES)").optional(),
})

export const esquemaSede = z.object({
  nombre: z.string().min(2, "Mínimo 2 caracteres").max(120, "Máximo 120"),
  zonaHoraria: z.string().min(1, "Elige la zona horaria de la sede"),
  slugQr: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(64, "Máximo 64 caracteres")
    .regex(SLUG, "Solo minúsculas, números y guiones simples"),
  // Vacío es válido: sin moneda propia, la sede hereda la de la barbería.
  moneda: z.string().length(3, "Código ISO de tres letras").optional(),
  telefono: z.string().max(32, "Máximo 32 caracteres").optional(),
  direccion: direccion.optional(),
  inicioSemana: z.union([z.literal(0), z.literal(1)]).optional(),
})

export type DatosSede = z.infer<typeof esquemaSede>

export const esquemaEditarSede = esquemaSede.partial()

export type DatosEditarSede = z.infer<typeof esquemaEditarSede>

const tramo = z.object({
  diaSemana: z.number().int().min(0).max(6),
  abre: z.string().regex(HORA, "Formato HH:mm"),
  cierra: z.string().regex(HORA, "Formato HH:mm"),
})

/**
 * La semana COMPLETA: enviar la lista entera es lo único que permite quitar un
 * tramo. Los solapes los rechazaría igual la API, pero comprobarlos aquí evita
 * un viaje de ida y vuelta para decir algo que ya se sabe en el formulario.
 */
export const esquemaHorarios = z
  .object({ tramos: z.array(tramo) })
  .refine(({ tramos }) => tramos.every((t) => aMinutos(t.cierra) > aMinutos(t.abre)), {
    message: "Un tramo cierra antes de abrir",
    path: ["tramos"],
  })
  .refine(({ tramos }) => !haySolape(tramos), {
    message: "Dos tramos del mismo día se solapan",
    path: ["tramos"],
  })

export type DatosHorarios = z.infer<typeof esquemaHorarios>

export const esquemaCierre = z
  .object({
    fechaDesde: z.string().regex(FECHA, "Formato AAAA-MM-DD"),
    fechaHasta: z.string().regex(FECHA, "Formato AAAA-MM-DD"),
    motivo: z.string().min(2, "Mínimo 2 caracteres").max(200, "Máximo 200"),
  })
  .refine(({ fechaDesde, fechaHasta }) => fechaHasta >= fechaDesde, {
    message: "El cierre termina antes de empezar",
    path: ["fechaHasta"],
  })

export type DatosCierre = z.infer<typeof esquemaCierre>

export const esquemaEditarCierre = z.object({
  fechaDesde: z.string().regex(FECHA, "Formato AAAA-MM-DD").optional(),
  fechaHasta: z.string().regex(FECHA, "Formato AAAA-MM-DD").optional(),
  motivo: z.string().min(2).max(200).optional(),
})

export type DatosEditarCierre = z.infer<typeof esquemaEditarCierre>

function aMinutos(hora: string): number {
  const [hh, mm] = hora.split(":")
  return Number(hh) * 60 + Number(mm)
}

// Rango semiabierto: cerrar a las 13:00 y volver a abrir a las 13:00 no es solape.
function haySolape(tramos: { diaSemana: number; abre: string; cierra: string }[]): boolean {
  return tramos.some((uno, i) =>
    tramos.some(
      (otro, j) =>
        j > i &&
        uno.diaSemana === otro.diaSemana &&
        aMinutos(uno.abre) < aMinutos(otro.cierra) &&
        aMinutos(otro.abre) < aMinutos(uno.cierra)
    )
  )
}
