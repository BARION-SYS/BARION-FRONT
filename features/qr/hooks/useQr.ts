"use client"

import { useCallback, useState } from "react"
import { configuracionService } from "@features/configuracion/services/configuracion.service"
import { qrService } from "@features/qr/services/qr.service"
import type { ActividadQr, RangoQr, ResumenQr } from "@features/qr/types/qr.types"
import type { Barberia } from "@features/configuracion/types/configuracion.types"
import { getErrorMessage } from "@shared/utils/error"

/**
 * Estado de API del feat `qr` — lo instancia SOLO su página.
 *
 * **Dos lecturas con permisos distintos, y por eso dos operaciones.** La ficha de
 * la barbería solo pide estar autenticado y es la que compone el enlace impreso:
 * sin ella no hay cartón que enseñar. Las cifras piden `reportes.ver`, que el rol
 * `barbero` no trae — pedirlas igual llenaría su pantalla de 403 y le quitaría el
 * QR, que sí puede ver. Quien decide cuál pedir es la página.
 *
 * La barbería se lee con el service de `configuracion`, que es el feat DUEÑO de
 * `/barberias/mi`: duplicar la llamada aquí garantizaría que un día divergieran.
 */
export function useQr() {
  const [barberia, setBarberia] = useState<Barberia | null>(null)
  const [resumen, setResumen] = useState<ResumenQr | null>(null)
  const [actividad, setActividad] = useState<ActividadQr[]>([])
  const [loadingQr, setLoadingQr] = useState(false)
  const [loadingReportes, setLoadingReportes] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBarberiaQr = useCallback(async () => {
    setLoadingQr(true)
    setError(null)
    try {
      const res = await configuracionService.obtenerBarberia()
      setBarberia(res.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingQr(false)
    }
  }, [])

  /**
   * Las cifras y el feed del rango. **Cero y feed vacío son el estado normal**
   * mientras el portal no marque el origen: no es un fallo y la pantalla lo dice
   * con sus propias palabras.
   */
  const fetchReportesQr = useCallback(async (rango: RangoQr, limite?: number) => {
    setLoadingReportes(true)
    setError(null)
    try {
      const [resResumen, resActividad] = await Promise.all([
        qrService.obtenerResumen(rango),
        qrService.obtenerActividad({ ...rango, limite }),
      ])
      setResumen(resResumen.data)
      setActividad(resActividad.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingReportes(false)
    }
  }, [])

  return {
    barberia,
    resumen,
    actividad,
    loadingQr,
    loadingReportes,
    error,
    fetchBarberiaQr,
    fetchReportesQr,
  }
}
