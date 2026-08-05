"use client"

import { useCallback, useState } from "react"
import { pagosService } from "@features/pagos/services/pagos.service"
import { wompiService } from "@features/pagos/services/wompi.service"
import { aceptacionesEnOrden, mensajeDeErrorPasarela } from "@features/pagos/utils/pasarela"
import { getErrorMessage } from "@shared/utils/error"
import type { DatosTarjeta } from "@features/pagos/schemas/pagos.schema"
import type {
  AceptacionesPasarela,
  ConfiguracionPasarela,
  EnlacePago,
  MedioPago,
} from "@features/pagos/types/pagos.types"

/**
 * Solo estado de API — el estado de UI vive en el padre.
 *
 * Guardar una tarjeta son DOS conversaciones y por eso viven en el mismo hook:
 * el navegador tokeniza contra la pasarela y solo entonces Barion canjea ese
 * token. El número de tarjeta no pasa por la api ni se queda aquí.
 */
export function usePagos() {
  const [mediosPago, setMediosPago] = useState<MedioPago[]>([])
  const [configuracion, setConfiguracion] = useState<ConfiguracionPasarela | null>(null)
  const [aceptaciones, setAceptaciones] = useState<AceptacionesPasarela | null>(null)
  const [errorConfiguracion, setErrorConfiguracion] = useState<string | null>(null)
  const [enlaces, setEnlaces] = useState<EnlacePago[]>([])
  const [loadingMediosPago, setLoadingMediosPago] = useState(false)
  const [loadingEnlaces, setLoadingEnlaces] = useState(false)
  const [loadingConfiguracion, setLoadingConfiguracion] = useState(false)
  const [loadingAction, setLoadingAction] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMediosPago = useCallback(async () => {
    setLoadingMediosPago(true)
    setError(null)
    try {
      const res = await pagosService.listarMediosPago()
      setMediosPago(res.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingMediosPago(false)
    }
  }, [])

  const fetchEnlacesPago = useCallback(async () => {
    setLoadingEnlaces(true)
    setError(null)
    try {
      const res = await pagosService.listarEnlacesPago()
      setEnlaces(res.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingEnlaces(false)
    }
  }, [])

  /**
   * Con qué pasarela se tokeniza y qué hay que aceptar antes.
   *
   * El fallo se guarda aparte (`errorConfiguracion`) porque no es un fallo: un
   * país sin pasarela responde 422 con el texto que hay que enseñar, y lo que
   * cambia no es un aviso sino que el formulario de tarjeta no se monta.
   */
  const fetchConfiguracionPagos = useCallback(async () => {
    setLoadingConfiguracion(true)
    setErrorConfiguracion(null)
    try {
      const res = await pagosService.obtenerConfiguracion()
      setConfiguracion(res.data)
      // Las aceptaciones son de Wompi. Otro proveedor pedirá las suyas, o
      // ninguna: por eso se piden aquí y no dentro del guardado.
      setAceptaciones(
        res.data.proveedor === "wompi"
          ? await wompiService.obtenerAceptaciones(res.data.llavePublica, res.data.ambiente)
          : null
      )
    } catch (err) {
      setConfiguracion(null)
      setAceptaciones(null)
      setErrorConfiguracion(mensajeDeErrorPasarela(err))
    } finally {
      setLoadingConfiguracion(false)
    }
  }, [])

  /**
   * Tokenizar y guardar, en ese orden y siempre los dos.
   *
   * **El token se pide DENTRO de cada intento**, nunca se guarda en estado: es
   * de un solo uso, así que reintentar tras un rechazo de Barion tiene que
   * canjear la tarjeta otra vez. Reenviar el anterior fallaría siempre y por
   * otro motivo.
   */
  const handleGuardarMedioPago = useCallback(
    async (datos: DatosTarjeta): Promise<string> => {
      if (!configuracion) {
        throw new Error("Todavía no se sabe con qué pasarela cobrar. Recarga la página.")
      }

      setLoadingAction(true)
      try {
        const tokenEfimero = await wompiService.tokenizarTarjeta(
          datos,
          configuracion.llavePublica,
          configuracion.ambiente
        )
        const res = await pagosService.guardarMedioPago({
          tokenEfimero,
          aceptaciones: aceptacionesEnOrden(aceptaciones),
        })
        return res.message
      } catch (err) {
        throw new Error(mensajeDeErrorPasarela(err))
      } finally {
        setLoadingAction(false)
      }
    },
    [configuracion, aceptaciones]
  )

  /**
   * Retirar no promueve a nadie. El `message` de la api es el que avisa de que
   * la barbería se quedó sin con qué cobrar, así que se devuelve tal cual.
   */
  const handleRetirarMedioPago = useCallback(async (medioPagoId: string): Promise<string> => {
    setLoadingAction(true)
    try {
      const res = await pagosService.retirarMedioPago(medioPagoId)
      return res.message
    } catch (err) {
      throw new Error(getErrorMessage(err))
    } finally {
      setLoadingAction(false)
    }
  }, [])

  /**
   * Genera el enlace y devuelve el que acaba de nacer, no solo el mensaje: el
   * padre lo necesita entero para poder ofrecer copiarlo de inmediato, que es
   * justo lo que se hace con un enlace recién creado.
   */
  const handleGenerarEnlacePago = useCallback(async (): Promise<EnlacePago> => {
    setLoadingAction(true)
    try {
      const res = await pagosService.generarEnlacePago()
      return res.data
    } catch (err) {
      throw new Error(getErrorMessage(err))
    } finally {
      setLoadingAction(false)
    }
  }, [])

  return {
    mediosPago,
    enlaces,
    configuracion,
    aceptaciones,
    errorConfiguracion,
    loadingMediosPago,
    loadingEnlaces,
    loadingConfiguracion,
    loadingAction,
    error,
    fetchMediosPago,
    fetchEnlacesPago,
    fetchConfiguracionPagos,
    handleGuardarMedioPago,
    handleRetirarMedioPago,
    handleGenerarEnlacePago,
  }
}
