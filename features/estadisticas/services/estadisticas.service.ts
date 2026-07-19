import { CalendarCheck, DollarSign, Scissors, TrendingUp, Users } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import datos from "@features/estadisticas/constants/estadisticas.json"
import type { ApiResult } from "@shared/types/api.types"
import type {
  KpiEstadistica,
  PuntoCitasMensual,
  PuntoEvolucionMensual,
  ServicioTop,
} from "@features/estadisticas/types/estadisticas.types"

// Mock: envuelve el payload como lo haría el ApiClient real.
function ok<T>(data: T): Promise<ApiResult<T>> {
  return Promise.resolve({ data, status: 200, message: "ok", pagination: null })
}

// El JSON guarda el ícono como nombre; el service lo resuelve al componente Lucide.
const iconosKpi: Record<string, LucideIcon> = {
  CalendarCheck,
  DollarSign,
  Scissors,
  TrendingUp,
  Users,
}

// Forma cruda del KPI en el JSON: ícono como string, resto igual al tipo del feat.
type KpiCrudo = Omit<KpiEstadistica, "icono"> & { icono: string }

// Singleton del feat — al integrar la API, cada método pasa a usar el api-client.
export const estadisticasService = {
  async obtenerKpis(): Promise<ApiResult<KpiEstadistica[]>> {
    return ok((datos.kpis as KpiCrudo[]).map((kpi) => ({ ...kpi, icono: iconosKpi[kpi.icono] })))
  },

  async obtenerEvolucionMensual(): Promise<ApiResult<PuntoEvolucionMensual[]>> {
    return ok<PuntoEvolucionMensual[]>(datos.evolucionMensual)
  },

  async obtenerCitasPorMes(): Promise<ApiResult<PuntoCitasMensual[]>> {
    return ok<PuntoCitasMensual[]>(datos.citasPorMes)
  },

  async obtenerTopServicios(): Promise<ApiResult<ServicioTop[]>> {
    return ok<ServicioTop[]>(datos.topServicios)
  },
}
