"use client"

import { useCallback, useState } from "react"
import { suscripcionService } from "@features/suscripcion/services/suscripcion.service"
import { getErrorMessage } from "@shared/utils/error"
import type {
  DatosDatosFiscales,
  DatosElegirPlan,
} from "@features/suscripcion/schemas/suscripcion.schema"
import type {
  DatosFiscales,
  Factura,
  FacturaDetalle,
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
  const [facturaDetalle, setFacturaDetalle] = useState<FacturaDetalle | null>(null)
  const [datosFiscales, setDatosFiscales] = useState<DatosFiscales | null>(null)
  /**
   * El país del NEGOCIO, no el de la sesión: decide qué campos pide el
   * formulario fiscal. Llega con los datos porque viaja aunque no los haya.
   */
  const [paisFiscal, setPaisFiscal] = useState<string | null>(null)
  const [loadingDatosFiscales, setLoadingDatosFiscales] = useState(false)
  const [loadingSuscripcion, setLoadingSuscripcion] = useState(false)
  const [loadingFacturas, setLoadingFacturas] = useState(false)
  const [loadingFacturaDetalle, setLoadingFacturaDetalle] = useState(false)
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

  /**
   * El detalle se pide al abrir una factura, no con el listado: son las líneas
   * de un documento concreto. El anterior se descarta al empezar, para que el
   * panel no enseñe un instante el desglose de la factura que se acaba de
   * cerrar — que es el error que hace dudar de una cifra correcta.
   */
  const fetchFactura = useCallback(async (facturaId: string) => {
    setLoadingFacturaDetalle(true)
    setFacturaDetalle(null)
    try {
      const res = await suscripcionService.obtenerFactura(facturaId)
      setFacturaDetalle(res.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingFacturaDetalle(false)
    }
  }, [])

  /**
   * `datosFiscales` en `null` **no es un fallo**: es lo normal mientras la
   * barbería está probando y nadie le ha pedido su NIT.
   */
  const fetchDatosFiscales = useCallback(async () => {
    setLoadingDatosFiscales(true)
    try {
      const res = await suscripcionService.obtenerDatosFiscales()
      setDatosFiscales(res.data.datosFiscales)
      setPaisFiscal(res.data.codigoPais)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingDatosFiscales(false)
    }
  }, [])

  const handleGuardarDatosFiscales = useCallback(
    async (payload: DatosDatosFiscales): Promise<string> => {
      setLoadingAction(true)
      try {
        const res = await suscripcionService.guardarDatosFiscales(payload)
        setDatosFiscales(res.data)
        return res.message
      } catch (err) {
        throw new Error(getErrorMessage(err))
      } finally {
        setLoadingAction(false)
      }
    },
    []
  )

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
    facturaDetalle,
    datosFiscales,
    paisFiscal,
    loadingSuscripcion,
    loadingFacturas,
    loadingFacturaDetalle,
    loadingDatosFiscales,
    loadingAction,
    error,
    fetchSuscripcion,
    fetchFacturas,
    fetchFactura,
    fetchDatosFiscales,
    handleGuardarDatosFiscales,
    handleElegirPlanSuscripcion,
    handleCancelarSuscripcion,
    handleReanudarSuscripcion,
  }
}
