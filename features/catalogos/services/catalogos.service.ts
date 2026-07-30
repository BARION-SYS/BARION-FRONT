import { api } from "@lib/http/instances"
import type { Catalogos } from "@features/catalogos/types/catalogos.types"
import type { ApiResult } from "@shared/types/api.types"

export const catalogosService = {
  /** Valores fijos que la base valida por CHECK o por enum nativo. */
  async obtenerCatalogos(): Promise<ApiResult<Catalogos>> {
    return api.get<Catalogos>("/catalogos")
  },
}
