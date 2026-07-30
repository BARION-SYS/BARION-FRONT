import type { ApiResult } from "@shared/types/api.types"
import { esquemaCliente, type DatosCliente } from "@features/clientes/schemas/clientes.schema"
import type {
  Cliente,
  ResumenClientes,
  ServicioHistorial,
} from "@features/clientes/types/clientes.types"
import datos from "@features/clientes/constants/clientes.json"

// Mock — al integrar la API cada método pasa a usar el cliente HTTP compartido.

// Copia EN MEMORIA del JSON: las mutaciones la modifican, el JSON nunca se toca.
let clientes: Cliente[] = [...(datos.clientes as Cliente[])]

// Mock: mismo historial para cualquier cliente.
const MOCK_HISTORIAL = datos.historial as ServicioHistorial[]

function ok<T>(data: T, message = "ok"): ApiResult<T> {
  return { data, status: 200, message, pagination: null }
}

// Iniciales a partir del nombre: primera letra de las dos primeras palabras.
function inicialesDe(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra[0].toUpperCase())
    .join("")
}

// Singleton del feat: siempre importar esta instancia, nunca re-crear.
export const clientesService = {
  async obtenerClientes(): Promise<ApiResult<Cliente[]>> {
    return ok([...clientes])
  },

  async obtenerHistorialServicios(
    _clienteId: Cliente["id"]
  ): Promise<ApiResult<ServicioHistorial[]>> {
    return ok(MOCK_HISTORIAL)
  },

  async obtenerResumenClientes(): Promise<ApiResult<ResumenClientes>> {
    return ok({ totalClientes: clientes.length, nuevosHoy: datos.resumen.nuevosHoy })
  },

  async crearCliente(payload: DatosCliente): Promise<ApiResult<null>> {
    const validos = esquemaCliente.parse(payload)
    const nuevo: Cliente = {
      ...validos,
      id: clientes.reduce((max, c) => Math.max(max, c.id), 0) + 1,
      iniciales: inicialesDe(validos.nombre),
      visitas: 0,
      ultimaVisitaEn: new Date().toISOString(),
      gastadoTotal: 0,
    }
    clientes.push(nuevo)
    return ok(null, "Cliente creado correctamente")
  },

  async actualizarCliente(id: Cliente["id"], payload: DatosCliente): Promise<ApiResult<null>> {
    const validos = esquemaCliente.parse(payload)
    clientes = clientes.map((c) =>
      c.id === id ? { ...c, ...validos, iniciales: inicialesDe(validos.nombre) } : c
    )
    return ok(null, "Cliente actualizado")
  },

  async eliminarCliente(id: Cliente["id"]): Promise<ApiResult<null>> {
    clientes = clientes.filter((c) => c.id !== id)
    return ok(null, "Cliente eliminado")
  },
}
