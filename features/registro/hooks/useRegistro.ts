"use client"

import { useCallback, useState } from "react"
import { registroService } from "@features/registro/services/registro.service"
import { esSlugUtilizable, slugDesdeNombre, varianteDeSlug } from "@features/registro/utils/slug"
import type { DatosRegistro } from "@features/registro/schemas/registro.schema"
import type { RegistroVista } from "@features/registro/types/registro.types"
import { getErrorMessage } from "@shared/utils/error"

/** Cuántas variantes se prueban antes de rendirse (`-2`, `-3`…). */
const INTENTOS_SLUG = 5

/** Único hook del feature: solo estado de API. La UI vive en la página. */
export function useRegistro() {
  const [registro, setRegistro] = useState<RegistroVista | null>(null)
  const [slug, setSlug] = useState<string | null>(null)
  const [loadingRegistro, setLoadingRegistro] = useState(false)
  const [loadingSlug, setLoadingSlug] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
   * Identificador libre a partir del nombre. Si la base está ocupada prueba
   * `-2`, `-3`… hasta un tope: sondear sin límite convertiría esto en una forma
   * cómoda de enumerar los clientes de Barion.
   *
   * Su fallo NO es un error del formulario. Sin respuesta se deja sin resolver y
   * el alta lo decidirá con su propio 409 — asustar por una red lenta es peor
   * que enterarse un segundo más tarde.
   */
  const fetchSlugLibre = useCallback(async (nombreComercial: string) => {
    const base = slugDesdeNombre(nombreComercial)
    if (!esSlugUtilizable(base)) {
      setSlug(null)
      return
    }

    setLoadingSlug(true)
    try {
      for (let intento = 1; intento <= INTENTOS_SLUG; intento++) {
        const candidato = varianteDeSlug(base, intento)
        const res = await registroService.verificarSlug(candidato)
        if (res.data.disponible) {
          setSlug(candidato)
          return
        }
      }
      setSlug(null)
    } catch {
      setSlug(null)
    } finally {
      setLoadingSlug(false)
    }
  }, [])

  const limpiarSlug = useCallback(() => setSlug(null), [])

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
    loadingRegistro,
    loadingSlug,
    error,
    handleRegistrarBarberia,
    handleVerificarCorreoRegistro,
    fetchSlugLibre,
    limpiarSlug,
  }
}
