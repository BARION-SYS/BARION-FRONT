import { api } from "@lib/http/instances"
import { omitEmpty } from "@shared/utils/params"
import {
  esquemaDatosFiscales,
  esquemaElegirPlan,
  type DatosDatosFiscales,
  type DatosElegirPlan,
} from "@features/suscripcion/schemas/suscripcion.schema"
import type {
  DatosFiscales,
  DatosFiscalesDeLaBarberia,
  Factura,
  FacturaDetalle,
  FiltrosFacturas,
  PlanPublicado,
  Suscripcion,
} from "@features/suscripcion/types/suscripcion.types"
import type { ApiResult } from "@shared/types/api.types"

export const suscripcionService = {
  async obtenerSuscripcion(): Promise<ApiResult<Suscripcion>> {
    return api.get<Suscripcion>("/suscripcion")
  },

  /**
   * El catálogo es PÚBLICO y se pide igual estando dentro: es la misma tabla de
   * precios que ve quien todavía no es cliente, y tener dos fuentes para el
   * mismo dato garantiza que un día digan cosas distintas.
   */
  async obtenerPlanes(): Promise<ApiResult<PlanPublicado[]>> {
    return api.get<PlanPublicado[]>("/publico/planes")
  },

  /** Contratar, subir y bajar son la misma ruta: las tres dejan el mismo estado. */
  async elegirPlan(payload: DatosElegirPlan): Promise<ApiResult<Suscripcion>> {
    return api.post<Suscripcion>("/suscripcion/plan", esquemaElegirPlan.parse(payload))
  },

  /** No corta el acceso: deja de renovar al final del período vigente. */
  async cancelarSuscripcion(): Promise<ApiResult<Suscripcion>> {
    return api.post<Suscripcion>("/suscripcion/cancelar", {})
  },

  async reanudarSuscripcion(): Promise<ApiResult<Suscripcion>> {
    return api.post<Suscripcion>("/suscripcion/reanudar", {})
  },

  /** Trae también el país: es quien decide qué campos pide el formulario. */
  async obtenerDatosFiscales(): Promise<ApiResult<DatosFiscalesDeLaBarberia>> {
    return api.get<DatosFiscalesDeLaBarberia>("/suscripcion/datos-fiscales")
  },

  /** `PUT`: el bloque se reemplaza entero, no se corrige por partes. */
  async guardarDatosFiscales(payload: DatosDatosFiscales): Promise<ApiResult<DatosFiscales>> {
    return api.put<DatosFiscales>(
      "/suscripcion/datos-fiscales",
      esquemaDatosFiscales.parse(payload)
    )
  },

  async obtenerFacturas(filtros: FiltrosFacturas = {}): Promise<ApiResult<Factura[]>> {
    return api.get<Factura[]>("/facturas", { params: omitEmpty({ ...filtros }) })
  },

  /**
   * El detalle añade el desglose, y por eso se pide de a una: el listado no lo
   * arrastra —son líneas para leer un documento, no para comparar doce—.
   */
  async obtenerFactura(facturaId: string): Promise<ApiResult<FacturaDetalle>> {
    return api.get<FacturaDetalle>(`/facturas/${facturaId}`)
  },
}
