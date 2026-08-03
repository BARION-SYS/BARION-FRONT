import { api } from "@lib/http/instances"
import { omitEmpty } from "@shared/utils/params"
import type {
  ActividadQr,
  FiltrosActividadQr,
  RangoQr,
  ResumenQr,
} from "@features/qr/types/qr.types"
import type { ApiResult } from "@shared/types/api.types"

/**
 * Las cifras del QR. Ambas rutas piden `reportes.ver` y **ninguna acepta
 * `sedeId`**: de las dos huellas del cartón solo la cita tiene sede, así que un
 * filtro por sede significaría cosas distintas en cada número de la respuesta.
 * El desglose va dentro, en `porSede`.
 *
 * El enlace del cartón NO sale de aquí: lo compone la pantalla con el `slug` de
 * la barbería y el `slugQr` de la sede.
 */
export const qrService = {
  async obtenerResumen(rango: RangoQr): Promise<ApiResult<ResumenQr>> {
    return api.get<ResumenQr>("/reportes/qr", { params: omitEmpty({ ...rango }) })
  },

  async obtenerActividad(filtros: FiltrosActividadQr): Promise<ApiResult<ActividadQr[]>> {
    return api.get<ActividadQr[]>("/reportes/qr/actividad", {
      params: omitEmpty({ ...filtros }),
    })
  },
}
