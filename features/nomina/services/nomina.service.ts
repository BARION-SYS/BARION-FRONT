import type { ApiResult } from "@shared/types/api.types"
import type {
  NominaBarbero,
  OpcionPeriodoNomina,
  PeriodoNomina,
} from "@features/nomina/types/nomina.types"
import datos from "@features/nomina/constants/nomina.json"

// Mock — al integrar la API se reemplaza por llamadas con api de shared/http/api.

function ok<T>(data: T): ApiResult<T> {
  return { data, status: 200, message: "ok", pagination: null }
}

export const nominaService = {
  async obtenerPeriodos(): Promise<ApiResult<OpcionPeriodoNomina[]>> {
    return ok(datos.periodos as OpcionPeriodoNomina[])
  },

  async obtenerNominaBarberos(_periodo: PeriodoNomina): Promise<ApiResult<NominaBarbero[]>> {
    return ok(datos.nominaBarberos as NominaBarbero[])
  },
}
