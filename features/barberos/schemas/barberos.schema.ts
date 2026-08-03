import { z } from "zod"

const E164 = /^\+[1-9]\d{7,14}$/
const HORA = /^(?:[01]\d|2[0-3]):[0-5]\d$|^24:00$/
const FECHA = /^\d{4}-\d{2}-\d{2}$/

/** 10000 puntos base = 100 %. */
export const MAX_COMISION_BPS = 10000

export const esquemaBarbero = z.object({
  nombrePublico: z.string().min(2, "Mínimo 2 caracteres").max(120, "Máximo 120"),
  // De vitrina, no de autorización: lo que el cliente lee bajo el nombre.
  titulo: z.string().max(120, "Máximo 120").optional(),
  bio: z.string().max(2000, "Máximo 2000").optional(),
  telefonoE164: z.string().regex(E164, "Formato internacional: +573001112233").optional(),
  email: z.email("Ingresa un correo válido").optional(),
  fechaContratacion: z.string().regex(FECHA, "Formato AAAA-MM-DD").optional(),
  // En puntos base, igual que la API. El formulario pide porcentaje y convierte:
  // quien lo llena piensa en "50 %", y la base guarda 5000 para no arrastrar
  // decimales en el cálculo de cada comisión.
  comisionBps: z.number().int().min(0).max(MAX_COMISION_BPS).optional(),
  sedeId: z.uuid().optional(),
  // Ni `slug` ni `membresiaId`: la api no los acepta y enviarlos responde 400.
  //
  // El identificador público no lo resuelve ninguna ruta —no hay página por
  // barbero—, así que pedirlo era hacer escribir a mano algo que no lleva a
  // ninguna parte. Y vincular la cuenta a mano dejó de ser el camino: quien
  // atiende Y entra se da de alta en Acceso, que resuelve las dos filas de una.
})

export type DatosBarbero = z.infer<typeof esquemaBarbero>

/**
 * «Yo también atiendo»: quien ya entra al sistema se abre su propia ficha.
 *
 * No lleva `membresiaId` — la de la sesión es la única que la API acepta ahí — ni
 * contacto: para quien tiene cuenta, el teléfono y el correo se leen de la suya.
 */
export const esquemaAtiendoYo = z.object({
  nombrePublico: z.string().min(2, "Mínimo 2 caracteres").max(120, "Máximo 120"),
  titulo: z.string().max(120, "Máximo 120").optional(),
  comisionBps: z.number().int().min(0).max(MAX_COMISION_BPS).optional(),
  sedeId: z.uuid().optional(),
})

export type DatosAtiendoYo = z.infer<typeof esquemaAtiendoYo>

const tramo = z.object({
  diaSemana: z.number().int().min(0).max(6),
  inicio: z.string().regex(HORA, "Formato HH:mm"),
  fin: z.string().regex(HORA, "Formato HH:mm"),
})

/**
 * La semana COMPLETA: es lo único que permite quitar un tramo. Los solapes los
 * rechazaría igual la API, pero comprobarlos aquí evita un viaje de ida y vuelta
 * para decir algo que ya se sabe en el formulario.
 */
export const esquemaJornada = z
  .object({ tramos: z.array(tramo) })
  .refine(({ tramos }) => tramos.every((t) => aMinutos(t.fin) > aMinutos(t.inicio)), {
    message: "Un tramo termina antes de empezar",
    path: ["tramos"],
  })
  .refine(({ tramos }) => !haySolape(tramos), {
    message: "Dos tramos del mismo día se solapan",
    path: ["tramos"],
  })

export type DatosJornada = z.infer<typeof esquemaJornada>

export const esquemaAusencia = z
  .object({
    iniciaEn: z.iso.datetime("Instante inválido"),
    terminaEn: z.iso.datetime("Instante inválido"),
    tipo: z.enum(["vacaciones", "incapacidad", "permiso", "bloqueo"]),
    motivo: z.string().min(2, "Mínimo 2 caracteres").max(200, "Máximo 200").optional(),
  })
  .refine(({ iniciaEn, terminaEn }) => terminaEn > iniciaEn, {
    message: "La ausencia termina antes de empezar",
    path: ["terminaEn"],
  })

export type DatosAusencia = z.infer<typeof esquemaAusencia>

export const esquemaExcepcion = z
  .object({
    fecha: z.string().regex(FECHA, "Formato AAAA-MM-DD"),
    cerrado: z.boolean(),
    inicio: z.string().regex(HORA, "Formato HH:mm").optional(),
    fin: z.string().regex(HORA, "Formato HH:mm").optional(),
    motivo: z.string().max(200, "Máximo 200").optional(),
  })
  .refine(({ cerrado, inicio, fin }) => cerrado || (Boolean(inicio) && Boolean(fin)), {
    message: "Un día con jornada especial necesita hora de inicio y de fin",
    path: ["inicio"],
  })

export type DatosExcepcion = z.infer<typeof esquemaExcepcion>

function aMinutos(hora: string): number {
  const [hh, mm] = hora.split(":")
  return Number(hh) * 60 + Number(mm)
}

// Rango semiabierto: terminar a las 13:00 y volver a empezar a las 13:00 no es solape.
function haySolape(tramos: { diaSemana: number; inicio: string; fin: string }[]): boolean {
  return tramos.some((uno, i) =>
    tramos.some(
      (otro, j) =>
        j > i &&
        uno.diaSemana === otro.diaSemana &&
        aMinutos(uno.inicio) < aMinutos(otro.fin) &&
        aMinutos(otro.inicio) < aMinutos(uno.fin)
    )
  )
}
