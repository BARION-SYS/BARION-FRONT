import { api } from "@lib/http/instances"
import { omitEmpty } from "@shared/utils/params"
import {
  esquemaAccionEnlace,
  esquemaCalificar,
  esquemaCancelar,
  esquemaCanje,
  esquemaPerfilCliente,
  esquemaPreferencia,
  esquemaReagendar,
  esquemaReserva,
  esquemaSolicitarCodigo,
  esquemaVerificarCodigo,
  type DatosCalificar,
  type DatosCancelar,
  type DatosCanje,
  type DatosAccionEnlace,
  type DatosPerfilCliente,
  type DatosPreferencia,
  type DatosReagendar,
  type DatosReserva,
  type DatosSolicitarCodigo,
  type DatosVerificarCodigo,
} from "@features/portal/schemas/portal.schema"
import type { Cliente, Consentimientos } from "@features/clientes/types/clientes.types"
import type {
  AccionEnlace,
  BarberiaPortal,
  BarberoPortal,
  CanjePortal,
  Cita,
  CodigoEmitido,
  DisponibilidadPortal,
  FidelidadPortal,
  FiltrosCitasCliente,
  PromocionPortal,
  SeguimientoPortal,
  ServicioPortal,
  SesionCliente,
} from "@features/portal/types/portal.types"
import type { ApiResult } from "@shared/types/api.types"

/**
 * Dos superficies en un solo service, igual que en la api: `/publico/**` sin
 * sesión y `/mi/**` con la cookie que deja el código.
 *
 * El **slug va en la ruta** de lo público; en `/mi/**` no aparece, porque la
 * barbería sale del token. No hay nada que guardar entre las dos: la sesión es una
 * cookie httpOnly que este código no puede leer, y basta `withCredentials`.
 */
