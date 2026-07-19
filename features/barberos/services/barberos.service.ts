import type { ApiResult } from "@shared/types/api.types"
import type { Barbero } from "@features/barberos/types/barberos.types"
import { esquemaBarbero, type DatosBarbero } from "@features/barberos/schemas/barberos.schema"
import datos from "@features/barberos/constants/barberos.json"

function ok<T>(data: T, message = "ok"): ApiResult<T> {
  return { data, status: 200, message, pagination: null }
}

// Copia en memoria del mock — las mutaciones la modifican y el refetch del padre ve el cambio.
let barberos: Barbero[] = (datos.barberos as Barbero[]).map((barbero) => ({ ...barbero }))

const coloresChart = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"]

function inicialesDe(nombre: string): string {
  const partes = nombre.trim().split(/\s+/)
  return `${partes[0]?.[0] ?? ""}${partes[1]?.[0] ?? ""}`.toUpperCase()
}

// Singleton mock — al integrar la API cada método pasa a usar el api-client.
export const barberosService = {
  async obtenerBarberos(): Promise<ApiResult<Barbero[]>> {
    return ok(barberos)
  },

  // Mock — al integrar: POST /v1/barbers.
  async crearBarbero(payload: DatosBarbero): Promise<ApiResult<null>> {
    const validos = esquemaBarbero.parse(payload)
    const id = barberos.reduce((max, barbero) => Math.max(max, barbero.id), 0) + 1
    barberos = [
      ...barberos,
      {
        id,
        nombre: validos.nombre,
        rol: validos.rol,
        iniciales: inicialesDe(validos.nombre),
        color: coloresChart[(id - 1) % coloresChart.length],
        calificacion: 0,
        resenas: 0,
        estado: "activo",
        horario: "Lun – Sáb · 09:00 – 19:00",
        diasLaborales: validos.diasLaborales ?? [true, true, true, true, true, true, false],
        servicios: [],
        estadisticas: {
          citas: 0,
          ingresos: 0,
          comision: 0,
          porcentajeComision: validos.porcentajeComision,
          horasPorDia: 0,
        },
        citasSemana: [0, 0, 0, 0, 0, 0, 0],
        telefono: validos.telefono,
        correo: validos.correo,
      },
    ]
    return ok(null, "Barbero agregado al equipo")
  },

  // Mock — al integrar: PUT /v1/barbers/:id.
  async actualizarBarbero(id: number, payload: DatosBarbero): Promise<ApiResult<null>> {
    const validos = esquemaBarbero.parse(payload)
    barberos = barberos.map((barbero) =>
      barbero.id === id
        ? {
            ...barbero,
            nombre: validos.nombre,
            rol: validos.rol,
            iniciales: inicialesDe(validos.nombre),
            telefono: validos.telefono,
            correo: validos.correo,
            diasLaborales: validos.diasLaborales ?? barbero.diasLaborales,
            estadisticas: {
              ...barbero.estadisticas,
              porcentajeComision: validos.porcentajeComision,
            },
          }
        : barbero
    )
    return ok(null, "Barbero actualizado")
  },

  // Mock — al integrar: DELETE /v1/barbers/:id.
  async eliminarBarbero(id: number): Promise<ApiResult<null>> {
    barberos = barberos.filter((barbero) => barbero.id !== id)
    return ok(null, "Barbero eliminado")
  },
}
