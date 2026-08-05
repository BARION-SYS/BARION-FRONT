import { api } from "@lib/http/instances"
import {
  esquemaGuardarMedioPago,
  type DatosGuardarMedioPago,
} from "@features/pagos/schemas/pagos.schema"
import type {
  ConfiguracionPasarela,
  EnlacePago,
  MedioPago,
} from "@features/pagos/types/pagos.types"
import type { ApiResult } from "@shared/types/api.types"

/**
 * El medio de pago de la suscripción, contra la api de Barion.
 *
 * Aquí no hay ni un dígito de tarjeta: lo que se envía es el token de un solo
 * uso que la pasarela produjo en el navegador (ver `wompi.service.ts`).
 */
export const pagosService = {
  /**
   * Con qué pasarela y con qué llave hay que tokenizar. Un país sin pasarela
   * responde 422 con el mensaje que hay que enseñar tal cual.
   */
  async obtenerConfiguracion(): Promise<ApiResult<ConfiguracionPasarela>> {
    return api.get<ConfiguracionPasarela>("/suscripcion/medio-pago/configuracion")
  },

  /**
   * Los vigentes: el activo y los que el proveedor marcó como inválidos. Los
   * retirados no se listan, y una lista vacía es un 200 legítimo.
   */
  async listarMediosPago(): Promise<ApiResult<MedioPago[]>> {
    return api.get<MedioPago[]>("/suscripcion/medio-pago")
  },

  /** El nuevo queda como predeterminado y el anterior deja de serlo, en la misma operación. */
  async guardarMedioPago(payload: DatosGuardarMedioPago): Promise<ApiResult<MedioPago>> {
    return api.post<MedioPago>("/suscripcion/medio-pago", esquemaGuardarMedioPago.parse(payload))
  },

  /**
   * No borra: queda retirado y deja de listarse. **Ningún otro hereda el puesto
   * de predeterminado**, y el `message` de la respuesta lo avisa cuando la
   * barbería se queda sin con qué pagar.
   */
  async retirarMedioPago(medioPagoId: string): Promise<ApiResult<MedioPago>> {
    return api.delete<MedioPago>(`/suscripcion/medio-pago/${medioPagoId}`)
  },

  /**
   * Genera un enlace compartible para pagar la suscripción. **Sin cuerpo**: el
   * importe es el de la tarifa vigente del plan y no se manda desde aquí —
   * dejarlo elegir sería dejar elegir cuánto se paga.
   */
  async generarEnlacePago(): Promise<ApiResult<EnlacePago>> {
    return api.post<EnlacePago>("/suscripcion/enlaces-pago")
  },

  /** El historial, del más reciente al más antiguo. No pagina. */
  async listarEnlacesPago(): Promise<ApiResult<EnlacePago[]>> {
    return api.get<EnlacePago[]>("/suscripcion/enlaces-pago")
  },
}
