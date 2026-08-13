"use client"

import { useCallback, useState } from "react"
import { configuracionService } from "@features/configuracion/services/configuracion.service"
import { qrService } from "@features/qr/services/qr.service"
import { sedesService } from "@features/sedes/services/sedes.service"
import type { ActividadQr, RangoQr, ResumenQr } from "@features/qr/types/qr.types"
import type { Barberia } from "@features/configuracion/types/configuracion.types"
import { esFuncionNoIncluida, getErrorMessage } from "@shared/utils/error"
import { useSedeStore } from "@store/sede.store"

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
 * Por lo mismo, rotar el código del cartón llama al service de `sedes`, dueño de
 * `/sedes/**` — la acción es de esta pantalla, la ruta no.
 */
export function useQr() {
  const reemplazarSede = useSedeStore((estado) => estado.reemplazarSede)
  const [barberia, setBarberia] = useState<Barberia | null>(null)
  const [resumen, setResumen] = useState<ResumenQr | null>(null)
  const [actividad, setActividad] = useState<ActividadQr[]>([])
  const [loadingQr, setLoadingQr] = useState(false)
  const [loadingReportes, setLoadingReportes] = useState(false)
  const [loadingAction, setLoadingAction] = useState(false)
  const [error, setError] = useState<string | null>(null)
  /** Las CIFRAS del cartón van en otro plan. El cartón en sí, no. */
  const [sinPlanReportes, setSinPlanReportes] = useState(false)

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
      setSinPlanReportes(false)
    } catch (err) {
      // El cartón y su código NO son del plan: lo que se cierra son las cifras,
      // así que la pantalla sigue sirviendo para lo que se vino a hacer.
      if (esFuncionNoIncluida(err)) {
        setSinPlanReportes(true)
        return
      }
      setError(getErrorMessage(err))
    } finally {
      setLoadingReportes(false)
    }
  }, [])

  /**
   * Rota el `slugQr` de UNA sede — pide `sedes.gestionar`.
   *
   * La api devuelve la sede entera con el código ya rotado, así que se sustituye
   * en el store de sedes: de ahí salen el enlace y el QR de la pantalla, y
   * recomponerlos aquí a mano sería inventarse un código que solo el servidor
   * puede generar (es único entre todas las barberías).
   */
  const handleRotateSlugQr = useCallback(
    async (sedeId: string): Promise<string> => {
      setLoadingAction(true)
      try {
        const res = await sedesService.rotarSlugQr(sedeId)
        reemplazarSede(res.data)
        return res.message
      } catch (err) {
        throw new Error(getErrorMessage(err))
      } finally {
        setLoadingAction(false)
      }
    },
    [reemplazarSede]
  )

  return {
    barberia,
    resumen,
    actividad,
    loadingQr,
    loadingReportes,
    loadingAction,
    error,
    sinPlanReportes,
    fetchBarberiaQr,
    fetchReportesQr,
    handleRotateSlugQr,
  }
}
