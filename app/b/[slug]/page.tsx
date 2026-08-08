"use client"

import { use, useCallback, useEffect, useMemo, useState } from "react"
import { notFound, useRouter } from "next/navigation"
import { AnimatePresence, MotionConfig, motion } from "motion/react"
import { regionDePais } from "@config/regiones"
import { PortalAgendaList } from "@features/portal/components/PortalAgendaList"
import { PortalBarberosList } from "@features/portal/components/PortalBarberosList"
import { PortalCabeceraNav } from "@features/portal/components/PortalCabeceraNav"
import { PortalConfirmacion } from "@features/portal/components/PortalConfirmacion"
import { PortalNegocioCard } from "@features/portal/components/PortalNegocioCard"
import { PortalOtpForm } from "@features/portal/components/PortalOtpForm"
import { PortalPasosNav } from "@features/portal/components/PortalPasosNav"
import { PortalPortada } from "@features/portal/components/PortalPortada"
import { PortalReconocidoCard } from "@features/portal/components/PortalReconocidoCard"
import { PortalReservaForm } from "@features/portal/components/PortalReservaForm"
import { PortalResumenDetail } from "@features/portal/components/PortalResumenDetail"
import { PortalSesionForm } from "@features/portal/components/PortalSesionForm"
import { PortalServiciosList } from "@features/portal/components/PortalServiciosList"
import {
  copiaDatosConSesion,
  copiaPorPaso,
  copiaServicioCualquiera,
  numeroDePaso,
  TOTAL_PASOS,
} from "@features/portal/constants/pasos"
import { usePortal } from "@features/portal/hooks/usePortal"
import { claveDeDia, type ContextoFormato } from "@features/portal/utils/formato"
import { horarioDeHoy } from "@features/portal/utils/horarios"
import { capturarMarcaQr, marcaQr } from "@features/portal/utils/qr"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"
import { notify } from "@shared/services/notify"
import { getErrorMessage } from "@shared/utils/error"
import { useMarcaStore } from "@store/marca.store"
import type { Cliente } from "@features/clientes/types/clientes.types"
import type { DatosContacto, DatosReservaConSesion } from "@features/portal/schemas/portal.schema"
import type { PasoReserva, ServicioOfrecido } from "@features/portal/types/portal.types"

/** Horas antes de la cita hasta las que el cliente cancela solo (default de la api). */
const HORAS_CANCELACION = 4
/** Cuántos días de agenda se piden de una vez. */
const DIAS_AGENDA = 14

/**
 * Quién está delante. Se resuelve preguntando por su ficha (`/mi/perfil`), que es
 * lo que `/auth/me` es para el panel: la cookie es httpOnly y este código no puede
 * leerla, así que la única forma de saberlo es preguntar.
 *
 * `comprobando` existe para no tratar de invitado a quien tiene sesión durante la
 * primera vuelta de render: es la diferencia entre «no ha entrado» y «todavía no
 * se sabe».
 */
type Identidad = "comprobando" | "invitado" | "cliente"

/** El permiso que pide la casilla de novedades del formulario de reserva. */
const CONSENTIMIENTO_PROMOS = "marketing_email"

