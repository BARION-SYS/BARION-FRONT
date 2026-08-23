"use client"

import { useCallback, useState } from "react"
import { segmentosService } from "@features/segmentos/services/segmentos.service"
import { getErrorMessage } from "@shared/utils/error"
import type { DatosSegmento } from "@features/segmentos/schemas/segmentos.schema"
import type { FiltrosSegmentos, Segmento } from "@features/segmentos/types/segmentos.types"

/**
 * Solo estado de API — modales, selección y filtros viven en la página.
 *
 * El listado se pide SIN paginar y sin filtrar por activos: una barbería tiene
 * un puñado de etiquetas, no un catálogo, y esta pantalla existe justamente para
 * ver también las que están de baja y poder revivirlas. Paginar aquí escondería
 * la mitad del trabajo que la pantalla viene a hacer.
 */
export function useSegmentos() {
  const [segmentos, setSegmentos] = useState<Segmento[]>([])
  const [loadingLista, setLoadingLista] = useState(false)
  const [loadingAction, setLoadingAction] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSegmentos = useCallback(async (filtros: FiltrosSegmentos = {}) => {
    setLoadingLista(true)
    setError(null)
    try {
      const res = await segmentosService.obtenerSegmentos({ paginar: false, ...filtros })
      setSegmentos(res.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingLista(false)
    }
  }, [])

  const handleCreateSegmento = useCallback(async (payload: DatosSegmento): Promise<string> => {
    setLoadingAction(true)
    try {
      const res = await segmentosService.crearSegmento(payload)
      return res.message
    } finally {
      setLoadingAction(false)
    }
  }, [])

  const handleUpdateSegmento = useCallback(
    async (id: string, payload: DatosSegmento): Promise<string> => {
      setLoadingAction(true)
      try {
        const res = await segmentosService.actualizarSegmento(id, payload)
        return res.message
      } finally {
        setLoadingAction(false)
      }
    },
    []
  )

  const handleDeactivateSegmento = useCallback(async (id: string): Promise<string> => {
    setLoadingAction(true)
    try {
      const res = await segmentosService.desactivarSegmento(id)
      return res.message
    } finally {
      setLoadingAction(false)
    }
  }, [])

  const handleActivateSegmento = useCallback(async (id: string): Promise<string> => {
    setLoadingAction(true)
    try {
      const res = await segmentosService.activarSegmento(id)
      return res.message
    } finally {
      setLoadingAction(false)
    }
  }, [])

  return {
    segmentos,
    loadingLista,
    loadingAction,
    error,
    fetchSegmentos,
    handleCreateSegmento,
    handleUpdateSegmento,
    handleDeactivateSegmento,
    handleActivateSegmento,
  }
}