export const portalService = {
  async obtenerBarberia(slug: string): Promise<ApiResult<BarberiaPortal>> {
    return api.get<BarberiaPortal>(`/publico/barberias/${slug}`)
  },

  async obtenerServicios(slug: string, sedeId?: string): Promise<ApiResult<ServicioPortal[]>> {
    return api.get<ServicioPortal[]>(`/publico/barberias/${slug}/servicios`, {
      params: omitEmpty({ sedeId }),
    })
  },

  async obtenerBarberos(slug: string, sedeId?: string): Promise<ApiResult<BarberoPortal[]>> {
    return api.get<BarberoPortal[]>(`/publico/barberias/${slug}/barberos`, {
      params: omitEmpty({ sedeId }),
    })
  },

  /**
   * Los huecos. **Propone, no aparta**: un 409 al reservar significa que alguien
   * se adelantó, y hay que volver a consultar en vez de reintentar.
   *
   * `ofertaIds` son de la oferta del barbero —es lo que mide cuánto hueco hace
   * falta—; con «cualquiera disponible» se manda la del primero que ofrezca todo.
   */
  async obtenerDisponibilidad(
    slug: string,
    consulta: {
      sedeId: string
      ofertaIds: string[]
      barberoId?: string
      desde: string
      dias?: number
    }
  ): Promise<ApiResult<DisponibilidadPortal>> {
    return api.get<DisponibilidadPortal>(`/publico/barberias/${slug}/disponibilidad`, {
      params: omitEmpty({ ...consulta }),
    })
  },

  async obtenerSeguimiento(slug: string, codigo: string): Promise<ApiResult<SeguimientoPortal>> {
    return api.get<SeguimientoPortal>(`/publico/barberias/${slug}/citas/${codigo}`)
  },

  /** Responde lo mismo exista o no ese canal: no hay forma de sondear clientela. */
  async solicitarCodigo(
    slug: string,
    payload: DatosSolicitarCodigo
  ): Promise<ApiResult<CodigoEmitido>> {
    const validos = esquemaSolicitarCodigo.parse(payload)
    return api.post<CodigoEmitido>(`/publico/barberias/${slug}/otp`, validos)
  },

  /**
   * Verificar **es** entrar, y la primera vez también registrarse. Deja la cookie
   * de sesión (30 días); no hay token que guardar.
   */
  async verificarCodigo(
    slug: string,
    payload: DatosVerificarCodigo
  ): Promise<ApiResult<SesionCliente>> {
    const validos = esquemaVerificarCodigo.parse(payload)
    return api.post<SesionCliente>(
      `/publico/barberias/${slug}/otp/verificar`,
      omitEmpty({ ...validos })
    )
  },

  /**
   * El enlace de un correo, ejecutado. **De un solo uso**: reenviarlo no cancela
   * dos veces.
   *
   * El token va en la RUTA y decide qué se hace —confirmar, cancelar, tomar un
   * cupo liberado, calificar o darse de baja—; el cuerpo solo aporta lo que el
   * token no puede llevar. No existe forma de preguntarle a la api qué propósito
   * tiene un token sin gastarlo: es ella quien lo resuelve al ejecutarlo.
   *
   * **Un rechazo no gasta el enlace** (`marcarUsado` corre después de aplicar),
   * y de ahí que la calificación y la cancelación se resuelvan en dos llamadas
   * al MISMO token: la primera vuelve con `motivo` diciendo qué falta.
   */
  async ejecutarAccionEnlace(
    slug: string,
    token: string,
    payload: DatosAccionEnlace = {}
  ): Promise<ApiResult<AccionEnlace>> {
    const validos = esquemaAccionEnlace.parse(payload)
    return api.post<AccionEnlace>(
      `/publico/barberias/${slug}/acciones/${encodeURIComponent(token)}`,
      omitEmpty({ ...validos })
    )
  },

  // ── Con sesión de cliente ─────────────────────────────────────────────────

  async obtenerMisCitas(filtros: FiltrosCitasCliente = {}): Promise<ApiResult<Cita[]>> {
    return api.get<Cita[]>("/mi/citas", { params: omitEmpty({ ...filtros }) })
  },

  async obtenerMiCita(citaId: string): Promise<ApiResult<Cita>> {
    return api.get<Cita>(`/mi/citas/${citaId}`)
  },

  /** `servicioIds` son del CATÁLOGO: la api los traduce a la oferta del barbero. */
  async reservar(payload: DatosReserva): Promise<ApiResult<Cita>> {
    const validos = esquemaReserva.parse(payload)
    return api.post<Cita>("/mi/reservas", omitEmpty({ ...validos }))
  },

  async cancelarCita(citaId: string, payload: DatosCancelar = {}): Promise<ApiResult<Cita>> {
    const validos = esquemaCancelar.parse(payload)
    return api.post<Cita>(`/mi/citas/${citaId}/cancelar`, omitEmpty({ ...validos }))
  },

  async reagendarCita(citaId: string, payload: DatosReagendar): Promise<ApiResult<Cita>> {
    const validos = esquemaReagendar.parse(payload)
    return api.post<Cita>(`/mi/citas/${citaId}/reagendar`, validos)
  },

  async calificarCita(citaId: string, payload: DatosCalificar): Promise<ApiResult<null>> {
    const validos = esquemaCalificar.parse(payload)
    return api.post<null>(`/mi/citas/${citaId}/calificar`, omitEmpty({ ...validos }))
  },

  async obtenerMiPerfil(): Promise<ApiResult<Cliente>> {
    return api.get<Cliente>("/mi/perfil")
  },

  async actualizarMiPerfil(payload: DatosPerfilCliente): Promise<ApiResult<Cliente>> {
    const validos = esquemaPerfilCliente.parse(payload)
    return api.patch<Cliente>("/mi/perfil", validos)
  },

  async obtenerMisConsentimientos(): Promise<ApiResult<Consentimientos>> {
    return api.get<Consentimientos>("/mi/consentimientos")
  },

  /** Siempre una fila nueva, también al revocar: hay que poder demostrarlo. */
  async guardarPreferencia(payload: DatosPreferencia): Promise<ApiResult<null>> {
    const validos = esquemaPreferencia.parse(payload)
    return api.put<null>("/mi/consentimientos", validos)
  },

  async obtenerFidelidad(): Promise<ApiResult<FidelidadPortal>> {
    return api.get<FidelidadPortal>("/mi/fidelidad")
  },

  async canjearPremio(payload: DatosCanje): Promise<ApiResult<CanjePortal>> {
    const validos = esquemaCanje.parse(payload)
    return api.post<CanjePortal>("/mi/canjes", validos)
  },

  async obtenerPromociones(): Promise<ApiResult<PromocionPortal[]>> {
    return api.get<PromocionPortal[]>("/mi/promociones")
  },
}