/**
 * El escaparate y la reserva. Instancia el hook UNA vez y reparte datos y
 * callbacks por props.
 *
 * ── El orden de los pasos, y por qué ────────────────────────────────────────
 * `barbero → servicio → agenda → datos → codigo → listo`.
 *
 * **El barbero va primero, y ese orden es la corrección de un fallo real.** Con el
 * catálogo delante, el cliente elegía un servicio, luego un barbero, se registraba,
 * recibía el código — y solo entonces se descubría que ese barbero no hacía lo
 * elegido, con la única salida de volver al principio y repetirlo todo. Eligiendo
 * barbero primero, la carta del paso 2 ES su oferta: lo que no hace no aparece, así
 * que el choque no puede darse, y el precio pasa de ser un «desde» del catálogo a
 * ser el que se va a cobrar.
 *
 * Los datos siguen yendo DESPUÉS de elegir la hora porque verificar el correo **es**
 * entrar y también registrarse: pedirlo antes obligaría a identificarse para mirar
 * precios.
 *
 * ── El código sale por CORREO ───────────────────────────────────────────────
 * Y solo por correo: un SMS se paga por mensaje y Barion no asume la mensajería.
 * El teléfono se sigue pidiendo —la barbería tiene que poder llamar a quien va a
 * atender— pero no se verifica.
 *
 * ── Catálogo y oferta no son lo mismo ───────────────────────────────────────
 * El cliente elige del CATÁLOGO (`servicioIds`), que es lo que se manda al
 * reservar. Para preguntar por huecos hace falta la OFERTA de un barbero —de ahí
 * salen la duración y el buffer—, así que se traduce con la oferta del barbero
 * elegido o, con «cualquiera disponible», con la del primero que lo ofrezca todo.
 */
