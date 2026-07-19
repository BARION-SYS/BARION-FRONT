"use client"

import { useCallback, useState } from "react"
import type { CitaHoy } from "@features/citas/types/citas.types"
import { dashboardService } from "@features/dashboard/services/dashboard.service"
import type {
  KpiDashboard,
  PuntoIngresoDiario,
  PuntoIngresoMensual,
  ResumenBarbero,
  ServicioPopular,
} from "@features/dashboard/types/dashboard.types"
import { getErrorMessage } from "@shared/utils/error"

// Estado de API del dashboard — lo instancia SOLO el contenedor (app/dashboard/page.tsx).
export function useDashboard() {
  const [kpis, setKpis] = useState<KpiDashboard[]>([])
  const [ingresosSemana, setIngresosSemana] = useState<PuntoIngresoDiario[]>([])
  const [ingresosMensuales, setIngresosMensuales] = useState<PuntoIngresoMensual[]>([])
  const [citasHoy, setCitasHoy] = useState<CitaHoy[]>([])
  const [resumenBarberos, setResumenBarberos] = useState<ResumenBarbero[]>([])
  const [serviciosPopulares, setServiciosPopulares] = useState<ServicioPopular[]>([])
  const [loadingResumen, setLoadingResumen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchResumen = useCallback(async () => {
    setLoadingResumen(true)
    setError(null)
    try {
      const [resKpis, resSemana, resMensuales, resCitas, resBarberos, resServicios] =
        await Promise.all([
          dashboardService.obtenerKpisDashboard(),
          dashboardService.obtenerIngresosSemana(),
          dashboardService.obtenerIngresosMensuales(),
          dashboardService.obtenerCitasDeHoy(),
          dashboardService.obtenerResumenBarberos(),
          dashboardService.obtenerServiciosPopulares(),
        ])
      setKpis(resKpis.data)
      setIngresosSemana(resSemana.data)
      setIngresosMensuales(resMensuales.data)
      setCitasHoy(resCitas.data)
      setResumenBarberos(resBarberos.data)
      setServiciosPopulares(resServicios.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingResumen(false)
    }
  }, [])

  return {
    kpis,
    ingresosSemana,
    ingresosMensuales,
    citasHoy,
    resumenBarberos,
    serviciosPopulares,
    loadingResumen,
    error,
    fetchResumen,
  }
}
