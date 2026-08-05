"use client"

import { useCallback, useState } from "react"
import { portalService } from "@features/portal/services/portal.service"
import { sedeDeLaMarca } from "@features/portal/utils/qr"
import { getErrorMessage } from "@shared/utils/error"
import type {
  DatosAccionEnlace,
  DatosCalificar,
  DatosPreferencia,
  DatosReagendar,
  DatosReserva,
  DatosVerificarCodigo,
} from "@features/portal/schemas/portal.schema"
import type { Cliente, Consentimientos } from "@features/clientes/types/clientes.types"
import type {
  AccionEnlace,
  BarberiaPortal,
  BarberoPortal,
  Cita,
  DiaAgenda,
  FidelidadPortal,
  FiltrosCitasCliente,
  PromocionPortal,
  ServicioPortal,
  SesionCliente,
} from "@features/portal/types/portal.types"

/**
 * Único hook del portal, para las dos superficies: el escaparate sin sesión y el
 * área del cliente. Son la misma feature —el cliente entra desde el escaparate y
 * vuelve a él— y separarlas obligaría a la página a orquestar dos hooks que
 * comparten la barbería.
 *
 * Solo estado de API. El paso del flujo, la selección y los modales viven en la
 * página, que es el padre.
 */
export function usePortal() {
  const [barberia, setBarberia] = useState<BarberiaPortal | null>(null)
  /**
   * La sede con la que se está trabajando, resuelta desde la marca del cartón QR.
   * Vive aquí y no en la página porque es la MISMA con la que se pidieron la carta
   * y el equipo: derivarla otra vez arriba es cómo se desincronizaron antes el
   * escaparate y lo que la api acepta al reservar.
   */
  const [sedeId, setSedeId] = useState<string | null>(null)
  const [servicios, setServicios] = useState<ServicioPortal[]>([])
  const [barberos, setBarberos] = useState<BarberoPortal[]>([])
  const [agenda, setAgenda] = useState<DiaAgenda[]>([])
  const [reserva, setReserva] = useState<Cita | null>(null)
  const [sesion, setSesion] = useState<SesionCliente | null>(null)
  const [citas, setCitas] = useState<Cita[]>([])
  const [perfil, setPerfil] = useState<Cliente | null>(null)
  const [consentimientos, setConsentimientos] = useState<Consentimientos | null>(null)
  const [fidelidad, setFidelidad] = useState<FidelidadPortal | null>(null)
  const [promociones, setPromociones] = useState<PromocionPortal[]>([])
  const [accion, setAccion] = useState<AccionEnlace | null>(null)
  const [loadingPortal, setLoadingPortal] = useState(false)
  const [loadingAgenda, setLoadingAgenda] = useState(false)
  const [loadingCitas, setLoadingCitas] = useState(false)
  const [loadingAction, setLoadingAction] = useState(false)
  const [loadingAccion, setLoadingAccion] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Ficha, carta y equipo. **En dos olas, y no por descuido**: la carta y el equipo
   * se piden ACOTADOS A LA SEDE, y cuál es la sede solo se sabe leyendo la ficha.
   *
   * Pedir las tres en paralelo era más rápido y estaba mal: devolvía el equipo
   * entero de la barbería mientras la reserva se valida contra UNA sede
   * (`quienesOfrecen` filtra por `sedeId` antes de mirar la oferta). En una
   * barbería con dos sedes eso deja elegir a un barbero de la otra y el choque solo
   * aparece al reservar, con un 422 que además culpa a la oferta.
   *
   * Un 404 aquí significa que esa dirección no tiene escaparate —no existe, está
   * suspendida o no verificó su correo—, y la página lo trata como "no encontrada".
   */
  const fetchPortal = useCallback(async (slug: string, slugQr?: string) => {
    setLoadingPortal(true)
    setError(null)
    try {
      const resBarberia = await portalService.obtenerBarberia(slug)
      const sede = sedeDeLaMarca(resBarberia.data.sedes, slugQr)

      const [resServicios, resBarberos] = await Promise.all([
        portalService.obtenerServicios(slug, sede?.id),
        portalService.obtenerBarberos(slug, sede?.id),
      ])

      setBarberia(resBarberia.data)
      setSedeId(sede?.id ?? null)
      setServicios(resServicios.data)
      setBarberos(resBarberos.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingPortal(false)
    }
  }, [])

  /**
   * Los huecos de un servicio y (opcionalmente) un barbero. Las franjas **no
   * apartan nada**: si al reservar hay 409, se vuelve a pedir esto.
   */
  const fetchAgenda = useCallback(
    async (
      slug: string,
      consulta: {
        sedeId: string
        ofertaIds: string[]
        barberoId?: string
        desde: string
        dias?: number
      }
    ) => {
      setLoadingAgenda(true)
      setError(null)
      try {
        const res = await portalService.obtenerDisponibilidad(slug, consulta)
        setAgenda(res.data.dias)
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoadingAgenda(false)
      }
    },
    []
  )

  /** El código sale por correo, y solo por correo: es el único canal que lo manda. */
  const handleSolicitarCodigoPortal = useCallback(
    async (slug: string, email: string): Promise<string> => {
      setLoadingAction(true)
      try {
        const res = await portalService.solicitarCodigo(slug, { email })
        return res.message
      } catch (err) {
        throw new Error(getErrorMessage(err))
      } finally {
        setLoadingAction(false)
      }
    },
    []
  )

  /** Verificar es entrar: la cookie la deja la api y aquí solo se guarda quién es. */
  const handleVerificarCodigoPortal = useCallback(
    async (slug: string, payload: DatosVerificarCodigo): Promise<SesionCliente> => {
      setLoadingAction(true)
      try {
        const res = await portalService.verificarCodigo(slug, payload)
        setSesion(res.data)
        return res.data
      } catch (err) {
        throw new Error(getErrorMessage(err))
      } finally {
        setLoadingAction(false)
      }
    },
    []
  )

  const handleReservarPortal = useCallback(async (payload: DatosReserva): Promise<string> => {
    setLoadingAction(true)
    try {
      const res = await portalService.reservar(payload)
      setReserva(res.data)
      return res.message
    } catch (err) {
      throw new Error(getErrorMessage(err))
    } finally {
      setLoadingAction(false)
    }
  }, [])

  /**
   * Sus citas. Sin sesión responde 401, y eso NO es un error que enseñar: es la
   * respuesta normal de quien todavía no ha entrado, así que la página pide el
   * código en vez de pintar un fallo.
   */
  const fetchMisCitas = useCallback(async (filtros: FiltrosCitasCliente = {}) => {
    setLoadingCitas(true)
    setError(null)
    try {
      const res = await portalService.obtenerMisCitas({ ...filtros, paginar: false })
      setCitas(res.data)
      return true
    } catch (err) {
      setError(getErrorMessage(err))
      return false
    } finally {
      setLoadingCitas(false)
    }
  }, [])

  /**
   * Su ficha y sus permisos de comunicación — y, de paso, **si hay sesión**: es lo
   * que `/auth/me` es para el panel. Devuelve la ficha para que quien pregunte
   * pueda leerla en el acto, sin esperar a que el estado se propague.
   *
   * Un 401 aquí **no es un error que enseñar**: es la respuesta normal de quien
   * todavía no ha entrado, y por eso tampoco toca `error` — el escaparate lo usa
   * para decidir si la barbería existe, y un invitado no puede teñir esa
   * respuesta con un 404 que no le corresponde.
   */
  const fetchMiPerfil = useCallback(async (): Promise<Cliente | null> => {
    setLoadingCitas(true)
    try {
      const [resPerfil, resConsentimientos] = await Promise.all([
        portalService.obtenerMiPerfil(),
        portalService.obtenerMisConsentimientos(),
      ])
      setPerfil(resPerfil.data)
      setConsentimientos(resConsentimientos.data)
      return resPerfil.data
    } catch {
      setPerfil(null)
      setConsentimientos(null)
      return null
    } finally {
      setLoadingCitas(false)
    }
  }, [])

  /**
   * «No soy yo». Cierra la sesión de verdad —la cookie es httpOnly— y vacía todo
   * lo que era de esa persona: dejar sus citas o su ficha en pantalla mientras la
   * api ya no la reconoce es enseñarle los datos de alguien a quien acaba de
   * decir que no es.
   */
  const handleCerrarSesionPortal = useCallback(async (): Promise<string> => {
    setLoadingAction(true)
    try {
      const res = await portalService.cerrarSesion()
      setSesion(null)
      setPerfil(null)
      setConsentimientos(null)
      setCitas([])
      setFidelidad(null)
      setPromociones([])
      return res.message
    } catch (err) {
      throw new Error(getErrorMessage(err))
    } finally {
      setLoadingAction(false)
    }
  }, [])

  const fetchFidelidad = useCallback(async () => {
    setLoadingCitas(true)
    setError(null)
    try {
      const [resFidelidad, resPromociones] = await Promise.all([
        portalService.obtenerFidelidad(),
        portalService.obtenerPromociones(),
      ])
      setFidelidad(resFidelidad.data)
      setPromociones(resPromociones.data)
      return true
    } catch (err) {
      setError(getErrorMessage(err))
      return false
    } finally {
      setLoadingCitas(false)
    }
  }, [])

  const handleCancelarCitaPortal = useCallback(async (citaId: string): Promise<string> => {
    setLoadingAction(true)
    try {
      const res = await portalService.cancelarCita(citaId)
      return res.message
    } catch (err) {
      throw new Error(getErrorMessage(err))
    } finally {
      setLoadingAction(false)
    }
  }, [])

  const handleReagendarCitaPortal = useCallback(
    async (citaId: string, payload: DatosReagendar): Promise<string> => {
      setLoadingAction(true)
      try {
        const res = await portalService.reagendarCita(citaId, payload)
        return res.message
      } catch (err) {
        throw new Error(getErrorMessage(err))
      } finally {
        setLoadingAction(false)
      }
    },
    []
  )

  const handleCalificarCitaPortal = useCallback(
    async (citaId: string, payload: DatosCalificar): Promise<string> => {
      setLoadingAction(true)
      try {
        const res = await portalService.calificarCita(citaId, payload)
        return res.message
      } catch (err) {
        throw new Error(getErrorMessage(err))
      } finally {
        setLoadingAction(false)
      }
    },
    []
  )

  const handleGuardarPreferenciaPortal = useCallback(
    async (payload: DatosPreferencia): Promise<string> => {
      setLoadingAction(true)
      try {
        const res = await portalService.guardarPreferencia(payload)
        return res.message
      } catch (err) {
        throw new Error(getErrorMessage(err))
      } finally {
        setLoadingAction(false)
      }
    },
    []
  )

  /**
   * El enlace de un correo. **Gasta el token cuando funciona** —pero no cuando la
   * api lo rechaza pidiendo un dato—, así que la página puede reintentar con lo
   * que falte sin pedir otro enlace.
   *
   * Devuelve el `message` de la api —es la frase que se pinta— y deja `accion`
   * para elegir la pantalla por su `resultado`.
   *
   * **El error se relanza tal cual, y es la excepción a la regla del hook**: el
   * sobre de la api trae `motivo`, que es lo que distingue «falta el puntaje» o
   * «confirma la cancelación» de un fallo terminal. Envolverlo en un `Error` con
   * solo el mensaje tiraría ese campo y obligaría a volver a adivinar por la
   * frase. La página sigue sacando el texto con `getErrorMessage`.
   */
  const handleEjecutarAccionPortal = useCallback(
    async (slug: string, token: string, payload: DatosAccionEnlace = {}): Promise<string> => {
      setLoadingAccion(true)
      try {
        const res = await portalService.ejecutarAccionEnlace(slug, token, payload)
        setAccion(res.data)
        return res.message
      } finally {
        setLoadingAccion(false)
      }
    },
    []
  )

  const handleCanjearPremioPortal = useCallback(async (premioId: string): Promise<string> => {
    setLoadingAction(true)
    try {
      const res = await portalService.canjearPremio({ premioId })
      return res.message
    } catch (err) {
      throw new Error(getErrorMessage(err))
    } finally {
      setLoadingAction(false)
    }
  }, [])

  return {
    barberia,
    sedeId,
    servicios,
    barberos,
    agenda,
    reserva,
    sesion,
    citas,
    perfil,
    consentimientos,
    fidelidad,
    promociones,
    accion,
    loadingPortal,
    loadingAgenda,
    loadingCitas,
    loadingAction,
    loadingAccion,
    error,
    fetchPortal,
    fetchAgenda,
    fetchMisCitas,
    fetchMiPerfil,
    fetchFidelidad,
    handleSolicitarCodigoPortal,
    handleVerificarCodigoPortal,
    handleCerrarSesionPortal,
    handleReservarPortal,
    handleCancelarCitaPortal,
    handleReagendarCitaPortal,
    handleCalificarCitaPortal,
    handleGuardarPreferenciaPortal,
    handleEjecutarAccionPortal,
    handleCanjearPremioPortal,
  }
}
