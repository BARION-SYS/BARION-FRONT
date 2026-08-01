import { api } from "@lib/http/instances"
import { omitEmpty } from "@shared/utils/params"
import type {
  FiltrosMetas,
  Meta,
  RangoDias,
  RangoInstantes,
  RendimientoBarbero,
  ReporteDashboard,
  Serie,
  ServicioTop,
} from "@features/dashboard/types/dashboard.types"
import type { ApiResult } from "@shared/types/api.types"

/**
 * Reportería. **La api entrega números crudos**: el título, el ícono y la
 * comparación contra el período anterior los compone el front.
 *
 * Dos superficies con fuentes distintas, y el tipo del rango lo declara:
 * `dashboard` y `servicios` leen lo transaccional y se piden en INSTANTES;
 * `series` y `barberos` leen el agregado nocturno y se piden en DÍAS.
 */
export const dashboardService = {
  /** El pulso del rango — normalmente hoy. Siempre está al día. */
  async obtenerDashboard(rango: RangoInstantes): Promise<ApiResult<ReporteDashboard>> {
    return api.get<ReporteDashboard>("/reportes/dashboard", { params: omitEmpty({ ...rango }) })
  },

  /** La tendencia. Vuelve `disponible: false` mientras no exista el job del worker. */
  async obtenerSerie(rango: RangoDias): Promise<ApiResult<Serie>> {
    return api.get<Serie>("/reportes/series", { params: omitEmpty({ ...rango }) })
  },

  /** Rendimiento por barbero. Misma dependencia del job nocturno. */
  async obtenerRendimiento(rango: RangoDias): Promise<ApiResult<RendimientoBarbero[]>> {
    return api.get<RendimientoBarbero[]>("/reportes/barberos", { params: omitEmpty({ ...rango }) })
  },

  /** Los más vendidos del rango. Transaccional. */
  async obtenerServiciosTop(
    rango: RangoInstantes & { limite?: number }
  ): Promise<ApiResult<ServicioTop[]>> {
    return api.get<ServicioTop[]>("/reportes/servicios", { params: omitEmpty({ ...rango }) })
  },

  async obtenerMetas(filtros: FiltrosMetas = {}): Promise<ApiResult<Meta[]>> {
    return api.get<Meta[]>("/metas", { params: omitEmpty({ ...filtros }) })
  },
}
