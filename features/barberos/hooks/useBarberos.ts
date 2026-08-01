"use client"

import { useCallback, useState } from "react"
import { barberosService } from "@features/barberos/services/barberos.service"
import { getErrorMessage } from "@shared/utils/error"
import type {
  DatosAtiendoYo,
  DatosAusencia,
  DatosBarbero,
  DatosExcepcion,
  DatosJornada,
} from "@features/barberos/schemas/barberos.schema"
import type {
  Ausencia,
  Barbero,
  ExcepcionJornada,
  FiltrosBarberos,
  JornadaSemanal,
} from "@features/barberos/types/barberos.types"

/**
 * Un solo hook para toda la feature, incluidas la jornada y las ausencias: son
 * del barbero, no features aparte, y separarlas obligaría a la página a
 * orquestar tres estados de carga que siempre se miran juntos.
 *
 * Solo estado de API — la selección y los modales viven en el padre.
 */
export function useBarberos() {
  const [barberos, setBarberos] = useState<Barbero[]>([])
  const [jornada, setJornada] = useState<JornadaSemanal | null>(null)
  const [ausencias, setAusencias] = useState<Ausencia[]>([])
  const [excepciones, setExcepciones] = useState<ExcepcionJornada[]>([])
  /** La ficha de quien está en sesión. `null` = no atiende, y es un caso normal. */
  const [miPerfil, setMiPerfil] = useState<Barbero | null>(null)
  const [loadingMiPerfil, setLoadingMiPerfil] = useState(false)
  const [loadingLista, setLoadingLista] = useState(false)
  const [loadingDisponibilidad, setLoadingDisponibilidad] = useState(false)
  const [loadingAction, setLoadingAction] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBarberos = useCallback(async (filtros: FiltrosBarberos = {}) => {
    setLoadingLista(true)
    setError(null)
    try {
      const res = await barberosService.obtenerBarberos({ ...filtros, paginar: false })
      setBarberos(res.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingLista(false)
    }
  }, [])

  /**
   * Jornada, ausencias y días especiales en la misma llamada: la pantalla de
   * disponibilidad no sirve con una sola, y pedirlas por separado deja un
   * estado intermedio en el que la semana se pinta sin sus excepciones.
   */
  const fetchDisponibilidad = useCallback(async (barberoId: string) => {
    setLoadingDisponibilidad(true)
    setError(null)
    try {
      const [resJornada, resAusencias, resExcepciones] = await Promise.all([
        barberosService.obtenerJornada(barberoId),
        barberosService.obtenerAusencias(barberoId, { paginar: false }),
        barberosService.obtenerExcepciones(barberoId),
      ])
      setJornada(resJornada.data)
      setAusencias(resAusencias.data)
      setExcepciones(resExcepciones.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingDisponibilidad(false)
    }
  }, [])

  /**
   * La ficha de barbero de quien está en sesión, o `null` si no atiende. `null`
   * no es un error: el administrador que no corta es el caso normal.
   */
  const fetchMiPerfil = useCallback(async () => {
    setLoadingMiPerfil(true)
    setError(null)
    try {
      const res = await barberosService.obtenerMiPerfil()
      setMiPerfil(res.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingMiPerfil(false)
    }
  }, [])

  /** «Yo también atiendo». Repetirlo reactiva la ficha, no abre una segunda. */
  const handleAtenderYo = useCallback(async (payload: DatosAtiendoYo): Promise<string> => {
    setLoadingAction(true)
    try {
      const res = await barberosService.atenderYo(payload)
      setMiPerfil(res.data)
      return res.message
    } catch (err) {
      throw new Error(getErrorMessage(err))
    } finally {
      setLoadingAction(false)
    }
  }, [])

  const handleDejarDeAtender = useCallback(async (): Promise<string> => {
    setLoadingAction(true)
    try {
      const res = await barberosService.dejarDeAtender()
      setMiPerfil(res.data)
      return res.message
    } catch (err) {
      throw new Error(getErrorMessage(err))
    } finally {
      setLoadingAction(false)
    }
  }, [])

  const handleCreateBarbero = useCallback(async (payload: DatosBarbero): Promise<string> => {
    setLoadingAction(true)
    try {
      const res = await barberosService.crearBarbero(payload)
      return res.message
    } catch (err) {
      throw new Error(getErrorMessage(err))
    } finally {
      setLoadingAction(false)
    }
  }, [])

  const handleUpdateBarbero = useCallback(
    async (id: string, payload: DatosBarbero): Promise<string> => {
      setLoadingAction(true)
      try {
        const res = await barberosService.actualizarBarbero(id, payload)
        return res.message
      } catch (err) {
        throw new Error(getErrorMessage(err))
      } finally {
        setLoadingAction(false)
      }
    },
    []
  )

  const handleToggleBarbero = useCallback(async (barbero: Barbero): Promise<string> => {
    setLoadingAction(true)
    try {
      const res = barbero.activo
        ? await barberosService.desactivarBarbero(barbero.id)
        : await barberosService.activarBarbero(barbero.id)
      return res.message
    } catch (err) {
      throw new Error(getErrorMessage(err))
    } finally {
      setLoadingAction(false)
    }
  }, [])

  const handleReplaceJornada = useCallback(
    async (barberoId: string, payload: DatosJornada): Promise<string> => {
      setLoadingAction(true)
      try {
        const res = await barberosService.reemplazarJornada(barberoId, payload)
        setJornada(res.data)
        return res.message
      } catch (err) {
        throw new Error(getErrorMessage(err))
      } finally {
        setLoadingAction(false)
      }
    },
    []
  )

  /**
   * Devuelve el aviso con las citas que quedaron dentro del rango. La ausencia
   * NO las cancela: son clientes ya citados y hay que reasignarlos a mano.
   */
  const handleCreateAusencia = useCallback(
    async (barberoId: string, payload: DatosAusencia): Promise<string> => {
      setLoadingAction(true)
      try {
        const res = await barberosService.programarAusencia(barberoId, payload)
        const { citasPisadas } = res.data
        return citasPisadas > 0
          ? `${res.message}. Quedan ${citasPisadas} citas dentro del rango que hay que reasignar`
          : res.message
      } catch (err) {
        throw new Error(getErrorMessage(err))
      } finally {
        setLoadingAction(false)
      }
    },
    []
  )

  /** Se escribe por fecha: repetir el mismo día sustituye la excepción anterior. */
  const handleGuardarExcepcion = useCallback(
    async (barberoId: string, payload: DatosExcepcion): Promise<string> => {
      setLoadingAction(true)
      try {
        const res = await barberosService.guardarExcepcion(barberoId, payload)
        return res.message
      } catch (err) {
        throw new Error(getErrorMessage(err))
      } finally {
        setLoadingAction(false)
      }
    },
    []
  )

  const handleEliminarExcepcion = useCallback(
    async (barberoId: string, excepcionId: string): Promise<string> => {
      setLoadingAction(true)
      try {
        const res = await barberosService.eliminarExcepcion(barberoId, excepcionId)
        return res.message
      } catch (err) {
        throw new Error(getErrorMessage(err))
      } finally {
        setLoadingAction(false)
      }
    },
    []
  )

  const handleApproveAusencia = useCallback(
    async (barberoId: string, ausenciaId: string): Promise<string> => {
      setLoadingAction(true)
      try {
        const res = await barberosService.aprobarAusencia(barberoId, ausenciaId)
        return res.message
      } catch (err) {
        throw new Error(getErrorMessage(err))
      } finally {
        setLoadingAction(false)
      }
    },
    []
  )

  const handleCancelAusencia = useCallback(
    async (barberoId: string, ausenciaId: string): Promise<string> => {
      setLoadingAction(true)
      try {
        const res = await barberosService.cancelarAusencia(barberoId, ausenciaId)
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
    barberos,
    jornada,
    ausencias,
    excepciones,
    miPerfil,
    loadingLista,
    loadingDisponibilidad,
    loadingMiPerfil,
    loadingAction,
    error,
    fetchBarberos,
    fetchDisponibilidad,
    fetchMiPerfil,
    handleAtenderYo,
    handleDejarDeAtender,
    handleCreateBarbero,
    handleUpdateBarbero,
    handleToggleBarbero,
    handleReplaceJornada,
    handleGuardarExcepcion,
    handleEliminarExcepcion,
    handleCreateAusencia,
    handleApproveAusencia,
    handleCancelAusencia,
  }
}
