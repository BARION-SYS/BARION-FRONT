import { api } from "@lib/http/instances"
import { omitEmpty } from "@shared/utils/params"
import type { HorarioSemanal } from "@features/sedes/types/sedes.types"
import type { Barbero, JornadaSemanal } from "@features/barberos/types/barberos.types"
import type { Servicio } from "@features/servicios/types/servicios.types"
import type { ApiResult } from "@shared/types/api.types"

/**
 * Lecturas de SOLO comprobación: ninguna de estas llamadas escribe nada y
 * ninguna alimenta una pantalla de su dominio — sirven para responder "¿esto ya
 * está hecho?" y nada más.
 *
 * Tiene service propio, y no reutiliza el de sedes/barberos/servicios, porque lo
 * que necesita es distinto: los hooks dueños traen de más (el calendario de la
 * sede pide horario *y* cierres, la disponibilidad del barbero pide jornada,
 * excepciones *y* ausencias) y esta tarjeta se pinta en el arranque del panel,
 * donde cada viaje se nota. Los TIPOS sí se importan de su feature dueño: el
 * contrato es uno solo.
 */
export const primerosPasosService = {
  /** Un día sin tramos es un día cerrado; cero tramos es una sede sin horario. */
  async obtenerHorario(sedeId: string): Promise<ApiResult<HorarioSemanal>> {
    return api.get<HorarioSemanal>(`/sedes/${sedeId}/horarios`)
  },

  /**
   * Los que atienden hoy. Llegan enriquecidos con su `oferta`, así que el paso
   * del reparto de precios se resuelve sin un viaje más.
   */
  async obtenerBarberos(): Promise<ApiResult<Barbero[]>> {
    return api.get<Barbero[]>("/barberos", {
      params: omitEmpty({ paginar: false, soloActivos: true }),
    })
  },

  async obtenerJornada(barberoId: string): Promise<ApiResult<JornadaSemanal>> {
    return api.get<JornadaSemanal>(`/barberos/${barberoId}/jornadas`)
  },

  async obtenerServicios(): Promise<ApiResult<Servicio[]>> {
    return api.get<Servicio[]>("/servicios", {
      params: omitEmpty({ paginar: false, soloActivos: true }),
    })
  },
}
