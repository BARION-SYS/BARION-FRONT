// Tipos ESPEJO del contrato de la API (`/citas/**`, `/agenda/disponibilidad`),
// mantenidos a mano contra su Swagger — no se comparte código entre repos.
//
// Todo instante es UTC ISO-8601 y se formatea con `useFormato`, que usa la
// timezone de la SEDE. La `fecha` de un día de agenda, en cambio, es local: son
// cosas distintas y por eso tienen formatos distintos.

/** Igual al enum de la API (`GET /catalogos` → `estadosCita`), 8 en snake_case. */
export type EstadoCita =
  | "reservada"
  | "pendiente_confirmacion"
  | "confirmada"
  | "retrasada"
  | "en_curso"
  | "completada"
  | "cancelada"
  | "no_asistio"

export interface LineaServicioCita {
  id: string
  servicioId: string | null
  /** Congelado en la cita: no tiene por qué coincidir con el catálogo de hoy. */
  nombre: string
  precioCentavos: string
  duracionMin: number
}

export interface Cita {
  id: string
  sedeId: string
  barbero: { id: string; nombrePublico: string; indiceColor: number } | null
  cliente: {
    id: string
    nombre: string
    apellido: string | null
    telefonoE164: string
  } | null
  iniciaEn: string
  terminaEn: string
  /** Limpieza. Bloquea agenda y NO se le enseña al cliente. */
  bufferMin: number
  estado: EstadoCita
  servicios: LineaServicioCita[]
  precioCentavos: string
  moneda: string
  propinaCentavos: string | null
  metodoPago: string | null
  origen: string
  /** `/b/{slug}/seguimiento/{codigo}` — seguimiento sin sesión. */
  codigoSeguimiento: string
  notasCliente: string | null
  notasInternas: string | null
  confirmadaEn: string | null
  canceladaEn: string | null
  motivoCancelacion: string | null
  creadaPor: string | null
}

export interface AsientoHistorialCita {
  estadoAnterior: EstadoCita | null
  estadoNuevo: EstadoCita
  /** cliente | barbero | admin | sistema */
  actor: string
  motivo: string | null
  ocurridoEn: string
}

export interface FranjaAgenda {
  inicio: string
  disponible: boolean
  /** Quiénes pueden a esa hora. Con un barbero fijo, es él o nadie. */
  barberoIds: string[]
}

export interface DiaAgenda {
  /** Fecha LOCAL de la sede, `YYYY-MM-DD`. */
  fecha: string
  cupos: number
  franjas: FranjaAgenda[]
}

export interface Disponibilidad {
  sedeId: string
  zonaHoraria: string
  duracionMin: number
  bufferMin: number
  dias: DiaAgenda[]
}

export type VistaCalendario = "semana" | "dia" | "lista"

export interface FiltrosCitas {
  /** Instantes UTC. Se cruzan con el RANGO de la cita, no con su inicio. */
  desde?: string
  hasta?: string
  sedeId?: string
  barberoId?: string
  clienteId?: string
  estado?: EstadoCita
  paginar?: boolean
  page?: number
  limit?: number
}
