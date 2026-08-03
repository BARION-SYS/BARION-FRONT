"use client"

import { useCallback, useState } from "react"
import { suscripcionService } from "@features/suscripcion/services/suscripcion.service"
import { getErrorMessage } from "@shared/utils/error"
import type { DatosElegirPlan } from "@features/suscripcion/schemas/suscripcion.schema"
import type {
  Factura,
  FiltrosFacturas,
  PlanPublicado,
  Suscripcion,
} from "@features/suscripcion/types/suscripcion.types"

/**
 * Solo estado de API — el estado de UI vive en el padre.
 *
 * La suscripción, el catálogo y las facturas van en el mismo hook porque son la
 * misma pantalla: elegir plan exige comparar contra lo contratado, y lo cobrado
 * es la prueba de lo que ese plan costó.
 *
 * Las tres mutaciones devuelven la suscripción ya actualizada, así que el estado
 * se refresca sin volver a pedirla: la api acaba de decir cómo quedó.
 */
export function useSuscripcion() {
  const [suscripcion, setSuscripcion] = useState<Suscripcion | null>(null)
  const [planes, setPlanes] = useState<PlanPublicado[]>([])
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [loadingSuscripcion, setLoadingSuscripcion] = useState(false)
  const [loadingFacturas, setLoadingFacturas] = useState(false)
  const [loadingAction, setLoadingAction] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSuscripcion = useCallback(async () => {
    setLoadingSuscripcion(true)
    setError(null)
    try {
      const [cuenta, catalogo] = await Promise.all([
        suscripcionService.obtenerSuscripcion(),
        suscripcionService.obtenerPlanes(),
      ])
      setSuscripcion(cuenta.data)
      setPlanes(catalogo.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingSuscripcion(false)
    }
  }, [])

  const fetchFacturas = useCallback(async (filtros: FiltrosFacturas = {}) => {
    setLoadingFacturas(true)
    try {
      const res = await suscripcionService.obtenerFacturas(filtros)
      setFacturas(res.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingFacturas(false)
    }
  }, [])

  const handleElegirPlanSuscripcion = useCallback(
    async (payload: DatosElegirPlan): Promise<string> => {
      setLoadingAction(true)
      try {
        const res = await suscripcionService.elegirPlan(payload)
        setSuscripcion(res.data)
        // El mensaje lo escribe la api y no se reescribe aquí: es el que
        // distingue el cambio limpio del que deja la cuenta sobre su tope.
        return res.message
      } catch (err) {
        throw new Error(getErrorMessage(err))
      } finally {
        setLoadingAction(false)
      }
    },
    []
  )

  const handleCancelarSuscripcion = useCallback(async (): Promise<string> => {
    setLoadingAction(true)
    try {
      const res = await suscripcionService.cancelarSuscripcion()
      setSuscripcion(res.data)
      return res.message
    } catch (err) {
      throw new Error(getErrorMessage(err))
    } finally {
      setLoadingAction(false)
    }
  }, [])

  const handleReanudarSuscripcion = useCallback(async (): Promise<string> => {
    setLoadingAction(true)
    try {
      const res = await suscripcionService.reanudarSuscripcion()
      setSuscripcion(res.data)
      return res.message
    } catch (err) {
      throw new Error(getErrorMessage(err))
    } finally {
      setLoadingAction(false)
    }
  }, [])

  return {
    suscripcion,
    planes,
    facturas,
    loadingSuscripcion,
    loadingFacturas,
    loadingAction,
    error,
    fetchSuscripcion,
    fetchFacturas,
    handleElegirPlanSuscripcion,
    handleCancelarSuscripcion,
    handleReanudarSuscripcion,
  }
}
