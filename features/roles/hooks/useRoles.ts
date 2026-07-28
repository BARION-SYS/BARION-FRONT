"use client"

import { useCallback, useState } from "react"
import { rolesService } from "@features/roles/services/roles.service"
import { getErrorMessage } from "@shared/utils/error"
import type {
  DatosEditarRol,
  DatosExcepciones,
  DatosRol,
} from "@features/roles/schemas/roles.schema"
import type { ExcepcionPermiso, Permiso, Rol } from "@features/roles/types/roles.types"

// Solo estado de API — el estado de UI (modales, selección) vive en el padre.
export function useRoles() {
  const [roles, setRoles] = useState<Rol[]>([])
  const [permisos, setPermisos] = useState<Permiso[]>([])
  const [excepciones, setExcepciones] = useState<ExcepcionPermiso[]>([])
  const [loadingLista, setLoadingLista] = useState(false)
  const [loadingAction, setLoadingAction] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Roles y catálogo en la misma llamada: la pantalla no sirve de nada con uno
   * solo, y pedirlos por separado deja un estado intermedio en el que la matriz
   * se pinta sin columnas.
   */
  const fetchRoles = useCallback(async () => {
    setLoadingLista(true)
    setError(null)
    try {
      const [resRoles, resPermisos] = await Promise.all([
        rolesService.obtenerRoles(),
        rolesService.obtenerPermisos(),
      ])
      setRoles(resRoles.data)
      setPermisos(resPermisos.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingLista(false)
    }
  }, [])

  const fetchExcepciones = useCallback(async (membresiaId: string) => {
    setLoadingLista(true)
    try {
      const res = await rolesService.obtenerExcepciones(membresiaId)
      setExcepciones(res.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingLista(false)
    }
  }, [])

  const handleCreateRol = useCallback(async (payload: DatosRol): Promise<string> => {
    setLoadingAction(true)
    try {
      const res = await rolesService.crearRol(payload)
      return res.message
    } catch (err) {
      throw new Error(getErrorMessage(err))
    } finally {
      setLoadingAction(false)
    }
  }, [])

  const handleUpdateRol = useCallback(
    async (id: string, payload: DatosEditarRol): Promise<string> => {
      setLoadingAction(true)
      try {
        const res = await rolesService.actualizarRol(id, payload)
        return res.message
      } catch (err) {
        throw new Error(getErrorMessage(err))
      } finally {
        setLoadingAction(false)
      }
    },
    []
  )

  const handleDeleteRol = useCallback(async (id: string): Promise<string> => {
    setLoadingAction(true)
    try {
      const res = await rolesService.eliminarRol(id)
      return res.message
    } catch (err) {
      throw new Error(getErrorMessage(err))
    } finally {
      setLoadingAction(false)
    }
  }, [])

  const handleReplaceExcepciones = useCallback(
    async (membresiaId: string, payload: DatosExcepciones): Promise<string> => {
      setLoadingAction(true)
      try {
        const res = await rolesService.reemplazarExcepciones(membresiaId, payload)
        return res.message
      } catch (err) {
        throw new Error(getErrorMessage(err))
      } finally {
        setLoadingAction(false)
      }
    },
    []
  )

  return {
    roles,
    permisos,
    excepciones,
    loadingLista,
    loadingAction,
    error,
    fetchRoles,
    fetchExcepciones,
    handleCreateRol,
    handleUpdateRol,
    handleDeleteRol,
    handleReplaceExcepciones,
  }
}
