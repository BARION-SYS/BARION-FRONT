"use client"

import { useCallback, useState } from "react"
import { dashboardService } from "@features/dashboard/services/dashboard.service"
import type {
  FiltrosMetas,
  Meta,
  RangoDias,
  ReporteDashboard,
  Serie,
} from "@features/dashboard/types/dashboard.types"
import { getErrorMessage } from "@shared/utils/error"

/**
 * Estado de API de reportes. Lo instancian el dashboard y las estadísticas: son
 * los mismos endpoints con otra ventana de tiempo.
 *
 * `serie` arranca en `disponible: false` a propósito — es el mismo estado que
 * devuelve la api mientras el job nocturno del worker no exista, así que la
 * pantalla no necesita distinguir "cargando" de "todavía no hay historia".
 */
const SERIE_VACIA: Serie = { granularidad: "dia", puntos: [], disponible: false }

export function useDashboard() {
  const [pulso, setPulso] = useState<ReporteDashboard | null>(null)
  const [serie, setSerie] = useState<Serie>(SERIE_VACIA)
  const [metas, setMetas] = useState<Meta[]>([])
  const [loadingPulso, setLoadingPulso] = useState(false)
  const [loadingSerie, setLoadingSerie] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPulso = useCallback(async (rango: RangoDias) => {
    setLoadingPulso(true)
    setError(null)
    try {
      const res = await dashboardService.obtenerDashboard(rango)
      setPulso(res.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingPulso(false)
    }
  }, [])

  const fetchSerie = useCallback(async (rango: RangoDias) => {
    setLoadingSerie(true)
    try {
      const res = await dashboardService.obtenerSerie(rango)
      setSerie(res.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingSerie(false)
    }
  }, [])

  const fetchMetas = useCallback(async (filtros: FiltrosMetas) => {
    try {
      const res = await dashboardService.obtenerMetas(filtros)
      setMetas(res.data)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }, [])

  return {
    pulso,
    serie,
    metas,
    loadingPulso,
    loadingSerie,
    error,
    fetchPulso,
    fetchSerie,
    fetchMetas,
  }
}
