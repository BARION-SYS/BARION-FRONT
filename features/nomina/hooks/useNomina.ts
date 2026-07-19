"use client"

import { useCallback, useState } from "react"
import { nominaService } from "@features/nomina/services/nomina.service"
import type {
  NominaBarbero,
  OpcionPeriodoNomina,
  PeriodoNomina,
} from "@features/nomina/types/nomina.types"
import { getErrorMessage } from "@shared/utils/error"

// Solo estado de API — el estado de UI (periodo activo, selección) vive en el padre.
export function useNomina() {
  const [periodos, setPeriodos] = useState<OpcionPeriodoNomina[]>([])
  const [nominaBarberos, setNominaBarberos] = useState<NominaBarbero[]>([])
  const [loadingNomina, setLoadingNomina] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNomina = useCallback(async (periodo: PeriodoNomina) => {
    setLoadingNomina(true)
    setError(null)
    try {
      const [resPeriodos, resBarberos] = await Promise.all([
        nominaService.obtenerPeriodos(),
        nominaService.obtenerNominaBarberos(periodo),
      ])
      setPeriodos(resPeriodos.data)
      setNominaBarberos(resBarberos.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingNomina(false)
    }
  }, [])

  return { periodos, nominaBarberos, loadingNomina, error, fetchNomina }
}
