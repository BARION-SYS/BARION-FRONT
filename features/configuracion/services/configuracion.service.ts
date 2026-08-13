import { Bell, CreditCard, Palette, Shield, Store } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { api } from "@lib/http/instances"
import { omitEmpty } from "@shared/utils/params"
import datos from "@features/configuracion/constants/configuracion.json"
import {
  esquemaFicha,
  esquemaGeneral,
  esquemaSeguridad,
  type DatosFicha,
  type DatosGeneral,
  type DatosSeguridad,
} from "@features/configuracion/schemas/configuracion.schema"
import type {
  Barberia,
  InfoCanalNotificacion,
  SeccionConfiguracion,
} from "@features/configuracion/types/configuracion.types"
import type { ApiResult } from "@shared/types/api.types"

// La barbería, su ficha y el cambio de contraseña van contra la API. Siguen en
// mock las secciones sin contrato: el catálogo de secciones y los canales de
// notificación.
//
// Los COLORES del panel no están aquí y no lo estarán: son preferencia de quien
// mira la pantalla y viven en `store/marca.store.ts`, en este navegador.
//
// El catálogo de servicios NO está aquí a propósito: es de la fase 4 y nacerá
// como su propia feature contra el contrato real. Tenerlo en Configuración
// dejaría precios inventados que nadie guarda, y dos sitios donde vivirían los
// servicios el día que existan.

function ok<T>(data: T, message = "ok"): ApiResult<T> {
  return { data, status: 200, message, pagination: null }
}

// Los íconos no son serializables: en el JSON viajan como nombre string y aquí se resuelven al componente real.
const iconosSeccion: Record<string, LucideIcon> = {
  Bell,
  CreditCard,
  Palette,
  Shield,
  Store,
}

export const configuracionService = {
  async obtenerSecciones(): Promise<ApiResult<SeccionConfiguracion[]>> {
    return ok(
      datos.secciones.map(
        (seccion): SeccionConfiguracion =>
          ({ ...seccion, icono: iconosSeccion[seccion.icono] }) as SeccionConfiguracion
      )
    )
  },

  async obtenerBarberia(): Promise<ApiResult<Barberia>> {
    return api.get<Barberia>("/barberias/mi")
  },

  async obtenerCanales(): Promise<ApiResult<InfoCanalNotificacion[]>> {
    return ok(datos.canales as InfoCanalNotificacion[])
  },

  async guardarGeneral(payload: DatosGeneral): Promise<ApiResult<Barberia>> {
    const validos = esquemaGeneral.parse(payload)
    // Los opcionales vacíos no viajan: omitirlos deja el campo como está, que no
    // es lo mismo que mandarlos en blanco.
    return api.patch<Barberia>("/barberias/mi", omitEmpty({ ...validos }))
  },

  /**
   * El texto del portal. Va aparte de `guardarGeneral` porque son dos endpoints
   * distintos: la identidad fiscal y la cara pública se tocan por separado.
   */
  async guardarFicha(payload: DatosFicha): Promise<ApiResult<Barberia>> {
    const validos = esquemaFicha.parse(payload)
    // `ventajas` viaja siempre, incluso vacío: es la única forma de borrarlas.
    return api.patch<Barberia>("/barberias/mi/ficha", {
      ...omitEmpty({ eslogan: validos.eslogan, descripcion: validos.descripcion }),
      ventajas: validos.ventajas,
    })
  },

  /**
   * La confirmación NO viaja: es una comprobación del formulario y la API
   * rechaza cualquier propiedad que no declare su DTO.
   */
  async actualizarContrasena(payload: DatosSeguridad): Promise<ApiResult<null>> {
    const { contrasenaActual, contrasenaNueva } = esquemaSeguridad.parse(payload)
    return api.post<null>("/auth/cambiar-contrasena", { contrasenaActual, contrasenaNueva })
  },

  /**
   * Reenvía el correo que publica la barbería. Va al correo del propietario, no
   * al de quien lo pide: es la dirección que hay que confirmar.
   */
  async reenviarVerificacion(): Promise<ApiResult<{ email: string | null }>> {
    return api.post<{ email: string | null }>("/verificacion/reenviar", {})
  },
}
