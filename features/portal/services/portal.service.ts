import datos from "@features/portal/constants/portal.json"
import {
  esquemaAcceso,
  esquemaCodigo,
  esquemaRegistro,
  esquemaReserva,
  type DatosAcceso,
  type DatosCodigo,
  type DatosRegistro,
  type DatosReserva,
} from "@features/portal/schemas/portal.schema"
import type {
  BarberiaPortal,
  BarberoPortal,
  CitaCliente,
  ClientePortal,
  DiaAgenda,
  FranjaAgenda,
  ReservaConfirmada,
  ServicioPortal,
} from "@features/portal/types/portal.types"
import type { ApiResult } from "@shared/types/api.types"

// Capa mock — al integrar, cada método reemplaza su cuerpo por api.get/post(...) de @lib/http/instances.

function ok<T>(data: T, message = "ok"): ApiResult<T> {
  return { data, status: 200, message, pagination: null }
}

// Mock: la sede opera en America/Bogota (UTC-5). La API real ya entrega UTC calculado en el back.
const OFFSET_SEDE_HORAS = -5
const DIAS_AGENDA = 12
const PASO_FRANJA_MIN = 30

const barberia = datos.barberia as BarberiaPortal
const servicios = datos.servicios as ServicioPortal[]
const barberos = datos.barberos as BarberoPortal[]

/** Partes del calendario local de la sede (se manipulan como UTC y se corrigen al serializar). */
function hoyEnSede(): { anio: number; mes: number; dia: number } {
  const local = new Date(Date.now() + OFFSET_SEDE_HORAS * 3_600_000)
  return { anio: local.getUTCFullYear(), mes: local.getUTCMonth(), dia: local.getUTCDate() }
}

/** Hora local de la sede → instante UTC (ISO 8601), que es lo que viaja por la API. */
function utcDesdeSede(anio: number, mes: number, dia: number, minutos: number): string {
  return new Date(Date.UTC(anio, mes, dia, 0, minutos - OFFSET_SEDE_HORAS * 60)).toISOString()
}

function minutosDe(hora: string): number {
  const [h, m] = hora.split(":").map(Number)
  return h * 60 + m
}

// Disponibilidad determinista: mismo día + barbero → mismas franjas libres en cada refetch.
function estaLibre(indiceDia: number, indiceFranja: number, barberoId: number): boolean {
  return (indiceDia * 7 + indiceFranja * 13 + barberoId * 5) % 4 !== 0
}

function franjasDelDia(
  anio: number,
  mes: number,
  dia: number,
  indiceDia: number,
  barberoId: number,
  duracionMin: number
): FranjaAgenda[] {
  const fecha = new Date(Date.UTC(anio, mes, dia))
  // getUTCDay: 0 = domingo; los horarios del mock arrancan en lunes.
  const horario = barberia.horarios[(fecha.getUTCDay() + 6) % 7]
  if (!horario.abierto) return []

  const cierre = minutosDe(horario.cierre)
  const franjas: FranjaAgenda[] = []
  for (
    let minuto = minutosDe(horario.apertura), i = 0;
    minuto + duracionMin <= cierre;
    minuto += PASO_FRANJA_MIN, i++
  ) {
    const inicio = utcDesdeSede(anio, mes, dia, minuto)
    // Una franja que ya pasó nunca se ofrece.
    const pasada = new Date(inicio).getTime() <= Date.now()
    franjas.push({ inicio, disponible: !pasada && estaLibre(indiceDia, i, barberoId) })
  }
  return franjas
}

// Copia en memoria de las citas del cliente — las mutaciones la modifican y el refetch las ve.
let citasCliente: CitaCliente[] = (
  datos.citasCliente as (Omit<CitaCliente, "inicio"> & {
    diasDesdeHoy: number
    hora: string
  })[]
).map(({ diasDesdeHoy, hora, ...cita }) => {
  const { anio, mes, dia } = hoyEnSede()
  return { ...cita, inicio: utcDesdeSede(anio, mes, dia + diasDesdeHoy, minutosDe(hora)) }
})

// Clientes dados de alta desde el portal (mock). Al integrar viven en el tenant
// y son los mismos que lista el panel en dashboard/clientes.
let clientes: ClientePortal[] = []

function inicialesDe(nombre: string): string {
  const partes = nombre.trim().split(/\s+/)
  return `${partes[0]?.[0] ?? ""}${partes[1]?.[0] ?? ""}`.toUpperCase()
}

