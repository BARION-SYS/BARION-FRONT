"use client"

import { useCallback, useState } from "react"
import { portalService } from "@features/portal/services/portal.service"
import type {
  DatosAcceso,
  DatosCodigo,
  DatosRegistro,
  DatosReserva,
} from "@features/portal/schemas/portal.schema"
import type {
  BarberiaPortal,
  BarberoPortal,
  CitaCliente,
  ClientePortal,
  DiaAgenda,
  ReservaConfirmada,
  ServicioPortal,
} from "@features/portal/types/portal.types"
import { getErrorMessage } from "@shared/utils/error"

// Único hook del portal público — solo estado de API; el flujo (paso, selección) vive en la página.
export function usePortal() {
  const [barberia, setBarberia] = useState<BarberiaPortal | null>(null)
  const [servicios, setServicios] = useState<ServicioPortal[]>([])
  const [barberos, setBarberos] = useState<BarberoPortal[]>([])
  const [agenda, setAgenda] = useState<DiaAgenda[]>([])
  const [reserva, setReserva] = useState<ReservaConfirmada | null>(null)
  const [citas, setCitas] = useState<CitaCliente[]>([])
  const [cliente, setCliente] = useState<ClientePortal | null>(null)
  const [loadingPortal, setLoadingPortal] = useState(false)
  const [loadingAgenda, setLoadingAgenda] = useState(false)
  const [loadingCitas, setLoadingCitas] = useState(false)
  const [loadingAction, setLoadingAction] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPortal = useCallback(async (slug: string) => {
    setLoadingPortal(true)
    setError(null)
    try {
      const [resBarberia, resServicios, resBarberos] = await Promise.all([
        portalService.obtenerBarberia(slug),
        portalService.obtenerServicios(),
        portalService.obtenerBarberos(),
      ])
      setBarberia(resBarberia.data)
      setServicios(resServicios.data)
      setBarberos(resBarberos.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingPortal(false)
    }
  }, [])

  const fetchAgenda = useCallback(async (servicioId: number, barberoId: number) => {
    setLoadingAgenda(true)
    setError(null)
    try {
      const res = await portalService.obtenerAgenda(servicioId, barberoId)
      setAgenda(res.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingAgenda(false)
    }
  }, [])

  const handleSolicitarCodigoPortal = useCallback(async (payload: DatosAcceso): Promise<string> => {
    setLoadingAction(true)
    try {
      const res = await portalService.solicitarCodigo(payload)
      return res.message
    } catch (err) {
      setError(getErrorMessage(err))
      throw err
    } finally {
      setLoadingAction(false)
    }
  }, [])

  const handleConfirmarReservaPortal = useCallback(
    async (payload: DatosReserva, codigo: DatosCodigo): Promise<string> => {
      setLoadingAction(true)
      try {
        const res = await portalService.confirmarReserva(payload, codigo)
        setReserva(res.data)
        return res.message
      } catch (err) {
        setError(getErrorMessage(err))
        throw err
      } finally {
        setLoadingAction(false)
      }
    },
    []
  )

  const handleRegistrarClientePortal = useCallback(
    async (payload: DatosRegistro): Promise<string> => {
      setLoadingAction(true)
      try {
        const res = await portalService.registrarCliente(payload)
        setCliente(res.data)
        return res.message
      } catch (err) {
        setError(getErrorMessage(err))
        throw err
      } finally {
        setLoadingAction(false)
      }
    },
    []
  )

  // Consulta con cuerpo (el teléfono verificado) — es lectura, no mutación.
  const fetchCitasCliente = useCallback(async (payload: DatosAcceso) => {
    setLoadingCitas(true)
    setError(null)
    try {
      const res = await portalService.obtenerCitasCliente(payload)
      setCitas(res.data)
    } catch (err) {
      setError(getErrorMessage(err))
      throw err
    } finally {
      setLoadingCitas(false)
    }
  }, [])

  const handleCancelarCitaPortal = useCallback(async (id: number): Promise<string> => {
    setLoadingAction(true)
    try {
      const res = await portalService.cancelarCitaCliente(id)
      return res.message
    } catch (err) {
      setError(getErrorMessage(err))
      throw err
    } finally {
      setLoadingAction(false)
    }
  }, [])

  return {
    barberia,
    servicios,
    barberos,
    agenda,
    reserva,
    citas,
    cliente,
    loadingPortal,
    loadingAgenda,
    loadingCitas,
    loadingAction,
    error,
    fetchPortal,
    fetchAgenda,
    fetchCitasCliente,
    handleSolicitarCodigoPortal,
    handleRegistrarClientePortal,
    handleConfirmarReservaPortal,
    handleCancelarCitaPortal,
  }
}
