"use client"

import { useCallback, useState } from "react"
import { primerosPasosService } from "@features/primeros-pasos/services/primeros-pasos.service"
import { sedeCompleta } from "@features/primeros-pasos/utils/pasos"
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
   * Las tres listas van juntas porque no dependen entre sí; la jornada va
   * después porque hace falta saber a QUIÉN preguntársela.
   *
   * Se consulta la del primer barbero activo y no la de todos: con veinte
   * personas serían veinte viajes en cada entrada al panel, y esto es una lista
   * de primeros pasos, no una auditoría de la agenda.
   */
  const fetchProgreso = useCallback(async (alcance: AlcanceProgreso) => {
    const { sede, leeBarberos, leeCatalogo } = alcance
    setLoadingProgreso(true)
    setError(null)
    try {
      const [horario, barberos, servicios] = await Promise.all([
        sede ? primerosPasosService.obtenerHorario(sede.id) : null,
        leeBarberos ? primerosPasosService.obtenerBarberos() : null,
        leeCatalogo ? primerosPasosService.obtenerServicios() : null,
      ])

      const primero = barberos?.data[0] ?? null
      const jornada = primero ? await primerosPasosService.obtenerJornada(primero.id) : null

      setProgreso({
        sede: sedeCompleta(sede),
        horario: (horario?.data.tramos.length ?? 0) > 0,
        personas: (barberos?.data.length ?? 0) > 0,
        catalogo: (servicios?.data.length ?? 0) > 0,
        oferta: (primero?.oferta.length ?? 0) > 0,
        jornada: (jornada?.data.tramos.length ?? 0) > 0,
      })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingProgreso(false)
    }
  }, [])

  return { progreso, loadingProgreso, error, fetchProgreso }
}