export default function PortalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const router = useRouter()
  const {
    barberia,
    sedeId,
    servicios,
    barberos,
    agenda,
    reserva,
    perfil,
    consentimientos,
    loadingPortal,
    loadingAgenda,
    loadingAction,
    error,
    fetchPortal,
    fetchAgenda,
    fetchMiPerfil,
    handleSolicitarCodigoPortal,
    handleVerificarCodigoPortal,
    handleCerrarSesionPortal,
    handleGuardarPreferenciaPortal,
    handleReservarPortal,
  } = usePortal()

  // Estado de UI del flujo — el hook solo guarda estado de API.
  const [paso, setPaso] = useState<PasoReserva>("barbero")
  const [identidad, setIdentidad] = useState<Identidad>("comprobando")
  const [servicioIds, setServicioIds] = useState<string[]>([])
  /** `null` con `cualquiera` = "el primero disponible". */
  const [barberoId, setBarberoId] = useState<string | null>(null)
  const [cualquiera, setCualquiera] = useState(false)
  const [fechaDia, setFechaDia] = useState<string | null>(null)
  const [inicio, setInicio] = useState<string | null>(null)
  const [contacto, setContacto] = useState<DatosContacto | null>(null)

  const setMarca = useMarcaStore((s) => s.setMarca)

  /**
   * La marca del cartón QR se captura ANTES de pedir nada, y en el mismo efecto:
   * de ella sale la SEDE, y de la sede dependen la carta y el equipo que se piden.
   * Capturarla en un efecto aparte la dejaba llegar tarde a la primera carga.
   *
   * Leer la dirección del navegador aquí evita meter esta pantalla en una frontera
   * de Suspense solo para un parámetro. Última marca gana.
   */
  useEffect(() => {
    void fetchPortal(slug, capturarMarcaQr(window.location.search))
  }, [fetchPortal, slug])

  /**
   * ¿Hay alguien dentro? Se pregunta al abrir, no al llegar al paso 4: de ello
   * depende lo que dice la cabecera, y un 401 aquí es la respuesta normal de un
   * invitado —no un error— así que no rompe nada del escaparate.
   */
  useEffect(() => {
    void fetchMiPerfil().then((cliente) => setIdentidad(cliente ? "cliente" : "invitado"))
  }, [fetchMiPerfil])

  // La marca la define el tenant y el portal SOLO la refleja: el cliente jamás la
  // edita, así que se aplica al montar y no se persiste como preferencia suya.
  useEffect(() => {
    if (!barberia) return
    setMarca({
      colorMarca: barberia.marca.colorMarca,
      colorFondo: barberia.marca.colorFondo,
    })
  }, [barberia, setMarca])

  /**
   * La sede de trabajo: **la del cartón que escaneó el cliente**.
   *
   * No se vuelve a derivar aquí — se toma el `sedeId` que el hook ya resolvió al
   * cargar, que es el mismo con el que pidió la carta y el equipo. Calcularlo por
   * segunda vez arriba es exactamente cómo el escaparate acabó ofreciendo barberos
   * que la api rechazaba: la api filtra por sede antes de mirar la oferta.
   */
  const sede = barberia?.sedes.find((candidata) => candidata.id === sedeId) ?? null

  const formato: ContextoFormato = useMemo(
    () => ({
      zonaHoraria: sede?.zonaHoraria ?? "UTC",
      moneda: barberia?.moneda ?? "COP",
      locale: barberia?.locale,
    }),
    [sede?.zonaHoraria, barberia?.moneda, barberia?.locale]
  )

  const barbero = barberos.find((candidato) => candidato.id === barberoId) ?? null

  /**
   * La carta que se pinta, ya resuelta contra quien atiende: con barbero elegido es
   * SU oferta y nada más; con «cualquiera disponible», la unión de lo que hace el
   * equipo con el precio más bajo de quienes lo ofrecen.
   *
   * Que el catálogo entero deje de pintarse es justo lo que elimina el fallo: un
   * servicio que quien atiende no hace ya no está ahí para elegirse.
   */
  const carta: ServicioOfrecido[] = useMemo(() => {
    const fuente = cualquiera ? barberos : barbero ? [barbero] : []
    if (fuente.length === 0) return []

    return servicios.flatMap((servicio) => {
      const lineas = fuente.flatMap((candidato) =>
        candidato.oferta.filter((linea) => linea.servicioId === servicio.id)
      )
      if (lineas.length === 0) return []

      // Dinero en centavos y como entero: comparar en coma flotante acabaría
      // enseñando como "más barato" al que no lo es.
      const masBarata = lineas.reduce((barata, linea) =>
        BigInt(linea.precioCentavos) < BigInt(barata.precioCentavos) ? linea : barata
      )

      return [
        {
          ...servicio,
          precioCentavos: masBarata.precioCentavos,
          duracionRealMin: masBarata.duracionMin,
          barberos: lineas.length,
        },
      ]
    })
  }, [servicios, barberos, barbero, cualquiera])

  const serviciosElegidos = carta.filter((servicio) => servicioIds.includes(servicio.id))

  /** Con barbero elegido el precio ya no es una estimación: es el que se cobra. */
  const precioExacto = !cualquiera && barbero !== null

  /** Quién puede hacer TODO lo elegido: de ahí sale la oferta con la que se mide. */
  const candidatos = useMemo(
    () =>
      barberos.filter((candidato) =>
        servicioIds.every((servicioId) =>
          candidato.oferta.some((linea) => linea.servicioId === servicioId)
        )
      ),
    [barberos, servicioIds]
  )

  const ofertaParaMedir = useMemo(() => {
    const referencia = cualquiera ? candidatos[0] : barbero
    if (!referencia) return []
    return servicioIds.flatMap((servicioId) => {
      const linea = referencia.oferta.find((candidata) => candidata.servicioId === servicioId)
      return linea ? [linea.id] : []
    })
  }, [cualquiera, candidatos, barbero, servicioIds])

  const hoy = sede ? claveDeDia(new Date().toISOString(), formato) : ""

  // Los cupos dependen de qué se reserva y con quién: se piden al entrar al paso.
  useEffect(() => {
    if (paso !== "agenda" || !sede || ofertaParaMedir.length === 0) return
    void fetchAgenda(slug, {
      sedeId: sede.id,
      ofertaIds: ofertaParaMedir,
      barberoId: cualquiera ? undefined : (barberoId ?? undefined),
      desde: hoy,
      dias: DIAS_AGENDA,
    })
  }, [paso, sede, ofertaParaMedir, cualquiera, barberoId, hoy, slug, fetchAgenda])

  /** Con sesión el paso 4 confirma; sin ella da de alta, exactamente como hoy. */
  const conSesion = identidad === "cliente" && perfil !== null

  /**
   * Si ya dio el permiso de novedades. Se mira lo VIGENTE que devuelve la api: no
   * marcar la casilla nunca fue una revocación, así que quien lo tiene otorgado es
   * el único a quien no se le vuelve a preguntar.
   */
  const aceptaPromosVigente =
    consentimientos?.vigentes.some(
      (permiso) => permiso.tipo === CONSENTIMIENTO_PROMOS && permiso.otorgado
    ) ?? false

  const copia =
    paso === "datos" && conSesion
      ? copiaDatosConSesion
      : paso === "servicio" && cualquiera
        ? copiaServicioCualquiera
        : copiaPorPaso[paso]

  const hrefCitas = `/b/${slug}/mis-citas`

  const puedeContinuar =
    (paso === "barbero" && (cualquiera || barberoId !== null)) ||
    (paso === "servicio" && serviciosElegidos.length > 0) ||
    (paso === "agenda" && !!inicio)

  const avanzar = useCallback(() => {
    setPaso((actual) =>
      actual === "barbero" ? "servicio" : actual === "servicio" ? "agenda" : "datos"
    )
  }, [])

  /**
   * Cambiar de barbero **no obliga a rehacer la elección**: se conserva lo que el
   * nuevo también ofrece y solo se cae lo que no hace. Vaciarlo entero era lo que
   * convertía un cambio de opinión en empezar de cero.
   */
  const elegirBarbero = useCallback(
    (elegido: string | null) => {
      const nuevo = elegido === null ? null : (barberos.find((c) => c.id === elegido) ?? null)
      setCualquiera(elegido === null)
      setBarberoId(elegido)
      if (nuevo) {
        setServicioIds((actuales) =>
          actuales.filter((id) => nuevo.oferta.some((linea) => linea.servicioId === id))
        )
      }
      // Cambiar de barbero cambia los huecos: la hora anterior ya no vale.
      setInicio(null)
    },
    [barberos]
  )

  const alternarServicio = useCallback((id: string) => {
    setServicioIds((actuales) =>
      actuales.includes(id) ? actuales.filter((otro) => otro !== id) : [...actuales, id]
    )
    setInicio(null)
  }, [])

  /**
   * Los datos + el código. Pedir el código no crea nada todavía: la ficha del
   * cliente y la cita nacen al verificarlo, y en ese orden.
   */
  const enviarContacto = useCallback(
    async (datos: DatosContacto) => {
      try {
        const mensaje = await handleSolicitarCodigoPortal(slug, datos.email)
        setContacto(datos)
        setPaso("codigo")
        notify.success(mensaje)
      } catch (err) {
        notify.error(getErrorMessage(err))
      }
    },
    [slug, handleSolicitarCodigoPortal]
  )

  const reenviarCodigo = useCallback(async () => {
    if (!contacto) return
    try {
      notify.success(await handleSolicitarCodigoPortal(slug, contacto.email))
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }, [contacto, slug, handleSolicitarCodigoPortal])

  /**
   * Verificar y reservar, en ese orden y por separado: la sesión primero —es lo que
   * la deja registrada— y la cita después. Si la reserva falla, la sesión ya está
   * hecha y solo hay que volver a elegir hora, no volver a pedir el código.
   */
  const confirmarReserva = useCallback(
    async (codigo: string) => {
      if (!contacto || !sede || !inicio || servicioIds.length === 0) return
      try {
        // La marca del cartón viaja en las DOS: la ficha del cliente nace al
        // verificar y la cita al reservar, y cada una guarda su propio `origen`.
        // Sin cookie va `undefined` y el service la descarta — se reserva igual.
        const slugQr = marcaQr()
        await handleVerificarCodigoPortal(slug, {
          email: contacto.email,
          codigo,
          nombre: contacto.nombre,
          // Solo hace falta si es su primera vez, y va siempre porque el
          // formulario ya lo pidió: la api lo guarda sin verificarlo.
          telefonoE164: contacto.telefonoE164,
          aceptaPromos: contacto.aceptaPromos,
          slugQr,
        })
        const mensaje = await handleReservarPortal({
          sedeId: sede.id,
          barberoId: cualquiera ? null : barberoId,
          servicioIds,
          iniciaEn: inicio,
          notas: contacto.notas,
          slugQr,
        })
        notify.success(mensaje)
        // Quien llegó con sesión no vuelve a un comprobante sin salida: su sitio
        // es su área de cliente, donde la cita que acaba de pedir ya está con las
        // demás. El invitado sí se queda en la confirmación — es lo único que
        // tiene, porque no hay sesión detrás con la que volver.
        if (identidad === "cliente") {
          router.push(hrefCitas)
          return
        }
        setPaso("listo")
        // Verificar el código **es** entrar: de aquí en adelante ya hay sesión, y
        // una segunda reserva desde este mismo escaparate no puede volver a pedir
        // el nombre de quien acaba de darlo.
        void fetchMiPerfil().then((cliente) => setIdentidad(cliente ? "cliente" : "invitado"))
      } catch (err) {
        notify.error(getErrorMessage(err))
      }
    },
    [
      contacto,
      sede,
      inicio,
      servicioIds,
      cualquiera,
      barberoId,
      slug,
      identidad,
      router,
      hrefCitas,
      fetchMiPerfil,
      handleVerificarCodigoPortal,
      handleReservarPortal,
    ]
  )

  /**
   * Mandar el código a un correo que ya sabemos cuál es: el de su ficha. Se usa
   * cuando hay sesión pero la identidad **no está probada** —una ficha que abrió
   * alguien del mostrador—, y desde aquí el flujo sigue por el camino de siempre:
   * verificar y reservar, con lo que ya se sabe de esa persona.
   */
  const pedirCodigoDeSesion = useCallback(
    async (datos: DatosReservaConSesion, cliente: Cliente) => {
      try {
        const mensaje = await handleSolicitarCodigoPortal(slug, cliente.email)
        setContacto({
          nombre: cliente.nombre,
          telefonoE164: cliente.telefonoE164,
          email: cliente.email,
          notas: datos.notas,
          aceptaPromos: datos.aceptaPromos === true,
        })
        setPaso("codigo")
        notify.success(mensaje)
      } catch (err) {
        notify.error(getErrorMessage(err))
      }
    },
    [slug, handleSolicitarCodigoPortal]
  )

  /**
   * Reservar **con la sesión abierta**: el cliente sale de la cookie y no del
   * formulario, así que aquí no hay alta que hacer ni código que pedir.
   *
   * Tener sesión no prueba la identidad, y la api lo comprueba aparte: si la ficha
   * no está verificada se sale al código en vez de intentar una reserva que va a
   * rechazar. Se pregunta antes por su ficha —que es el mismo hecho que mira la
   * api— y se vuelve a mirar si aun así falla, porque comparar la frase del error
   * sería convertir copy en contrato.
   */
  const confirmarConSesion = useCallback(
    async (datos: DatosReservaConSesion) => {
      if (!perfil || !sede || !inicio || servicioIds.length === 0) return

      if (!perfil.verificado) {
        await pedirCodigoDeSesion(datos, perfil)
        return
      }

      try {
        // El permiso es una fila con su origen y su fecha, no una casilla: solo se
        // escribe cuando lo marca, y nunca se escribe una revocación por omisión.
        if (datos.aceptaPromos === true) {
          await handleGuardarPreferenciaPortal({
            tipo: CONSENTIMIENTO_PROMOS,
            otorgado: true,
          })
        }
        const mensaje = await handleReservarPortal({
          sedeId: sede.id,
          barberoId: cualquiera ? null : barberoId,
          servicioIds,
          iniciaEn: inicio,
          notas: datos.notas,
          // La marca del cartón viaja también por aquí: sin ella, la reserva de
          // quien escaneó un QR y ya tenía sesión dejaría de atribuirse al cartón.
          slugQr: marcaQr(),
        })
        notify.success(mensaje)
        router.push(hrefCitas)
      } catch (err) {
        const fresco = await fetchMiPerfil()
        setIdentidad(fresco ? "cliente" : "invitado")
        if (fresco && !fresco.verificado) {
          await pedirCodigoDeSesion(datos, fresco)
          return
        }
        notify.error(getErrorMessage(err))
      }
    },
    [
      perfil,
      sede,
      inicio,
      servicioIds,
      cualquiera,
      barberoId,
      router,
      hrefCitas,
      fetchMiPerfil,
      pedirCodigoDeSesion,
      handleGuardarPreferenciaPortal,
      handleReservarPortal,
    ]
  )

  /**
   * «No soy yo». El móvil de un amigo y el ordenador de casa son casos normales
   * en una barbería: se cierra la sesión de verdad —la cookie la borra la api— y
   * vuelve el formulario de invitado, sin salir del paso ni perder lo elegido.
   */
  const cerrarSesionCliente = useCallback(async () => {
    try {
      const mensaje = await handleCerrarSesionPortal()
      setIdentidad("invitado")
      notify.success(mensaje)
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }, [handleCerrarSesionPortal])

  const reiniciar = useCallback(() => {
    setPaso("barbero")
    setServicioIds([])
    setBarberoId(null)
    setCualquiera(false)
    setFechaDia(null)
    setInicio(null)
    setContacto(null)
  }, [])

  if (loadingPortal) {
    return (
      <main className="mx-auto w-full max-w-[1200px] space-y-6 p-4 sm:p-6 lg:px-8">
        <DataSkeleton variant="text" count={2} />
        <DataSkeleton variant="list" count={4} />
      </main>
    )
  }

  // Sin ficha no hay escaparate: la dirección no existe, la barbería está
  // suspendida o todavía no verificó su correo. Los tres son un 404 para quien
  // llega, y distinguirlos contaría de quién es cada identificador.
  if (!barberia) {
    if (error) notFound()
    return null
  }

  return (
    <MotionConfig reducedMotion="user">
      <PortalCabeceraNav
        nombre={barberia.nombreComercial}
        abiertoAhora={sede?.abiertoAhora ?? false}
        horarioHoy={sede ? horarioDeHoy(sede.horario, new Date().getDay()) : ""}
        hrefCitas={hrefCitas}
        acceso={identidad === "comprobando" ? undefined : identidad}
      />

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 pb-28 sm:px-6 lg:px-8 lg:pb-14">
        {paso === "listo" && reserva ? (
          <div className="flex justify-center py-8">
            <div className="w-full max-w-xl">
              <PortalConfirmacion
                cita={reserva}
                sede={sede}
                hrefCitas={hrefCitas}
                formato={formato}
                onReservarOtra={reiniciar}
              />
            </div>
          </div>
        ) : (
          <>
            {paso === "barbero" && (
              <div className="py-8 sm:py-10">
                <PortalPortada barberia={barberia} sede={sede} />
              </div>
            )}

            <div
              className={`grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10 ${paso === "barbero" ? "" : "pt-8"}`}
            >
              <div className="min-w-0">
                {/* Quien vuelve se entera al ENTRAR de que no le pedirán sus datos,
                    no cuatro pasos después. */}
                {conSesion && perfil && (
                  <div className="mb-6">
                    <PortalReconocidoCard
                      nombre={perfil.nombre}
                      verificado={perfil.verificado}
                      hrefCitas={hrefCitas}
                      onNoSoyYo={() => void cerrarSesionCliente()}
                    />
                  </div>
                )}

                <PortalPasosNav pasoActual={paso} onIrAPaso={setPaso} />

                <section className="mt-6" aria-labelledby="titulo-paso">
                  <p className="text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
                    Paso {numeroDePaso[paso]} de {TOTAL_PASOS}
                  </p>
                  <h2
                    id="titulo-paso"
                    className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground"
                  >
                    {copia.titulo}
                  </h2>
                  <p className="mt-1.5 mb-6 text-sm text-muted-foreground">{copia.subtitulo}</p>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={paso}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ type: "spring", stiffness: 160, damping: 24 }}
                    >
                      {paso === "barbero" && (
                        <PortalBarberosList
                          barberos={barberos}
                          barberoId={barberoId}
                          cualquiera={cualquiera}
                          loading={false}
                          onSeleccionar={elegirBarbero}
                        />
                      )}

                      {paso === "servicio" && (
                        <PortalServiciosList
                          servicios={carta}
                          servicioIds={servicioIds}
                          precioExacto={precioExacto}
                          loading={false}
                          formato={formato}
                          onAlternar={(elegido) => alternarServicio(elegido.id)}
                        />
                      )}

                      {paso === "agenda" && (
                        <PortalAgendaList
                          agenda={agenda}
                          fechaDia={fechaDia}
                          inicio={inicio}
                          hoy={hoy}
                          loading={loadingAgenda}
                          formato={formato}
                          onSeleccionarDia={(fecha) => {
                            setFechaDia(fecha)
                            setInicio(null)
                          }}
                          onSeleccionarFranja={setInicio}
                        />
                      )}

                      {paso === "datos" && (
                        <div className="max-w-lg">
                          {/* Todavía no se sabe quién está delante: se espera en
                              vez de pedirle el nombre a quien ya lo dio. */}
                          {identidad === "comprobando" && <DataSkeleton variant="form" />}

                          {conSesion && perfil && (
                            <PortalSesionForm
                              nombre={perfil.nombre}
                              email={perfil.email}
                              verificado={perfil.verificado}
                              aceptaPromosVigente={aceptaPromosVigente}
                              cargando={loadingAction}
                              onSubmit={confirmarConSesion}
                              onNoSoyYo={() => void cerrarSesionCliente()}
                            />
                          )}

                          {identidad === "invitado" && (
                            <PortalReservaForm
                              onSubmit={enviarContacto}
                              paisSugerido={regionDePais(barberia.pais)}
                              cargando={loadingAction}
                            />
                          )}
                        </div>
                      )}

                      {paso === "codigo" && contacto && (
                        <div className="max-w-lg">
                          <PortalOtpForm
                            destino={contacto.email}
                            onSubmit={confirmarReserva}
                            onReenviar={reenviarCodigo}
                            cargando={loadingAction}
                          />
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </section>
              </div>

              {/* Lateral: acompaña el scroll sin recortar contenido (sticky, no overflow) */}
              <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
                <div className="hidden lg:block">
                  <PortalResumenDetail
                    servicios={serviciosElegidos}
                    precioExacto={precioExacto}
                    nombreBarbero={barbero?.nombrePublico ?? null}
                    inicio={inicio}
                    horasCancelacion={HORAS_CANCELACION}
                    textoCta={copia.cta}
                    puedeContinuar={puedeContinuar}
                    formato={formato}
                    onContinuar={avanzar}
                    sinCta={!copia.cta}
                  />
                </div>
                <PortalNegocioCard sede={sede} />
              </aside>
            </div>
          </>
        )}
      </main>

      {/* Móvil: barra fija con el total y el avance del paso actual */}
      {paso !== "listo" && !!copia.cta && (
        <div className="fixed inset-x-0 bottom-0 z-20 lg:hidden">
          <PortalResumenDetail
            servicios={serviciosElegidos}
            precioExacto={precioExacto}
            nombreBarbero={barbero?.nombrePublico ?? null}
            inicio={inicio}
            horasCancelacion={HORAS_CANCELACION}
            textoCta={copia.cta}
            puedeContinuar={puedeContinuar}
            formato={formato}
            onContinuar={avanzar}
            compacta
          />
        </div>
      )}
    </MotionConfig>
  )
}
