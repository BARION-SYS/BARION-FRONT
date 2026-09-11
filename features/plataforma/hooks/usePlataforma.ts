"use client"

import { useCallback, useState } from "react"
import { plataformaService } from "@features/plataforma/services/plataforma.service"
import { getErrorMessage } from "@shared/utils/error"
import type {
  DatosAltaBarberia,
  DatosAltaStaff,
  DatosCambioEstado,
  DatosCorreccionSuscripcion,
  DatosPlanEdicion,
  DatosPlanNuevo,
} from "@features/plataforma/schemas/plataforma.schema"
import type {
  ActividadBarberia,
  BarberiaFicha,
  BarberiaInventario,
  FacturacionBarberia,
  FacturacionPlataforma,
  FiltrosActividad,
  FiltrosInventario,
  FiltrosSerieMensual,
  MesPlataforma,
  FiltrosPlanes,
  FiltrosSuscripciones,
  PlanAdmin,
  PaisAdmin,
  PlanPlataforma,
  StaffCreado,
  StaffPlataforma,
  SuscripcionPlataforma,
} from "@features/plataforma/types/plataforma.types"
import type { PaginationInfo } from "@shared/types/api.types"

// Solo estado de API — el estado de UI (modales, filtros, selección) vive en el
// contenedor.
export function usePlataforma() {
  const [barberias, setBarberias] = useState<BarberiaInventario[]>([])
  const [paginacion, setPaginacion] = useState<PaginationInfo | null>(null)
  const [total, setTotal] = useState(0)
  // La ficha de la barbería abierta. Es una lectura aparte porque la fila de la
  // lista no trae ni su huso, ni su moneda, ni cuándo se le acaba la prueba.
  const [ficha, setFicha] = useState<BarberiaFicha | null>(null)
  const [planes, setPlanes] = useState<PlanPlataforma[]>([])
  // El catálogo COMPLETO, el que se administra: trae los retirados y las
  // tarifas apagadas. `planes` de arriba es el público, que solo trae lo que
  // hoy se vende — son dos lecturas distintas y no una filtrada.
  const [catalogoPlanes, setCatalogoPlanes] = useState<PlanAdmin[]>([])
  const [suscripciones, setSuscripciones] = useState<SuscripcionPlataforma[]>([])
  const [paginacionSuscripciones, setPaginacionSuscripciones] = useState<PaginationInfo | null>(
    null
  )
  const [totalSuscripciones, setTotalSuscripciones] = useState(0)
  // La barbería recién creada: de ella sale el enlace que se le entrega al
  // cliente. Es dato de la API, no estado de pantalla.
  const [recienCreada, setRecienCreada] = useState<BarberiaFicha | null>(null)
  const [loadingLista, setLoadingLista] = useState(false)
  const [loadingFicha, setLoadingFicha] = useState(false)
  const [loadingPlanes, setLoadingPlanes] = useState(false)
  const [loadingCatalogo, setLoadingCatalogo] = useState(false)
  const [loadingSuscripciones, setLoadingSuscripciones] = useState(false)
  const [loadingAction, setLoadingAction] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBarberias = useCallback(async (filtros: FiltrosInventario = {}) => {
    setLoadingLista(true)
    setError(null)
    try {
      const res = await plataformaService.obtenerBarberias(filtros)
      setBarberias(res.data)
      setPaginacion(res.pagination ?? null)
      setTotal(res.pagination?.total ?? res.data.length)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingLista(false)
    }
  }, [])

  const fetchBarberia = useCallback(async (id: string) => {
    setLoadingFicha(true)
    try {
      const res = await plataformaService.obtenerBarberia(id)
      setFicha(res.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingFicha(false)
    }
  }, [])

  const fetchPlanes = useCallback(async () => {
    setLoadingPlanes(true)
    try {
      const res = await plataformaService.obtenerPlanes()
      setPlanes(res.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingPlanes(false)
    }
  }, [])

  const handleCreateBarberia = useCallback(async (payload: DatosAltaBarberia): Promise<string> => {
    setLoadingAction(true)
    try {
      const res = await plataformaService.crearBarberia(payload)
      setRecienCreada(res.data)
      return res.message
    } catch (err) {
      throw new Error(getErrorMessage(err))
    } finally {
      setLoadingAction(false)
    }
  }, [])

  const handleChangeEstadoBarberia = useCallback(
    async (id: string, payload: DatosCambioEstado): Promise<string> => {
      setLoadingAction(true)
      try {
        const res = await plataformaService.cambiarEstadoBarberia(id, payload)
        // La respuesta ES la ficha actualizada: si la abierta es esa, se
        // refresca sin una segunda vuelta a la API.
        setFicha((actual) => (actual?.id === id ? res.data : actual))
        return res.message
      } catch (err) {
        throw new Error(getErrorMessage(err))
      } finally {
        setLoadingAction(false)
      }
    },
    []
  )

  const fetchCatalogoPlanes = useCallback(async (filtros: FiltrosPlanes = {}) => {
    setLoadingCatalogo(true)
    setError(null)
    try {
      const res = await plataformaService.obtenerCatalogoPlanes(filtros)
      setCatalogoPlanes(res.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingCatalogo(false)
    }
  }, [])

  const handleCreatePlan = useCallback(async (payload: DatosPlanNuevo): Promise<string> => {
    setLoadingAction(true)
    try {
      const res = await plataformaService.crearPlan(payload)
      return res.message
    } catch (err) {
      throw new Error(getErrorMessage(err))
    } finally {
      setLoadingAction(false)
    }
  }, [])

  /**
   * El `message` de la API cambia según lo que pasó —se retiró, se publicó o
   * solo se editó— y por eso se devuelve tal cual en vez de escribir aquí uno
   * genérico: es donde se dice que retirar no le quita el plan a quien ya lo
   * tiene contratado.
   */
  const handleUpdatePlan = useCallback(
    async (planId: string, payload: DatosPlanEdicion): Promise<string> => {
      setLoadingAction(true)
      try {
        const res = await plataformaService.actualizarPlan(planId, payload)
        setCatalogoPlanes((actuales) =>
          actuales.map((plan) => (plan.id === planId ? res.data : plan))
        )
        return res.message
      } catch (err) {
        throw new Error(getErrorMessage(err))
      } finally {
        setLoadingAction(false)
      }
    },
    []
  )

  const fetchSuscripciones = useCallback(async (filtros: FiltrosSuscripciones = {}) => {
    setLoadingSuscripciones(true)
    setError(null)
    try {
      const res = await plataformaService.obtenerSuscripciones(filtros)
      setSuscripciones(res.data)
      setPaginacionSuscripciones(res.pagination ?? null)
      setTotalSuscripciones(res.pagination?.total ?? res.data.length)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingSuscripciones(false)
    }
  }, [])

  /**
   * Corrige la facturación de una barbería. Se direcciona por `barberia.id`, no
   * por el id de la suscripción: hay una por barbería y así se direcciona todo
   * el módulo.
   */
  const handleCorregirSuscripcion = useCallback(
    async (barberiaId: string, payload: DatosCorreccionSuscripcion): Promise<string> => {
      setLoadingAction(true)
      try {
        const res = await plataformaService.corregirSuscripcion(barberiaId, payload)
        setSuscripciones((actuales) =>
          actuales.map((suscripcion) =>
            suscripcion.barberia.id === barberiaId ? res.data : suscripcion
          )
        )
        return res.message
      } catch (err) {
        throw new Error(getErrorMessage(err))
      } finally {
        setLoadingAction(false)
      }
    },
    []
  )

  // ── Detalle e historia ────────────────────────────────────────────────────
  // Cada lectura con su propio `loading`: la ficha pinta lo que ya llegó sin
  // esperar a la más lenta, y cada bloque enseña su skeleton donde irá.
  const [actividad, setActividad] = useState<ActividadBarberia | null>(null)
  const [facturacionBarberia, setFacturacionBarberia] = useState<FacturacionBarberia | null>(null)
  const [metricas, setMetricas] = useState<MesPlataforma[]>([])
  const [facturacion, setFacturacion] = useState<FacturacionPlataforma | null>(null)
  const [loadingActividad, setLoadingActividad] = useState(false)
  const [loadingFacturacion, setLoadingFacturacion] = useState(false)
  const [loadingMetricas, setLoadingMetricas] = useState(false)
  /**
   * Error propio de la historia. No va a `error`, que es el de la lectura
   * principal: si la serie falla, el inventario sigue siendo cierto y la
   * pantalla no tiene por qué ponerse en rojo entera.
   */
  const [errorMetricas, setErrorMetricas] = useState<string | null>(null)

  const fetchActividad = useCallback(async (id: string, filtros: FiltrosActividad = {}) => {
    setLoadingActividad(true)
    try {
      const res = await plataformaService.obtenerActividad(id, filtros)
      setActividad(res.data)
    } catch (err) {
      setErrorMetricas(getErrorMessage(err))
    } finally {
      setLoadingActividad(false)
    }
  }, [])

  const fetchFacturacionBarberia = useCallback(async (id: string) => {
    setLoadingFacturacion(true)
    try {
      const res = await plataformaService.obtenerFacturacionBarberia(id)
      setFacturacionBarberia(res.data)
    } catch (err) {
      setErrorMetricas(getErrorMessage(err))
    } finally {
      setLoadingFacturacion(false)
    }
  }, [])

  const fetchMetricas = useCallback(async (filtros: FiltrosSerieMensual = {}) => {
    setLoadingMetricas(true)
    setErrorMetricas(null)
    try {
      const res = await plataformaService.obtenerMetricas(filtros)
      setMetricas(res.data)
    } catch (err) {
      setErrorMetricas(getErrorMessage(err))
    } finally {
      setLoadingMetricas(false)
    }
  }, [])

  const fetchFacturacion = useCallback(async (filtros: FiltrosSerieMensual = {}) => {
    setLoadingFacturacion(true)
    try {
      const res = await plataformaService.obtenerFacturacion(filtros)
      setFacturacion(res.data)
    } catch (err) {
      setErrorMetricas(getErrorMessage(err))
    } finally {
      setLoadingFacturacion(false)
    }
  }, [])

  /** Cierra la entrega: la barbería ya se comunicó y vuelve al inventario. */
  const limpiarRecienCreada = useCallback(() => setRecienCreada(null), [])

  /** Cierra la ficha. Se limpia para que la siguiente no enseñe la anterior. */
  const limpiarFicha = useCallback(() => {
    setFicha(null)
    setActividad(null)
    setFacturacionBarberia(null)
  }, [])

  // ── El equipo de Barion ───────────────────────────────────────────────────
  const [staff, setStaff] = useState<StaffPlataforma[]>([])
  const [loadingStaff, setLoadingStaff] = useState(false)
  /**
   * La cuenta recién creada CON su contraseña.
   *
   * Vive aquí y no en la pantalla porque es dato de la API, y se conserva hasta
   * que alguien la cierra: **es la única vez que esa contraseña existe fuera del
   * hash**, y perderla al primer re-render obligaría a regenerarla.
   */
  const [staffCreado, setStaffCreado] = useState<StaffCreado | null>(null)

  const fetchStaff = useCallback(async () => {
    setLoadingStaff(true)
    setError(null)
    try {
      const res = await plataformaService.obtenerStaff()
      setStaff(res.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingStaff(false)
    }
  }, [])

  const handleCreateStaff = useCallback(async (datos: DatosAltaStaff): Promise<string> => {
    setLoadingAction(true)
    try {
      const res = await plataformaService.crearStaff(datos)
      setStaffCreado(res.data)
      return res.message
    } catch (err) {
      throw new Error(getErrorMessage(err))
    } finally {
      setLoadingAction(false)
    }
  }, [])

  const handleChangeEstadoStaff = useCallback(
    async (usuarioId: string, estado: "activo" | "inactivo"): Promise<string> => {
      setLoadingAction(true)
      try {
        const res = await plataformaService.cambiarEstadoStaff(usuarioId, estado)
        return res.message
      } catch (err) {
        throw new Error(getErrorMessage(err))
      } finally {
        setLoadingAction(false)
      }
    },
    []
  )

  const handleRegenerarContrasenaStaff = useCallback(async (usuarioId: string): Promise<string> => {
    setLoadingAction(true)
    try {
      const res = await plataformaService.regenerarContrasenaStaff(usuarioId)
      setStaffCreado(res.data)
      return res.message
    } catch (err) {
      throw new Error(getErrorMessage(err))
    } finally {
      setLoadingAction(false)
    }
  }, [])

  const limpiarStaffCreado = useCallback(() => setStaffCreado(null), [])

  // ── Dónde opera Barion ────────────────────────────────────────────────────
  const [paises, setPaises] = useState<PaisAdmin[]>([])
  const [loadingPaises, setLoadingPaises] = useState(false)

  const fetchPaises = useCallback(async () => {
    setLoadingPaises(true)
    setError(null)
    try {
      const res = await plataformaService.obtenerPaises()
      setPaises(res.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingPaises(false)
    }
  }, [])

  const handleUpdatePais = useCallback(
    async (
      codigo: string,
      cambios: { activo?: boolean; impuestoSaasBps?: number | null }
    ): Promise<string> => {
      setLoadingAction(true)
      try {
        const res = await plataformaService.actualizarPais(codigo, cambios)
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
    barberias,
    paginacion,
    total,
    ficha,
    planes,
    catalogoPlanes,
    suscripciones,
    paginacionSuscripciones,
    totalSuscripciones,
    recienCreada,
    loadingLista,
    loadingFicha,
    loadingPlanes,
    loadingCatalogo,
    loadingSuscripciones,
    loadingAction,
    error,
    fetchBarberias,
    fetchBarberia,
    fetchPlanes,
    fetchCatalogoPlanes,
    fetchSuscripciones,
    handleCreateBarberia,
    handleChangeEstadoBarberia,
    handleCreatePlan,
    handleUpdatePlan,
    handleCorregirSuscripcion,
    limpiarRecienCreada,
    limpiarFicha,
    actividad,
    facturacionBarberia,
    metricas,
    facturacion,
    loadingActividad,
    loadingFacturacion,
    loadingMetricas,
    errorMetricas,
    fetchActividad,
    fetchFacturacionBarberia,
    fetchMetricas,
    fetchFacturacion,
    staff,
    staffCreado,
    loadingStaff,
    fetchStaff,
    handleCreateStaff,
    handleChangeEstadoStaff,
    handleRegenerarContrasenaStaff,
    limpiarStaffCreado,
    paises,
    loadingPaises,
    fetchPaises,
    handleUpdatePais,
  }
}
