import { api } from "@lib/http/instances"
import { omitEmpty } from "@shared/utils/params"
import {
  esquemaAtiendoYo,
  esquemaAusencia,
  esquemaBarbero,
  esquemaExcepcion,
  esquemaJornada,
  type DatosAtiendoYo,
  type DatosAusencia,
  type DatosBarbero,
  type DatosExcepcion,
  type DatosJornada,
} from "@features/barberos/schemas/barberos.schema"
import type {
  Ausencia,
  AusenciaCreada,
  Barbero,
  ExcepcionJornada,
  FiltrosAusencias,
  FiltrosBarberos,
  JornadaSemanal,
} from "@features/barberos/types/barberos.types"
import type { ApiResult } from "@shared/types/api.types"

export const barberosService = {
  async obtenerBarberos(filtros: FiltrosBarberos = {}): Promise<ApiResult<Barbero[]>> {
    return api.get<Barbero[]>("/barberos", { params: omitEmpty({ ...filtros }) })
  },

  /**
   * El barbero que ES quien pregunta. Devuelve `null` si no atiende —el
   * administrador no es barbero— y eso no es un error.
   */
  async obtenerMiPerfil(): Promise<ApiResult<Barbero | null>> {
    return api.get<Barbero | null>("/barberos/mio")
  },

  /**
   * «Yo también atiendo». Abre la ficha de quien está en sesión: el propietario
   * que corta no puede darse de alta por Equipo —su membresía ya existe— ni
   * vincularse desde `POST /barberos`, que no acepta la membresía.
   *
   * Repetirlo no crea una segunda ficha: la API reactiva la que ya tenía.
   */
  async atenderYo(payload: DatosAtiendoYo): Promise<ApiResult<Barbero>> {
    const validos = esquemaAtiendoYo.parse(payload)
    return api.post<Barbero>("/barberos/mio", omitEmpty({ ...validos }))
  },

  /** Deja de atender sin perder la ficha: no cancela las citas que ya tenga. */
  async dejarDeAtender(): Promise<ApiResult<Barbero>> {
    return api.delete<Barbero>("/barberos/mio")
  },

  async crearBarbero(payload: DatosBarbero): Promise<ApiResult<Barbero>> {
    const validos = esquemaBarbero.parse(payload)
    // Los opcionales vacíos no viajan: omitirlos deja que la API decida su
    // valor por defecto, que no es lo mismo que mandarlos en blanco.
    return api.post<Barbero>("/barberos", omitEmpty({ ...validos }))
  },

  async actualizarBarbero(id: string, payload: DatosBarbero): Promise<ApiResult<Barbero>> {
    const validos = esquemaBarbero.parse(payload)
    return api.patch<Barbero>(`/barberos/${id}`, omitEmpty({ ...validos }))
  },

  /** Soft delete: conserva su historial y NO cancela sus citas futuras. */
  async desactivarBarbero(id: string, fechaRetiro?: string): Promise<ApiResult<Barbero>> {
    return api.delete<Barbero>(`/barberos/${id}`, {
      data: omitEmpty({ fechaRetiro }),
    })
  },

  async activarBarbero(id: string): Promise<ApiResult<Barbero>> {
    return api.post<Barbero>(`/barberos/${id}/activar`, {})
  },

  async obtenerJornada(barberoId: string): Promise<ApiResult<JornadaSemanal>> {
    return api.get<JornadaSemanal>(`/barberos/${barberoId}/jornadas`)
  },

  /** Sustituye la semana entera: es lo que permite quitar un tramo. */
  async reemplazarJornada(
    barberoId: string,
    payload: DatosJornada
  ): Promise<ApiResult<JornadaSemanal>> {
    const validos = esquemaJornada.parse(payload)
    return api.put<JornadaSemanal>(`/barberos/${barberoId}/jornadas`, validos)
  },

  async obtenerExcepciones(
    barberoId: string,
    ventana: { desde?: string; hasta?: string } = {}
  ): Promise<ApiResult<ExcepcionJornada[]>> {
    return api.get<ExcepcionJornada[]>(`/barberos/${barberoId}/excepciones`, {
      params: omitEmpty({ ...ventana }),
    })
  },

  async guardarExcepcion(
    barberoId: string,
    payload: DatosExcepcion
  ): Promise<ApiResult<ExcepcionJornada>> {
    const validos = esquemaExcepcion.parse(payload)
    return api.put<ExcepcionJornada>(
      `/barberos/${barberoId}/excepciones`,
      omitEmpty({ ...validos, cerrado: validos.cerrado })
    )
  },

  async eliminarExcepcion(barberoId: string, excepcionId: string): Promise<ApiResult<null>> {
    return api.delete<null>(`/barberos/${barberoId}/excepciones/${excepcionId}`)
  },

  async obtenerAusencias(
    barberoId: string,
    filtros: FiltrosAusencias = {}
  ): Promise<ApiResult<Ausencia[]>> {
    return api.get<Ausencia[]>(`/barberos/${barberoId}/ausencias`, {
      params: omitEmpty({ ...filtros }),
    })
  },

  /** La respuesta trae `citasPisadas`: la ausencia NO cancela esas citas. */
  async programarAusencia(
    barberoId: string,
    payload: DatosAusencia
  ): Promise<ApiResult<AusenciaCreada>> {
    const validos = esquemaAusencia.parse(payload)
    return api.post<AusenciaCreada>(`/barberos/${barberoId}/ausencias`, omitEmpty({ ...validos }))
  },

  async aprobarAusencia(barberoId: string, ausenciaId: string): Promise<ApiResult<Ausencia>> {
    return api.post<Ausencia>(`/barberos/${barberoId}/ausencias/${ausenciaId}/aprobar`, {})
  },

  async cancelarAusencia(barberoId: string, ausenciaId: string): Promise<ApiResult<null>> {
    return api.delete<null>(`/barberos/${barberoId}/ausencias/${ausenciaId}`)
  },
}
