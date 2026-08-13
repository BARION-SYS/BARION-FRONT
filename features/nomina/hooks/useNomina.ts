"use client"

import { useCallback, useState } from "react"
import { nominaService } from "@features/nomina/services/nomina.service"
import type { FiltrosGanancias, Ganancia, ResumenNomina } from "@features/nomina/types/nomina.types"
import { getErrorMessage } from "@shared/utils/error"

// Solo estado de API — el periodo activo y la selección viven en el padre.
export function useNomina() {
  const [resumen, setResumen] = useState<ResumenNomina[]>([])
  const [asientos, setAsientos] = useState<Ganancia[]>([])
  const [loadingResumen, setLoadingResumen] = useState(false)
  const [loadingAsientos, setLoadingAsientos] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingAction, setLoadingAction] = useState(false)

  const fetchResumen = useCallback(async (filtros: FiltrosGanancias) => {
    setLoadingResumen(true)
    setError(null)
    try {
      const res = await nominaService.obtenerResumen(filtros)
      setResumen(res.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingResumen(false)
    }
  }, [])

  /** El detalle del barbero elegido: los asientos del mismo rango. */
  const fetchAsientos = useCallback(async (filtros: FiltrosGanancias) => {
    setLoadingAsientos(true)
    try {
      const res = await nominaService.obtenerGanancias({ ...filtros, limit: 100 })
      setAsientos(res.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingAsientos(false)
    }
  }, [])

  /**
   * Escribe el ajuste. Recibe los centavos ya convertidos: la moneda es de la
   * sede y quien la conoce es la pantalla, no este hook.
   */
  const handleCreateAjuste = useCallback(
    async (payload: {
      barberoId: string
      montoCentavos: string
      moneda: string
      motivo: string
      ganadoEn?: string
    }): Promise<string> => {
      setLoadingAction(true)
      try {
        const res = await nominaService.registrarAjuste(payload)
        return res.message
      } finally {
        setLoadingAction(false)
      }
    },
    []
  )

  return {
    handleCreateAjuste,
    loadingAction,
    resumen,
    asientos,
    loadingResumen,
    loadingAsientos,
    error,
    fetchResumen,
    fetchAsientos,
  }
}
