"use client"

import { useCallback, useState } from "react"
import { clientesService } from "@features/clientes/services/clientes.service"
import { getErrorMessage } from "@shared/utils/error"
import type { DatosCliente } from "@features/clientes/schemas/clientes.schema"
import type {
  Cliente,
  ResumenClientes,
  ServicioHistorial,
} from "@features/clientes/types/clientes.types"

// SOLO estado de API del feat — el estado de UI vive en el contenedor.
export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [historial, setHistorial] = useState<ServicioHistorial[]>([])
  const [resumen, setResumen] = useState<ResumenClientes | null>(null)
  const [loadingLista, setLoadingLista] = useState(false)
  const [loadingHistorial, setLoadingHistorial] = useState(false)
  const [loadingAction, setLoadingAction] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchClientes = useCallback(async () => {
    setLoadingLista(true)
    setError(null)
    try {
      const [resClientes, resResumen] = await Promise.all([
        clientesService.obtenerClientes(),
        clientesService.obtenerResumenClientes(),
      ])
      setClientes(resClientes.data)
      setResumen(resResumen.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingLista(false)
    }
  }, [])

  const fetchHistorial = useCallback(async (clienteId: Cliente["id"]) => {
    setLoadingHistorial(true)
    setError(null)
    try {
      const res = await clientesService.obtenerHistorialServicios(clienteId)
      setHistorial(res.data)
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
    async (id: Cliente["id"], payload: DatosCliente): Promise<string> => {
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

  const handleDeleteCliente = useCallback(async (id: Cliente["id"]): Promise<string> => {
    setLoadingAction(true)
    try {
      const res = await clientesService.eliminarCliente(id)
      return res.message
    } catch (err) {
      throw new Error(getErrorMessage(err))
    } finally {
      setLoadingAction(false)
    }
  }, [])

  return {
    clientes,
    historial,
    resumen,
    loadingLista,
    loadingHistorial,
    loadingAction,
    error,
    fetchClientes,
    fetchHistorial,
    handleCreateCliente,
    handleUpdateCliente,
    handleDeleteCliente,
  }
}
