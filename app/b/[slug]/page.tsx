"use client"

import { use, useCallback, useEffect, useMemo, useState } from "react"
import { notFound } from "next/navigation"
import { AnimatePresence, MotionConfig, motion } from "motion/react"
import { PortalAgendaList } from "@features/portal/components/PortalAgendaList"
import { PortalBarberosList } from "@features/portal/components/PortalBarberosList"
import { PortalCabeceraNav } from "@features/portal/components/PortalCabeceraNav"
import { PortalConfirmacion } from "@features/portal/components/PortalConfirmacion"
import { PortalNegocioCard } from "@features/portal/components/PortalNegocioCard"
import { PortalOtpForm } from "@features/portal/components/PortalOtpForm"
import { PortalPasosNav } from "@features/portal/components/PortalPasosNav"
import { PortalPortada } from "@features/portal/components/PortalPortada"
import { PortalReservaForm } from "@features/portal/components/PortalReservaForm"
import { PortalResumenDetail } from "@features/portal/components/PortalResumenDetail"
import { PortalServiciosList } from "@features/portal/components/PortalServiciosList"
import { copiaPorPaso, numeroDePaso, TOTAL_PASOS } from "@features/portal/constants/pasos"
import { usePortal } from "@features/portal/hooks/usePortal"
import { claveDeDia, type ContextoFormato } from "@features/portal/utils/formato"
import { horarioDeHoy } from "@features/portal/utils/horarios"
import { capturarMarcaQr, marcaQr } from "@features/portal/utils/qr"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"
import { notify } from "@shared/services/notify"
import { getErrorMessage } from "@shared/utils/error"
import { useMarcaStore } from "@store/marca.store"
import type { DatosContacto } from "@features/portal/schemas/portal.schema"
import type { PasoReserva } from "@features/portal/types/portal.types"

/** Horas antes de la cita hasta las que el cliente cancela solo (default de la api). */
const HORAS_CANCELACION = 4
/** Cuántos días de agenda se piden de una vez. */
const DIAS_AGENDA = 14

/**
 * El escaparate y la reserva. Instancia el hook UNA vez y reparte datos y
 * callbacks por props.
 *
 * ── El orden de los pasos, y por qué ────────────────────────────────────────
 * `servicio → barbero → agenda → datos → codigo → listo`. Los datos van DESPUÉS de
 * elegir la hora porque verificar el correo **es** entrar y también registrarse:
 * pedirlo antes obligaría a identificarse para mirar precios.
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
  const {
    barberia,
    servicios,
    barberos,
    agenda,
    reserva,
    loadingPortal,
    loadingAgenda,
    loadingAction,
    error,
    fetchPortal,
    fetchAgenda,
    handleSolicitarCodigoPortal,
    handleVerificarCodigoPortal,
    handleReservarPortal,
  } = usePortal()

  // Estado de UI del flujo — el hook solo guarda estado de API.
  const [paso, setPaso] = useState<PasoReserva>("servicio")
  const [servicioIds, setServicioIds] = useState<string[]>([])
  /** `null` con `cualquiera` = "el primero disponible". */
  const [barberoId, setBarberoId] = useState<string | null>(null)
  const [cualquiera, setCualquiera] = useState(false)
  const [fechaDia, setFechaDia] = useState<string | null>(null)
  const [inicio, setInicio] = useState<string | null>(null)
  const [contacto, setContacto] = useState<DatosContacto | null>(null)

  const setMarca = useMarcaStore((s) => s.setMarca)

  useEffect(() => {
    void fetchPortal(slug)
  }, [fetchPortal, slug])

  /**
   * La marca del cartón QR — `?qr={sede.slugQr}` — a una cookie de 30 días.
   *
   * Aquí y no en un `useSearchParams`: es un efecto de una sola vez que no pinta
   * nada, y leer la dirección del navegador evita meter esta pantalla en una
   * frontera de Suspense solo para capturar un parámetro. Última marca gana.
   */
  useEffect(() => {
    capturarMarcaQr(window.location.search)
  }, [])

  // La marca la define el tenant y el portal SOLO la refleja: el cliente jamás la
  // edita, así que se aplica al montar y no se persiste como preferencia suya.
  useEffect(() => {
    if (!barberia) return
    setMarca({
      colorMarca: barberia.marca.colorMarca,
      colorFondo: barberia.marca.colorFondo,
    })
  }, [barberia, setMarca])

  // La barbería opera por SEDES. Mientras haya una sola, es la de trabajo; el
  // selector de sede llega cuando el escaparate tenga que ofrecer varias.
  const sede = barberia?.sedes[0] ?? null

  const formato: ContextoFormato = useMemo(
    () => ({
      zonaHoraria: sede?.zonaHoraria ?? "UTC",
      moneda: barberia?.moneda ?? "COP",
      locale: barberia?.locale,
    }),
    [sede?.zonaHoraria, barberia?.moneda, barberia?.locale]
  )

  const serviciosElegidos = servicios.filter((servicio) => servicioIds.includes(servicio.id))
  const barbero = barberos.find((candidato) => candidato.id === barberoId) ?? null

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

  const copia = copiaPorPaso[paso]

  const puedeContinuar =
    (paso === "servicio" && serviciosElegidos.length > 0) ||
    (paso === "barbero" && (cualquiera || barberoId !== null)) ||
    (paso === "agenda" && !!inicio)

  const avanzar = useCallback(() => {
    setPaso((actual) =>
      actual === "servicio" ? "barbero" : actual === "barbero" ? "agenda" : "datos"
    )
  }, [])

  const elegirBarbero = useCallback((elegido: string | null) => {
    setCualquiera(elegido === null)
    setBarberoId(elegido)
    // Cambiar de barbero cambia los huecos: la hora anterior ya no vale.
    setInicio(null)
  }, [])

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
        setPaso("listo")
        notify.success(mensaje)
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
      handleVerificarCodigoPortal,
      handleReservarPortal,
    ]
  )

  const reiniciar = useCallback(() => {
    setPaso("servicio")
    setServicioIds([])
    setBarberoId(null)
    setCualquiera(false)
    setFechaDia(null)
    setInicio(null)
    setContacto(null)
  }, [])

  const hrefCitas = `/b/${slug}/mis-citas`

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
            {paso === "servicio" && (
              <div className="py-8 sm:py-10">
                <PortalPortada barberia={barberia} sede={sede} />
              </div>
            )}

            <div
              className={`grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10 ${paso === "servicio" ? "" : "pt-8"}`}
            >
              <div className="min-w-0">
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
                      {paso === "servicio" && (
                        <PortalServiciosList
                          servicios={servicios}
                          servicioIds={servicioIds}
                          loading={false}
                          formato={formato}
                          onAlternar={(elegido) => alternarServicio(elegido.id)}
                        />
                      )}

                      {paso === "barbero" && (
                        <PortalBarberosList
                          barberos={barberos}
                          barberoId={barberoId}
                          cualquiera={cualquiera}
                          servicioIds={servicioIds}
                          loading={false}
                          onSeleccionar={elegirBarbero}
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
                          <PortalReservaForm onSubmit={enviarContacto} cargando={loadingAction} />
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
