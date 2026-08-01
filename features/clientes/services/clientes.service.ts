import { api } from "@lib/http/instances"
import { omitEmpty } from "@shared/utils/params"
import {
  esquemaCliente,
  esquemaConsentimiento,
  type DatosCliente,
  type DatosConsentimiento,
} from "@features/clientes/schemas/clientes.schema"
import type {
  Cliente,
  Consentimiento,
  Consentimientos,
  FiltrosClientes,
  Segmento,
  Visita,
} from "@features/clientes/types/clientes.types"
import type { ApiResult } from "@shared/types/api.types"

export const clientesService = {
  async obtenerClientes(filtros: FiltrosClientes = {}): Promise<ApiResult<Cliente[]>> {
    return api.get<Cliente[]>("/clientes", { params: omitEmpty({ ...filtros }) })
  },

  async crearCliente(payload: DatosCliente): Promise<ApiResult<Cliente>> {
    const validos = esquemaCliente.parse(payload)
    // Los opcionales vacíos no viajan: la API decide su valor por defecto y
    // mandarlos en blanco la obligaría a distinguir "" de ausente.
    return api.post<Cliente>("/clientes", omitEmpty({ ...validos }))
  },

  async actualizarCliente(id: string, payload: DatosCliente): Promise<ApiResult<Cliente>> {
    const validos = esquemaCliente.parse(payload)
    return api.patch<Cliente>(`/clientes/${id}`, omitEmpty({ ...validos }))
  },

  /** Sus visitas. Los importes vienen congelados de la cita. */
  async obtenerHistorial(id: string): Promise<ApiResult<Visita[]>> {
    return api.get<Visita[]>(`/clientes/${id}/historial`)
  },

  async obtenerConsentimientos(id: string): Promise<ApiResult<Consentimientos>> {
    return api.get<Consentimientos>(`/clientes/${id}/consentimientos`)
  },

  /** Registrar y revocar son lo mismo: una fila nueva, nunca un UPDATE. */
  async registrarConsentimiento(
    id: string,
    payload: DatosConsentimiento
  ): Promise<ApiResult<Consentimiento>> {
    const validos = esquemaConsentimiento.parse(payload)
    return api.post<Consentimiento>(`/clientes/${id}/consentimientos`, validos)
  },

  /** Derecho al olvido. Irreversible: no hay endpoint que lo deshaga. */
  async anonimizarCliente(id: string): Promise<ApiResult<Cliente>> {
    return api.post<Cliente>(`/clientes/${id}/anonimizar`, {})
  },

  async obtenerSegmentos(): Promise<ApiResult<Segmento[]>> {
    return api.get<Segmento[]>("/segmentos", {
      params: { paginar: false, soloActivos: true },
    })
  },
}
