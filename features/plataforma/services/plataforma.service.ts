import { api } from "@lib/http/instances"
import { omitEmpty } from "@shared/utils/params"
import {
  esquemaAltaBarberia,
  esquemaCambioEstado,
  type DatosAltaBarberia,
  type DatosCambioEstado,
} from "@features/plataforma/schemas/plataforma.schema"
import type {
  BarberiaFicha,
  BarberiaInventario,
  FiltrosInventario,
} from "@features/plataforma/types/plataforma.types"
import type { ApiResult } from "@shared/types/api.types"

// Administración del SaaS. Solo la alcanza una sesión de staff de Barion: con
// cualquier otra, la API responde 403 en todas estas rutas.
export const plataformaService = {
  async obtenerBarberias(
    filtros: FiltrosInventario = {}
  ): Promise<ApiResult<BarberiaInventario[]>> {
    return api.get<BarberiaInventario[]>("/plataforma/barberias", {
      params: omitEmpty({ ...filtros }),
    })
  },

  async obtenerBarberia(id: string): Promise<ApiResult<BarberiaFicha>> {
    return api.get<BarberiaFicha>(`/plataforma/barberias/${id}`)
  },

  /**
   * Crea la barbería entera: sede inicial, propietario con credencial temporal
   * y suscripción de prueba. Devuelve la ficha, de donde sale el enlace que se
   * le entrega al cliente.
   */
  async crearBarberia(payload: DatosAltaBarberia): Promise<ApiResult<BarberiaFicha>> {
    const validos = esquemaAltaBarberia.parse(payload)
    // Los opcionales vacíos no viajan: la API decide su valor por defecto y
    // mandarlos en blanco la obligaría a distinguir "" de ausente.
    return api.post<BarberiaFicha>("/plataforma/barberias", omitEmpty({ ...validos }))
  },

  async cambiarEstadoBarberia(
    id: string,
    payload: DatosCambioEstado
  ): Promise<ApiResult<BarberiaFicha>> {
    const validos = esquemaCambioEstado.parse(payload)
    return api.post<BarberiaFicha>(`/plataforma/barberias/${id}/estado`, validos)
  },
}
