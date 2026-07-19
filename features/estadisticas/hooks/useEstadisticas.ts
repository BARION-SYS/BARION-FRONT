"use client"

import { useCallback, useState } from "react"
import { estadisticasService } from "@features/estadisticas/services/estadisticas.service"
import { getErrorMessage } from "@shared/utils/error"
import type {
  KpiEstadistica,
  PuntoCitasMensual,
  PuntoEvolucionMensual,
  ServicioTop,
} from "@features/estadisticas/types/estadisticas.types"

// Único hook del feat — solo API state. Lo instancia el padre (page) una sola vez.
export function useEstadisticas() {
  const [kpis, setKpis] = useState<KpiEstadistica[]>([])
  const [evolucionMensual, setEvolucionMensual] = useState<PuntoEvolucionMensual[]>([])
  const [citasPorMes, setCitasPorMes] = useState<PuntoCitasMensual[]>([])
  const [topServicios, setTopServicios] = useState<ServicioTop[]>([])
  const [loadingEstadisticas, setLoadingEstadisticas] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEstadisticas = useCallback(async () => {
    setLoadingEstadisticas(true)
    setError(null)
    try {
      const [kpisRes, evolucionRes, citasRes, serviciosRes] = await Promise.all([
        estadisticasService.obtenerKpis(),
        estadisticasService.obtenerEvolucionMensual(),
        estadisticasService.obtenerCitasPorMes(),
        estadisticasService.obtenerTopServicios(),
      ])
      setKpis(kpisRes.data)
      setEvolucionMensual(evolucionRes.data)
      setCitasPorMes(citasRes.data)
      setTopServicios(serviciosRes.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingEstadisticas(false)
    }
  }, [])

  return {
    kpis,
    evolucionMensual,
    citasPorMes,
    topServicios,
    loadingEstadisticas,
    error,
    fetchEstadisticas,
  }
}
