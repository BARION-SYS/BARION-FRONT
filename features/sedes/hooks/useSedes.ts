"use client"

import { useCallback, useState } from "react"
import { sedesService } from "@features/sedes/services/sedes.service"
import { getErrorMessage } from "@shared/utils/error"
import type {
  DatosCierre,
  DatosEditarCierre,
  DatosEditarSede,
  DatosHorarios,
  DatosSede,
} from "@features/sedes/schemas/sedes.schema"
import type { Cierre, HorarioSemanal, Sede } from "@features/sedes/types/sedes.types"

/**
 * Un solo hook para toda la feature, incluidos el horario y los cierres: son de
 * la sede, no features aparte, y separarlos obligaría a la página a orquestar
 * tres estados de carga que siempre se miran juntos.
 *
 * Solo estado de API — la selección de sede y los modales viven en el padre.
 */
export function useSedes() {
  const [sedes, setSedes] = useState<Sede[]>([])
  const [horario, setHorario] = useState<HorarioSemanal | null>(null)
  const [cierres, setCierres] = useState<Cierre[]>([])
  const [loadingLista, setLoadingLista] = useState(false)
  const [loadingCalendario, setLoadingCalendario] = useState(false)
  const [loadingAction, setLoadingAction] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSedes = useCallback(async () => {
    setLoadingLista(true)
    setError(null)
    try {
      const res = await sedesService.obtenerSedes({ paginar: false })
      setSedes(res.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingLista(false)
    }
  }, [])

  /**
   * Horario y cierres en la misma llamada: la pantalla del calendario no sirve
   * con uno solo, y pedirlos por separado deja un estado intermedio en el que la
   * semana se pinta sin sus excepciones.
   */
  const fetchCalendario = useCallback(async (sedeId: string) => {
    setLoadingCalendario(true)
    setError(null)
    try {
      const [resHorario, resCierres] = await Promise.all([
        sedesService.obtenerHorario(sedeId),
        sedesService.obtenerCierres(sedeId, { paginar: false }),
      ])
      setHorario(resHorario.data)
      setCierres(resCierres.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingCalendario(false)
    }
  }, [])

  const handleCreateSede = useCallback(async (payload: DatosSede): Promise<string> => {
    setLoadingAction(true)
    try {
      const res = await sedesService.crearSede(payload)
      return res.message
    } catch (err) {
      throw new Error(getErrorMessage(err))
    } finally {
      setLoadingAction(false)
    }
  }, [])

  const handleUpdateSede = useCallback(
    async (id: string, payload: DatosEditarSede): Promise<string> => {
      setLoadingAction(true)
      try {
        const res = await sedesService.actualizarSede(id, payload)
        return res.message
      } catch (err) {
        throw new Error(getErrorMessage(err))
      } finally {
        setLoadingAction(false)
      }
    },
    []
  )

  const handleToggleSede = useCallback(async (sede: Sede): Promise<string> => {
    setLoadingAction(true)
    try {
      const res = sede.activa
        ? await sedesService.desactivarSede(sede.id)
        : await sedesService.activarSede(sede.id)
      return res.message
    } catch (err) {
      throw new Error(getErrorMessage(err))
    } finally {
      setLoadingAction(false)
    }
  }, [])

  const handleReplaceHorario = useCallback(
    async (sedeId: string, payload: DatosHorarios): Promise<string> => {
      setLoadingAction(true)
      try {
        const res = await sedesService.reemplazarHorario(sedeId, payload)
        setHorario(res.data)
        return res.message
      } catch (err) {
        throw new Error(getErrorMessage(err))
      } finally {
        setLoadingAction(false)
      }
    },
    []
  )

  const handleCreateCierre = useCallback(
    async (sedeId: string, payload: DatosCierre): Promise<string> => {
      setLoadingAction(true)
      try {
        const res = await sedesService.crearCierre(sedeId, payload)
        return res.message
      } catch (err) {
        throw new Error(getErrorMessage(err))
      } finally {
        setLoadingAction(false)
      }
    },
    []
  )

  const handleUpdateCierre = useCallback(
    async (sedeId: string, cierreId: string, payload: DatosEditarCierre): Promise<string> => {
      setLoadingAction(true)
      try {
        const res = await sedesService.actualizarCierre(sedeId, cierreId, payload)
        return res.message
      } catch (err) {
        throw new Error(getErrorMessage(err))
      } finally {
        setLoadingAction(false)
      }
    },
    []
  )

  const handleCancelCierre = useCallback(
    async (sedeId: string, cierreId: string): Promise<string> => {
      setLoadingAction(true)
      try {
        const res = await sedesService.cancelarCierre(sedeId, cierreId)
        return res.message
      } catch (err) {
        throw new Error(getErrorMessage(err))
      } finally {
        setLoadingAction(false)
      }
    },
    []
  )

  return {
    sedes,
    horario,
    cierres,
    loadingLista,
    loadingCalendario,
    loadingAction,
    error,
    fetchSedes,
    fetchCalendario,
    handleCreateSede,
    handleUpdateSede,
    handleToggleSede,
    handleReplaceHorario,
    handleCreateCierre,
    handleUpdateCierre,
    handleCancelCierre,
  }
}
