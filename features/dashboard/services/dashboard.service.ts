import { CalendarCheck, Clock, DollarSign, Scissors, TrendingUp, Users } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { CitaHoy } from "@features/citas/types/citas.types"
import datos from "@features/dashboard/constants/dashboard.json"
import type {
  KpiDashboard,
  PuntoIngresoDiario,
  PuntoIngresoMensual,
  ResumenBarbero,
  ServicioPopular,
} from "@features/dashboard/types/dashboard.types"
import type { ApiResult } from "@shared/types/api.types"

// Capa mock — al integrar, cada método reemplaza su cuerpo por api.get(...) de @lib/http/instances.

function ok<T>(data: T): ApiResult<T> {
  return { data, status: 200, message: "ok", pagination: null }
}

// Los íconos no son serializables: en el JSON viajan como nombre string y aquí se resuelven al componente real.
const iconosKpi: Record<string, LucideIcon> = {
  CalendarCheck,
  Clock,
  DollarSign,
  Scissors,
  TrendingUp,
  Users,
}

export const dashboardService = {
  async obtenerKpisDashboard(): Promise<ApiResult<KpiDashboard[]>> {
    return ok(
      datos.kpis.map(
        (kpi): KpiDashboard => ({ ...kpi, icono: iconosKpi[kpi.icono] }) as KpiDashboard
      )
    )
  },

  async obtenerIngresosSemana(): Promise<ApiResult<PuntoIngresoDiario[]>> {
    return ok(datos.ingresosSemana as PuntoIngresoDiario[])
  },

  async obtenerIngresosMensuales(): Promise<ApiResult<PuntoIngresoMensual[]>> {
    return ok(datos.ingresosMensuales as PuntoIngresoMensual[])
  },

  async obtenerCitasDeHoy(): Promise<ApiResult<CitaHoy[]>> {
    return ok(datos.citasHoy as CitaHoy[])
  },

  async obtenerResumenBarberos(): Promise<ApiResult<ResumenBarbero[]>> {
    return ok(datos.resumenBarberos as ResumenBarbero[])
  },

  async obtenerServiciosPopulares(): Promise<ApiResult<ServicioPopular[]>> {
    return ok(datos.serviciosPopulares as ServicioPopular[])
  },
}
