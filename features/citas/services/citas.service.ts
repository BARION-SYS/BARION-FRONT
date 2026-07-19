import type { ApiResult } from "@shared/types/api.types"
import type {
  CitaCalendario,
  EstadoCita,
  SemanaCalendario,
} from "@features/citas/types/citas.types"
import { esquemaCita, type DatosCita } from "@features/citas/schemas/citas.schema"
import datos from "@features/citas/constants/citas.json"

// Capa mock — al integrar la API se reemplaza por llamadas con api de shared/http/api.

function ok<T>(data: T, message = "ok"): ApiResult<T> {
  return { data, status: 200, message, pagination: null }
}

// Mismo mapeo estado → token de gráfica que trae el mock.
const colorPorEstado: Record<EstadoCita, string> = {
  completada: "var(--chart-2)",
  "en-curso": "var(--chart-1)",
  confirmada: "var(--chart-3)",
  pendiente: "var(--chart-4)",
  cancelada: "var(--chart-5)",
}

// Copia en memoria del JSON — las mutaciones se ven al refetchear, mismo flujo que con la API real.
let citas: CitaCalendario[] = (datos.citas as CitaCalendario[]).map((cita) => ({ ...cita }))

function buscarCita(id: number): CitaCalendario {
  const cita = citas.find((c) => c.id === id)
  if (!cita) throw new Error("La cita no existe")
  return cita
}

// Singleton del feat — única puerta de acceso a los datos de citas.
export const citasService = {
  async obtenerSemanaCalendario(): Promise<ApiResult<SemanaCalendario>> {
    return ok(datos.semana as SemanaCalendario)
  },

  async obtenerCitasCalendario(): Promise<ApiResult<CitaCalendario[]>> {
    return ok([...citas])
  },

  // Mock — al integrar: POST /v1/appointments.
  async crearCita(payload: DatosCita): Promise<ApiResult<null>> {
    const datosCita = esquemaCita.parse(payload)
    const id = citas.reduce((max, c) => Math.max(max, c.id), 0) + 1
    citas.push({ id, ...datosCita, estado: "confirmada", color: colorPorEstado.confirmada })
    return ok(null, "Cita agendada")
  },

  // Mock — al integrar: PUT /v1/appointments/:id. Mantiene estado y color.
  async reagendarCita(id: number, payload: DatosCita): Promise<ApiResult<null>> {
    const datosCita = esquemaCita.parse(payload)
    Object.assign(buscarCita(id), datosCita)
    return ok(null, "Cita reagendada")
  },

  // Mock — al integrar: PATCH /v1/appointments/:id/cancel.
  async cancelarCita(id: number): Promise<ApiResult<null>> {
    const cita = buscarCita(id)
    cita.estado = "cancelada"
    cita.color = colorPorEstado.cancelada
    return ok(null, "Cita cancelada")
  },

  // Mock — al integrar: DELETE /v1/appointments/:id.
  async eliminarCita(id: number): Promise<ApiResult<null>> {
    buscarCita(id)
    citas = citas.filter((c) => c.id !== id)
    return ok(null, "Cita eliminada")
  },
}
