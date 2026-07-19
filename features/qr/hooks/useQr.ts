"use client"

import { useCallback, useState } from "react"
import { qrService } from "@features/qr/services/qr.service"
import type { EnlaceReservasQr, EscaneoQr, EstadisticaQr } from "@features/qr/types/qr.types"
import { getErrorMessage } from "@shared/utils/error"

// Estado de API del feat qr — lo instancia SOLO el contenedor (app/dashboard/qr/page.tsx).
export function useQr() {
  const [estadisticas, setEstadisticas] = useState<EstadisticaQr[]>([])
  const [enlace, setEnlace] = useState<EnlaceReservasQr | null>(null)
  const [capacidades, setCapacidades] = useState<string[]>([])
  const [escaneos, setEscaneos] = useState<EscaneoQr[]>([])
  const [loadingQr, setLoadingQr] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchQr = useCallback(async () => {
    setLoadingQr(true)
    setError(null)
    try {
      const [resEstadisticas, resEnlace, resCapacidades, resEscaneos] = await Promise.all([
        qrService.obtenerEstadisticasQr(),
        qrService.obtenerEnlaceReservas(),
        qrService.obtenerCapacidadesQr(),
        qrService.obtenerEscaneosRecientes(),
      ])
      setEstadisticas(resEstadisticas.data)
      setEnlace(resEnlace.data)
      setCapacidades(resCapacidades.data)
      setEscaneos(resEscaneos.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingQr(false)
    }
  }, [])

  return { estadisticas, enlace, capacidades, escaneos, loadingQr, error, fetchQr }
}