// Singleton del feat — única puerta de acceso a los datos del portal público.
export const portalService = {
  // Mock — al integrar: GET /v1/public/shops/:slug.
  async obtenerBarberia(slug: string): Promise<ApiResult<BarberiaPortal>> {
    return ok({ ...barberia, slug })
  },

  // Mock — al integrar: GET /v1/public/shops/:slug/services.
  async obtenerServicios(): Promise<ApiResult<ServicioPortal[]>> {
    return ok([...servicios])
  },

  // Mock — al integrar: GET /v1/public/shops/:slug/barbers.
  async obtenerBarberos(): Promise<ApiResult<BarberoPortal[]>> {
    return ok([...barberos])
  },

  // Mock — al integrar: GET /v1/public/shops/:slug/availability?services=&barber=.
  async obtenerAgenda(servicioIds: number[], barberoId: number): Promise<ApiResult<DiaAgenda[]>> {
    // La franja necesita el tiempo de TODOS los servicios pedidos, no de uno solo.
    const duracion =
      servicios
        .filter((s) => servicioIds.includes(s.id))
        .reduce((total, s) => total + s.duracionMin, 0) || PASO_FRANJA_MIN
    const { anio, mes, dia } = hoyEnSede()

    const agenda = Array.from({ length: DIAS_AGENDA }, (_, indice): DiaAgenda => {
      const franjas = franjasDelDia(anio, mes, dia + indice, indice, barberoId, duracion)
      return {
        fecha: utcDesdeSede(anio, mes, dia + indice, 0),
        cupos: franjas.filter((franja) => franja.disponible).length,
        franjas,
      }
    })
    return ok(agenda)
  },

  // Mock — al integrar: POST /v1/public/otp (envío del código al celular).
  async solicitarCodigo(payload: DatosAcceso): Promise<ApiResult<null>> {
    esquemaAcceso.parse(payload)
    return ok(null, "Te enviamos un código por WhatsApp")
  },

  // Mock — al integrar: POST /v1/public/shops/:slug/customers (crea el cliente del tenant).
  async registrarCliente(payload: DatosRegistro): Promise<ApiResult<ClientePortal>> {
    const datosCliente = esquemaRegistro.parse(payload)
    const existente = clientes.find((c) => c.telefono === datosCliente.telefono)
    if (existente) throw new Error("Ese celular ya tiene perfil en esta barbería")

    const cliente: ClientePortal = {
      id: clientes.reduce((max, c) => Math.max(max, c.id), 0) + 1,
      nombre: datosCliente.nombre,
      iniciales: inicialesDe(datosCliente.nombre),
      telefono: datosCliente.telefono,
      correo: datosCliente.correo || undefined,
      barberoFavorito: datosCliente.barberoFavorito || undefined,
      etiqueta: "Nuevo",
      desde: new Date().toISOString(),
    }
    clientes = [...clientes, cliente]
    return ok(cliente, `¡Listo, ${cliente.nombre}! Tu perfil quedó creado`)
  },

  // Mock — al integrar: POST /v1/public/bookings (con el código de verificación).
  async confirmarReserva(
    payload: DatosReserva,
    codigo: DatosCodigo
  ): Promise<ApiResult<ReservaConfirmada>> {
    const reserva = esquemaReserva.parse(payload)
    esquemaCodigo.parse(codigo)

    const lineasServicio = servicios
      .filter((s) => reserva.servicioIds.includes(s.id))
      .map((s) => ({
        servicioId: s.id,
        nombre: s.nombre,
        precio: s.precio,
        duracionMin: s.duracionMin,
      }))
    if (lineasServicio.length === 0) throw new Error("El servicio ya no está disponible")
    const barbero = barberos.find((b) => b.id === reserva.barberoId) ?? barberos[0]

    const confirmada: ReservaConfirmada = {
      codigo: `REY-${String(4900 + citasCliente.length)}`,
      inicio: reserva.inicio,
      lineasServicio,
      barbero: barbero.id === 0 ? "Primer barbero disponible" : barbero.nombre,
      cliente: reserva.nombre,
    }

    citasCliente = [
      {
        id: citasCliente.reduce((max, cita) => Math.max(max, cita.id), 0) + 1,
        codigo: confirmada.codigo,
        inicio: confirmada.inicio,
        lineasServicio: confirmada.lineasServicio,
        barbero: confirmada.barbero,
        estado: "confirmada",
      },
      ...citasCliente,
    ]

    return ok(confirmada, "¡Cita confirmada! Te llegará el recordatorio por WhatsApp")
  },

  // Mock — al integrar: GET /v1/public/bookings?phone= (tras verificar el código).
  async obtenerCitasCliente(payload: DatosAcceso): Promise<ApiResult<CitaCliente[]>> {
    esquemaAcceso.parse(payload)
    return ok([...citasCliente].sort((a, b) => b.inicio.localeCompare(a.inicio)))
  },

  // Mock — al integrar: PATCH /v1/public/bookings/:id/cancel.
  async cancelarCitaCliente(id: number): Promise<ApiResult<null>> {
    const cita = citasCliente.find((c) => c.id === id)
    if (!cita) throw new Error("La cita no existe")
    cita.estado = "cancelada"
    return ok(null, "Tu cita fue cancelada")
  },
}
