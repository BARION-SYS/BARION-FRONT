"use client"

import { useCallback, useState } from "react"
import { clientesService } from "@features/clientes/services/clientes.service"
import { getErrorMessage } from "@shared/utils/error"
import type { DatosCliente, DatosConsentimiento } from "@features/clientes/schemas/clientes.schema"
import type {
  Cliente,
  Consentimientos,
  FiltrosClientes,
  Segmento,
  Visita,
} from "@features/clientes/types/clientes.types"

/**
 * Solo estado de API — el estado de UI (selección, modales, filtros) vive en el
 * padre.
 *
 * Los segmentos van aquí y no en una feature aparte: son la etiqueta del
 * cliente, se piden para el mismo filtro y no existen sin él.
 */
export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [segmentos, setSegmentos] = useState<Segmento[]>([])
  const [historial, setHistorial] = useState<Visita[]>([])
  const [consentimientos, setConsentimientos] = useState<Consentimientos | null>(null)
  const [loadingLista, setLoadingLista] = useState(false)
  const [loadingHistorial, setLoadingHistorial] = useState(false)
  const [loadingAction, setLoadingAction] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchClientes = useCallback(async (filtros: FiltrosClientes = {}) => {
    setLoadingLista(true)
    setError(null)
    try {
      const res = await clientesService.obtenerClientes(filtros)
      setClientes(res.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingLista(false)
    }
  }, [])

  const fetchSegmentos = useCallback(async () => {
    try {
      const res = await clientesService.obtenerSegmentos()
      setSegmentos(res.data)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }, [])

  /**
   * Las visitas y los permisos de comunicación se piden juntos: son las dos
   * pestañas de la misma ficha y separarlos dejaría media pantalla en blanco.
   */
  const fetchFicha = useCallback(async (clienteId: string) => {
    setLoadingHistorial(true)
    try {
      const [visitas, permisos] = await Promise.all([
        clientesService.obtenerHistorial(clienteId),
        clientesService.obtenerConsentimientos(clienteId),
      ])
      setHistorial(visitas.data)
      setConsentimientos(permisos.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingHistorial(false)
    }
  }, [])

  const handleCreateCliente = useCallback(async (payload: DatosCliente): Promise<string> => {
    setLoadingAction(true)
    try {
      const res = await clientesService.crearCliente(payload)
      return res.message
    } catch (err) {
      throw new Error(getErrorMessage(err))
    } finally {
      setLoadingAction(false)
    }
  }, [])

  const handleUpdateCliente = useCallback(
    async (id: string, payload: DatosCliente): Promise<string> => {
      setLoadingAction(true)
      try {
        const res = await clientesService.actualizarCliente(id, payload)
        return res.message
      } catch (err) {
        throw new Error(getErrorMessage(err))
      } finally {
        setLoadingAction(false)
      }
    },
    []
  )

  const handleRegistrarConsentimiento = useCallback(
    async (id: string, payload: DatosConsentimiento): Promise<string> => {
      setLoadingAction(true)
      try {
        const res = await clientesService.registrarConsentimiento(id, payload)
        // Se relee: el vigente de cada tipo lo resuelve la api, no este hook.
        const permisos = await clientesService.obtenerConsentimientos(id)
        setConsentimientos(permisos.data)
        return res.message
      } catch (err) {
        throw new Error(getErrorMessage(err))
      } finally {
        setLoadingAction(false)
      }
    },
    []
  )

  /** Irreversible: quien lo llame tiene que haber confirmado antes. */
  const handleAnonimizarCliente = useCallback(async (id: string): Promise<string> => {
    setLoadingAction(true)
    try {
      const res = await clientesService.anonimizarCliente(id)
      return res.message
    } catch (err) {
      throw new Error(getErrorMessage(err))
    } finally {
      setLoadingAction(false)
    }
  }, [])

  return {
    clientes,
    segmentos,
    historial,
    consentimientos,
    loadingLista,
    loadingHistorial,
    loadingAction,
    error,
    fetchClientes,
    fetchSegmentos,
    fetchFicha,
    handleCreateCliente,
    handleUpdateCliente,
    handleRegistrarConsentimiento,
    handleAnonimizarCliente,
  }
}
