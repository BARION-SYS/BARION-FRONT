import { api } from "@lib/http/instances"
import { omitEmpty } from "@shared/utils/params"
import { armarCriterio } from "@features/segmentos/utils/criterio"
import { esquemaSegmento, type DatosSegmento } from "@features/segmentos/schemas/segmentos.schema"
import type { FiltrosSegmentos, Segmento } from "@features/segmentos/types/segmentos.types"
import type { ApiResult } from "@shared/types/api.types"

function aCuerpo(datos: DatosSegmento): Record<string, unknown> {
  const validos = esquemaSegmento.parse(datos)
  return omitEmpty({
    nombre: validos.nombre,
    descripcion: validos.descripcion,
    esEtiqueta: validos.esEtiqueta,
    prioridad: validos.prioridad ? Number(validos.prioridad) : undefined,
    criterio: armarCriterio(validos),
  })
}

export const segmentosService = {
  async obtenerSegmentos(filtros: FiltrosSegmentos = {}): Promise<ApiResult<Segmento[]>> {
    return api.get<Segmento[]>("/segmentos", { params: omitEmpty({ ...filtros }) })
  },

  /**
   * El `tipo` solo viaja al CREAR. La api no lo admite en el `PATCH` y hace
   * bien: cambiarlo dejaría los miembros que ya tiene sin nadie que los
   * mantenga —ni el job ni una persona—, y un segmento a medio llenar se sigue
   * pintando junto al cliente.
   */
  async crearSegmento(datos: DatosSegmento): Promise<ApiResult<Segmento>> {
    return api.post<Segmento>("/segmentos", { ...aCuerpo(datos), tipo: datos.tipo })
  },

  async actualizarSegmento(id: string, datos: DatosSegmento): Promise<ApiResult<Segmento>> {
    return api.patch<Segmento>(`/segmentos/${id}`, aCuerpo(datos))
  },

  /** Baja lógica: deja de etiquetar y conserva su rastro. */
  async desactivarSegmento(id: string): Promise<ApiResult<null>> {
    return api.delete<null>(`/segmentos/${id}`)
  },

  async activarSegmento(id: string): Promise<ApiResult<Segmento>> {
    return api.post<Segmento>(`/segmentos/${id}/activar`)
  },
}
