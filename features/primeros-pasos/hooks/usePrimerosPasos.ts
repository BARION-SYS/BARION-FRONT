"use client"

import { useCallback, useState } from "react"
import { primerosPasosService } from "@features/primeros-pasos/services/primeros-pasos.service"
import { candidatosJornada, sedeCompleta, sedesActivas } from "@features/primeros-pasos/utils/pasos"
import { getErrorMessage } from "@shared/utils/error"
import type {
  AlcanceProgreso,
  ProgresoInicial,
} from "@features/primeros-pasos/types/primeros-pasos.types"

/**
 * Estado de API del alta guiada. Solo lecturas: esta feature no escribe nada,
 * cada paso se resuelve en la pantalla de su dominio.
 *
 * `progreso` arranca en `null` a propósito y significa "todavía no se sabe", que
 * no es lo mismo que "no falta nada": mientras valga `null` la tarjeta no se
 * pinta, y así una barbería ya montada no ve parpadear un cartel de bienvenida
 * en cada carga del panel.
 */
export function usePrimerosPasos() {
  const [progreso, setProgreso] = useState<ProgresoInicial | null>(null)
  const [loadingProgreso, setLoadingProgreso] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Un paso está hecho si lo está en ALGUNA parte que cuente, no en la primera
   * que aparezca: el horario en cualquier sede activa, la oferta y la jornada en
   * cualquier barbero. Mirar solo la sede seleccionada y el primer barbero de la
   * lista dejaba pasos pendientes para siempre en barberías que ya los tenían.
   *
   * Las listas van juntas porque no dependen entre sí; las jornadas van después
   * porque hace falta saber a QUIÉN preguntárselas, y se acotan a unos pocos
   * candidatos (`candidatosJornada`) para no pagar un viaje por barbero.
   */
  const fetchProgreso = useCallback(async (alcance: AlcanceProgreso) => {
    const { sedes, leeBarberos, leeCatalogo } = alcance
    const activas = sedesActivas(sedes)
    setLoadingProgreso(true)
    setError(null)
    try {
      const [horarios, barberos, servicios] = await Promise.all([
        Promise.all(activas.map((sede) => primerosPasosService.obtenerHorario(sede.id))),
        leeBarberos ? primerosPasosService.obtenerBarberos() : null,
        leeCatalogo ? primerosPasosService.obtenerServicios() : null,
      ])

      const equipo = barberos?.data ?? []
      const jornadas = await Promise.all(
        candidatosJornada(equipo).map((barbero) => primerosPasosService.obtenerJornada(barbero.id))
      )

      setProgreso({
        sede: activas.some(sedeCompleta),
        horario: horarios.some((horario) => horario.data.tramos.length > 0),
        personas: equipo.length > 0,
        catalogo: (servicios?.data.length ?? 0) > 0,
        oferta: equipo.some((barbero) => barbero.oferta.length > 0),
        jornada: jornadas.some((jornada) => jornada.data.tramos.length > 0),
      })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingProgreso(false)
    }
  }, [])

  return { progreso, loadingProgreso, error, fetchProgreso }
}
