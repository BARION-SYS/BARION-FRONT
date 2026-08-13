import { api } from "@lib/http/instances"
import { omitEmpty } from "@shared/utils/params"
import type { FiltrosGanancias, Ganancia, ResumenNomina } from "@features/nomina/types/nomina.types"
import type { ApiResult } from "@shared/types/api.types"

/**
 * Ganancias del barbero. **Solo lectura**: los asientos los escribe la api al
 * cerrar una cita, y no hay ruta que los cree ni los edite.
 *
 * Las dos rutas responden a dos preguntas con el mismo código: con
 * `ganancias.ver` vuelve la barbería entera, con `ganancias.ver_propias` solo lo
 * del barbero de la sesión —y el `barberoId` que se mande se ignora—. No hay
 * `/mias` que llamar.
 */
export const nominaService = {
  /** La nómina del rango: una fila por barbero y moneda, ya sumada. */
  async obtenerResumen(filtros: FiltrosGanancias = {}): Promise<ApiResult<ResumenNomina[]>> {
    return api.get<ResumenNomina[]>("/ganancias/resumen", {
      params: omitEmpty({ ...filtros }),
    })
  },

  /** Los asientos que sostienen cada cifra del resumen. */
  async obtenerGanancias(filtros: FiltrosGanancias = {}): Promise<ApiResult<Ganancia[]>> {
    return api.get<Ganancia[]>("/ganancias", { params: omitEmpty({ ...filtros }) })
  },

  /**
   * Añade un asiento de ajuste. El monto llega en CENTAVOS y con signo: la
   * conversión desde lo que se teclea la hace quien conoce la moneda de la sede.
   */
  async registrarAjuste(payload: {
    barberoId: string
    montoCentavos: string
    moneda: string
    motivo: string
    ganadoEn?: string
  }): Promise<ApiResult<Ganancia>> {
    return api.post<Ganancia>("/ganancias/ajustes", omitEmpty({ ...payload }))
  },
}
