import { api } from "@lib/http/instances"
import { omitEmpty } from "@shared/utils/params"
import {
  esquemaAltaBarberia,
  esquemaAltaStaff,
  esquemaCambioEstado,
  esquemaCorreccionSuscripcion,
  esquemaPlanEdicion,
  esquemaPlanNuevo,
  type DatosAltaBarberia,
  type DatosAltaStaff,
  type DatosCambioEstado,
  type DatosCorreccionSuscripcion,
  type DatosPlanEdicion,
  type DatosPlanNuevo,
} from "@features/plataforma/schemas/plataforma.schema"
import type {
  BarberiaFicha,
  BarberiaInventario,
  FiltrosInventario,
  FiltrosPlanes,
  FiltrosSuscripciones,
  PlanAdmin,
  PlanPlataforma,
  StaffCreado,
  StaffPlataforma,
  SuscripcionPlataforma,
} from "@features/plataforma/types/plataforma.types"
import type { ApiResult } from "@shared/types/api.types"

// Administración del SaaS. Solo la alcanza una sesión de staff de Barion: con
// cualquier otra, la API responde 403 en todas estas rutas.
export const plataformaService = {
  async obtenerBarberias(
    filtros: FiltrosInventario = {}
  ): Promise<ApiResult<BarberiaInventario[]>> {
    return api.get<BarberiaInventario[]>("/plataforma/barberias", {
      params: omitEmpty({ ...filtros }),
    })
  },

  async obtenerBarberia(id: string): Promise<ApiResult<BarberiaFicha>> {
    return api.get<BarberiaFicha>(`/plataforma/barberias/${id}`)
  },

  /**
   * Crea la barbería entera: sede inicial, propietario con credencial temporal
   * y suscripción de prueba. Devuelve la ficha, de donde sale el enlace que se
   * le entrega al cliente.
   */
  async crearBarberia(payload: DatosAltaBarberia): Promise<ApiResult<BarberiaFicha>> {
    const validos = esquemaAltaBarberia.parse(payload)
    // Los opcionales vacíos no viajan: la API decide su valor por defecto y
    // mandarlos en blanco la obligaría a distinguir "" de ausente.
    return api.post<BarberiaFicha>("/plataforma/barberias", omitEmpty({ ...validos }))
  },

  async cambiarEstadoBarberia(
    id: string,
    payload: DatosCambioEstado
  ): Promise<ApiResult<BarberiaFicha>> {
    const validos = esquemaCambioEstado.parse(payload)
    return api.post<BarberiaFicha>(`/plataforma/barberias/${id}/estado`, validos)
  },

  /**
   * El catálogo comercial: planes activos con sus límites, sus funciones y su
   * precio por país.
   *
   * Es la ÚNICA ruta pública de la API (`@Publico()`) — la misma que consume el
   * sitio de venta. Aquí no se usa para vender, sino porque el alta necesita
   * elegir un plan que exista de verdad: teclear el código a mano acaba
   * creándole a un cliente una suscripción a un plan que nadie tiene.
   */
  async obtenerPlanes(): Promise<ApiResult<PlanPlataforma[]>> {
    return api.get<PlanPlataforma[]>("/publico/planes")
  },

  /**
   * El catálogo COMPLETO, para administrarlo: incluye los planes retirados, las
   * banderas apagadas y las tarifas que ya no se ofrecen.
   *
   * Es otra superficie que `obtenerPlanes`, no un filtro suya. Quien edita
   * necesita ver lo que está apagado para poder encenderlo, y el catálogo
   * público solo publica lo que se vende.
   */
  async obtenerCatalogoPlanes(filtros: FiltrosPlanes = {}): Promise<ApiResult<PlanAdmin[]>> {
    return api.get<PlanAdmin[]>("/plataforma/planes", { params: omitEmpty({ ...filtros }) })
  },

  async crearPlan(payload: DatosPlanNuevo): Promise<ApiResult<PlanAdmin>> {
    const validos = esquemaPlanNuevo.parse(payload)
    return api.post<PlanAdmin>("/plataforma/planes", validos)
  },

  /**
   * Edita un plan. No hay `DELETE` y no se echa en falta: retirar es
   * `activo: false`, que lo saca del catálogo público y de lo contratable
   * dejando exactamente igual a quien ya lo tiene.
   */
  async actualizarPlan(planId: string, payload: DatosPlanEdicion): Promise<ApiResult<PlanAdmin>> {
    const validos = esquemaPlanEdicion.parse(payload)
    return api.patch<PlanAdmin>(`/plataforma/planes/${planId}`, validos)
  },

  async obtenerSuscripciones(
    filtros: FiltrosSuscripciones = {}
  ): Promise<ApiResult<SuscripcionPlataforma[]>> {
    return api.get<SuscripcionPlataforma[]>("/plataforma/suscripciones", {
      params: omitEmpty({ ...filtros }),
    })
  },

  /**
   * La corrección de soporte, direccionada por la BARBERÍA y no por el id de la
   * suscripción: hay una por barbería, así que no hay ambigüedad, y es como se
   * direcciona todo el resto del módulo.
   *
   * Los opcionales vacíos no viajan: `omitEmpty` conserva `false` y `0`, que
   * aquí son valores legítimos —cancelar la baja programada y dejar la cuenta
   * sin días de gracia—.
   */
  async corregirSuscripcion(
    barberiaId: string,
    payload: DatosCorreccionSuscripcion
  ): Promise<ApiResult<SuscripcionPlataforma>> {
    const validos = esquemaCorreccionSuscripcion.parse(payload)
    return api.patch<SuscripcionPlataforma>(
      `/plataforma/suscripciones/${barberiaId}`,
      omitEmpty({ ...validos })
    )
  },

  // ── El equipo de Barion ───────────────────────────────────────────────────
  // No administra clientes: administra a los de casa. Por eso cuelga de su
  // propia capacidad (`plataforma.staff.gestionar`) y no de la de barberías.

  async obtenerStaff(): Promise<ApiResult<StaffPlataforma[]>> {
    // Sin paginar: el equipo de Barion son unas cuantas personas, no un
    // catálogo que crezca.
    return api.get<StaffPlataforma[]>("/plataforma/staff")
  },

  /**
   * Da de alta a alguien del equipo. La contraseña la genera el servidor y
   * viaja UNA vez en esta respuesta: no hay ninguna ruta que la consulte
   * después.
   */
  async crearStaff(payload: DatosAltaStaff): Promise<ApiResult<StaffCreado>> {
    return api.post<StaffCreado>("/plataforma/staff", esquemaAltaStaff.parse(payload))
  },

  async cambiarEstadoStaff(
    usuarioId: string,
    estado: "activo" | "inactivo"
  ): Promise<ApiResult<StaffPlataforma>> {
    return api.post<StaffPlataforma>(`/plataforma/staff/${usuarioId}/estado`, { estado })
  },

  /**
   * Una contraseña nueva para quien perdió la suya. El staff de plataforma no
   * puede usar el restablecimiento por correo —ese flujo resuelve la barbería
   * del usuario y esta cuenta no tiene ninguna—, así que sin esto perder la
   * contraseña deja a alguien fuera para siempre.
   */
  async regenerarContrasenaStaff(usuarioId: string): Promise<ApiResult<StaffCreado>> {
    return api.post<StaffCreado>(`/plataforma/staff/${usuarioId}/contrasena`)
  },
}
