import { Link, QrCode, Users } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import datos from "@features/qr/constants/qr.json"
import type { EnlaceReservasQr, EscaneoQr, EstadisticaQr } from "@features/qr/types/qr.types"
import type { ApiResult } from "@shared/types/api.types"

// Capa mock — al integrar, cada método reemplaza su cuerpo por api.get(...) de @lib/http/instances.

function ok<T>(data: T): ApiResult<T> {
  return { data, status: 200, message: "ok", pagination: null }
}

// Los íconos no son serializables: en el JSON viajan como nombre string y aquí se resuelven al componente real.
const iconosEstadistica: Record<string, LucideIcon> = {
  Link,
  QrCode,
  Users,
}

export const qrService = {
  async obtenerEstadisticasQr(): Promise<ApiResult<EstadisticaQr[]>> {
    return ok(
      datos.estadisticas.map(
        (estadistica): EstadisticaQr =>
          ({ ...estadistica, icono: iconosEstadistica[estadistica.icono] }) as EstadisticaQr
      )
    )
  },

  async obtenerEnlaceReservas(): Promise<ApiResult<EnlaceReservasQr>> {
    return ok(datos.enlace as EnlaceReservasQr)
  },

  async obtenerCapacidadesQr(): Promise<ApiResult<string[]>> {
    return ok(datos.capacidades as string[])
  },

  async obtenerEscaneosRecientes(): Promise<ApiResult<EscaneoQr[]>> {
    return ok(datos.escaneos as EscaneoQr[])
  },
}
