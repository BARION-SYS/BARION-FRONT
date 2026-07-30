"use client"

import { useCallback, useState } from "react"
import { catalogosService } from "@features/catalogos/services/catalogos.service"
import { getErrorMessage } from "@shared/utils/error"
import type { Catalogos } from "@features/catalogos/types/catalogos.types"

/**
 * Valores fijos (estados de cita, tipos de ausencia, canales) que la base
 * valida por CHECK o por enum nativo. Una sola llamada: no cambian entre
 * barberías ni durante la sesión.
 */
export function useCatalogos() {
  const [catalogos, setCatalogos] = useState<Catalogos | null>(null)
  const [loadingLista, setLoadingLista] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCatalogos = useCallback(async () => {
    setLoadingLista(true)
    setError(null)
    try {
      const res = await catalogosService.obtenerCatalogos()
      setCatalogos(res.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingLista(false)
    }
  }, [])

  return { catalogos, loadingLista, error, fetchCatalogos }
}
