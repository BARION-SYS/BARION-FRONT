"use client"

import { useCallback, useState } from "react"
import { dashboardService } from "@features/dashboard/services/dashboard.service"
import type { RangoDias, Serie, ServicioTop } from "@features/dashboard/types/dashboard.types"
import { esFuncionNoIncluida, getErrorMessage } from "@shared/utils/error"

/**
 * Estado de API de las estadísticas. Consume el service de `dashboard`, que es
 * el feat DUEÑO del dominio de reportes: son los mismos endpoints con una
 * ventana más larga, y duplicar el service garantizaría que un día divergieran.
 *
 * `serie.disponible` arranca en `false`, igual que responde la api mientras el
 * job nocturno del worker no exista.
 */
const SERIE_VACIA: Serie = { granularidad: "mes", puntos: [], disponible: false }

export function useEstadisticas() {
  const [serie, setSerie] = useState<Serie>(SERIE_VACIA)
  const [servicios, setServicios] = useState<ServicioTop[]>([])
  const [loadingEstadisticas, setLoadingEstadisticas] = useState(false)
  const [error, setError] = useState<string | null>(null)
  /** Los reportes no están en el plan contratado: sección cerrada, no avería. */
  const [sinPlan, setSinPlan] = useState(false)

  const fetchEstadisticas = useCallback(
    async (rangoAgregado: RangoDias, rangoTransaccional: RangoDias) => {
      setLoadingEstadisticas(true)
      setError(null)
      try {
        const [resSerie, resServicios] = await Promise.all([
          dashboardService.obtenerSerie(rangoAgregado),
          dashboardService.obtenerServiciosTop({ ...rangoTransaccional, limite: 6 }),
        ])
        setSerie(resSerie.data)
        setServicios(resServicios.data)
        setSinPlan(false)
      } catch (err) {
        if (esFuncionNoIncluida(err)) {
          setSinPlan(true)
          return
        }
        setError(getErrorMessage(err))
      } finally {
        setLoadingEstadisticas(false)
      }
    },
    []
  )

  return { serie, servicios, loadingEstadisticas, error, sinPlan, fetchEstadisticas }
}
