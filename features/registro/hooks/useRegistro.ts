"use client"

import { useCallback, useState } from "react"
import { registroService } from "@features/registro/services/registro.service"
import { esSlugUtilizable, slugDesdeNombre } from "@features/registro/utils/slug"
import type { DatosRegistro, DatosRegistroGoogle } from "@features/registro/schemas/registro.schema"
import type {
  PaisOperado,
  PreregistroGoogle,
  RegistroVista,
} from "@features/registro/types/registro.types"
import { getErrorMessage, motivoDeError } from "@shared/utils/error"

/** Único hook del feature: solo estado de API. La UI vive en la página. */
export function useRegistro() {
  const [registro, setRegistro] = useState<RegistroVista | null>(null)
  const [slug, setSlug] = useState<string | null>(null)
  /** La dirección que salió del nombre estaba tomada y la API dio otra. */
  const [slugAjustado, setSlugAjustado] = useState(false)
  /** Quién vuelve de Google. `null` mientras no se haya pasado por ahí. */
  const [preregistro, setPreregistro] = useState<PreregistroGoogle | null>(null)
  /**
   * El pase de Google murió con el formulario ya en pantalla.
   *
   * Se distingue del `error` normal porque **no se arregla reintentando**: lo
   * que hay que ofrecer es rehacer el viaje al proveedor, no volver a enviar los
   * mismos datos. Sin esta rama, la pantalla se quedaba pidiendo un envío que
   * siempre iba a devolver el mismo 401.
   */
  const [paseCaducado, setPaseCaducado] = useState(false)
  const [loadingPreregistro, setLoadingPreregistro] = useState(false)
  const [loadingRegistro, setLoadingRegistro] = useState(false)
  const [loadingSlug, setLoadingSlug] = useState(false)
  const [error, setError] = useState<string | null>(null)
  /**
   * Dónde opera Barion. `null` mientras no se sepa —**distinto de una lista
   * vacía**, que significaría que no opera en ningún sitio—: con `null` el
   * selector cae a lo que este repo sabe formatear, que enseña de más antes que
   * dejar a alguien sin poder elegir su país.
   */
  const [paises, setPaises] = useState<PaisOperado[] | null>(null)

  /**
   * Su fallo NO es un error del formulario: sin lista, el selector se queda con
   * las regiones conocidas y el alta responde 422 si el país no está abierto,
   * que es su trabajo. Asustar por una lectura de catálogo sería peor.
   */
  const fetchPaises = useCallback(async () => {
    try {
      const res = await registroService.obtenerPaisesOperados()
      setPaises(res.data)
    } catch {
      setPaises(null)
    }
  }, [])

  const handleRegistrarBarberia = useCallback(async (datos: DatosRegistro): Promise<string> => {
    setLoadingRegistro(true)
    setError(null)
    try {
      const res = await registroService.registrarBarberia(datos)
      setRegistro(res.data)
      return res.message
    } catch (err) {
      setError(getErrorMessage(err))
      throw err
    } finally {
      setLoadingRegistro(false)
    }
  }, [])

  /**
   * Con qué cuenta vuelve de Google.
   *
   * Su fallo NO es un error que enseñar: significa que no hay pase —nunca lo
   * hubo, o caducó mientras se rellenaba— y lo único que hay que hacer es
   * dejar el formulario en su modo de siempre, con contraseña. Contarlo como
   * error pintaría una alerta a quien entró a registrarse por su cuenta.
   */
  const fetchPreregistroGoogle = useCallback(async () => {
    setLoadingPreregistro(true)
    try {
      const res = await registroService.obtenerPreregistroGoogle()
      setPreregistro(res.data)
    } catch {
      setPreregistro(null)
    } finally {
      setLoadingPreregistro(false)
    }
  }, [])

  const handleRegistrarConGoogle = useCallback(
    async (datos: DatosRegistroGoogle): Promise<string> => {
      setLoadingRegistro(true)
      setError(null)
      try {
        const res = await registroService.registrarConGoogle(datos)
        setRegistro(res.data)
        return res.message
      } catch (err) {
        // El pase caducado NO es un error del formulario: los datos escritos
        // están bien y reenviarlos volvería a fallar igual. Se retira el
        // formulario —`preregistro` a `null`— y la página ofrece rehacer el
        // viaje a Google, que es lo único que lo arregla.
        if (motivoDeError(err) === "preregistro_invalido") {
          setPreregistro(null)
          setPaseCaducado(true)
        } else {
          setError(getErrorMessage(err))
        }
        throw err
      } finally {
        setLoadingRegistro(false)
      }
    },
    []
  )

  /**
   * Identificador libre a partir del nombre. **Una sola petición**: si la
   * dirección base está ocupada, la API devuelve en la misma respuesta la
   * primera variante que no lo esté (`-2`, `-3`…).
   *
   * Su fallo NO es un error del formulario. Sin respuesta se deja sin resolver y
   * el alta lo decidirá con su propio 409 — asustar por una red lenta es peor
   * que enterarse un segundo más tarde.
   */
  const fetchSlugLibre = useCallback(async (nombreComercial: string) => {
    const base = slugDesdeNombre(nombreComercial)
    if (!esSlugUtilizable(base)) {
      setSlug(null)
      setSlugAjustado(false)
      return
    }

    setLoadingSlug(true)
    try {
      const res = await registroService.verificarSlug(base)
      setSlug(res.data.sugerencia)
      setSlugAjustado(!res.data.disponible && res.data.sugerencia !== null)
    } catch {
      setSlug(null)
      setSlugAjustado(false)
    } finally {
      setLoadingSlug(false)
    }
  }, [])

  const limpiarSlug = useCallback(() => {
    setSlug(null)
    setSlugAjustado(false)
  }, [])

  /**
   * El enlace del correo. Devuelve el mensaje de la api al confirmar y relanza
   * el error para que la página distinga «listo» de «este enlace ya no sirve» —
   * la api responde lo mismo para caducado, usado e inexistente, a propósito.
   */
  const handleVerificarCorreoRegistro = useCallback(async (token: string): Promise<string> => {
    setLoadingRegistro(true)
    setError(null)
    try {
      const res = await registroService.verificarCorreo(token)
      return res.message
    } catch (err) {
      setError(getErrorMessage(err))
      throw err
    } finally {
      setLoadingRegistro(false)
    }
  }, [])

  return {
    registro,
    slug,
    slugAjustado,
    preregistro,
    paises,
    fetchPaises,
    paseCaducado,
    loadingPreregistro,
    loadingRegistro,
    loadingSlug,
    error,
    handleRegistrarBarberia,
    handleRegistrarConGoogle,
    handleVerificarCorreoRegistro,
    fetchPreregistroGoogle,
    fetchSlugLibre,
    limpiarSlug,
  }
}
