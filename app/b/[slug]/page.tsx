"use client"

import { use, useCallback, useEffect, useState } from "react"
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
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"
import { notify } from "@shared/services/notify"
import { getErrorMessage } from "@shared/utils/error"
import { useMarcaStore } from "@store/marca.store"
import type { DatosCodigo, DatosContacto } from "@features/portal/schemas/portal.schema"
import type { PasoReserva } from "@features/portal/types/portal.types"

// Portal público de la barbería: instancia el hook UNA vez y reparte datos + callbacks por props.
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
    fetchPortal,
    fetchAgenda,
    handleSolicitarCodigoPortal,
    handleConfirmarReservaPortal,
  } = usePortal()

  // Estado de UI del flujo — el hook solo guarda estado de API.
  const [paso, setPaso] = useState<PasoReserva>("servicio")
  const [servicioId, setServicioId] = useState<number | null>(null)
  const [barberoId, setBarberoId] = useState<number | null>(null)
  const [fechaDia, setFechaDia] = useState<string | null>(null)
  const [inicio, setInicio] = useState<string | null>(null)
  const [contacto, setContacto] = useState<DatosContacto | null>(null)

  const setColorMarca = useMarcaStore((s) => s.setColorMarca)
  const setColorFondo = useMarcaStore((s) => s.setColorFondo)

  useEffect(() => {
    void fetchPortal(slug)
  }, [fetchPortal, slug])

  // La marca la define el tenant y el portal SOLO la refleja (el cliente nunca la edita).
  useEffect(() => {
    if (!barberia) return
    setColorMarca(barberia.colorMarca)
    setColorFondo(barberia.colorFondo)
  }, [barberia, setColorMarca, setColorFondo])

  // Los cupos dependen de servicio + barbero: se piden al entrar al paso de agenda.
  useEffect(() => {
    if (paso !== "agenda" || servicioId === null || barberoId === null) return
    void fetchAgenda(servicioId, barberoId)
  }, [paso, servicioId, barberoId, fetchAgenda])

  const servicio = servicios.find((s) => s.id === servicioId) ?? null
  const barbero = barberos.find((b) => b.id === barberoId) ?? null
  const copia = copiaPorPaso[paso]

  const puedeContinuar =
    (paso === "servicio" && !!servicio) ||
    (paso === "barbero" && barberoId !== null) ||
    (paso === "agenda" && !!inicio)

  const avanzar = useCallback(() => {
    setPaso((actual) =>
      actual === "servicio" ? "barbero" : actual === "barbero" ? "agenda" : "datos"
    )
  }, [])

  const irAPaso = useCallback((destino: PasoReserva) => setPaso(destino), [])

  const elegirFranja = useCallback((valor: string) => setInicio(valor), [])

  const elegirDia = useCallback((fecha: string) => {
    setFechaDia(fecha)
    setInicio(null)
  }, [])

  const enviarContacto = useCallback(
    async (datos: DatosContacto) => {
      try {
        const mensaje = await handleSolicitarCodigoPortal({ telefono: datos.telefono })
        setContacto(datos)
        setPaso("codigo")
        notify.success(mensaje)
      } catch (err) {
        notify.error(getErrorMessage(err))
      }
    },
    [handleSolicitarCodigoPortal]
  )

  const reenviarCodigo = useCallback(async () => {
    if (!contacto) return
    try {
      const mensaje = await handleSolicitarCodigoPortal({ telefono: contacto.telefono })
      notify.success(mensaje)
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }, [contacto, handleSolicitarCodigoPortal])

  const confirmarReserva = useCallback(
    async (codigo: DatosCodigo) => {
      if (!contacto || servicioId === null || barberoId === null || !inicio) return
      try {
        const mensaje = await handleConfirmarReservaPortal(
          { ...contacto, servicioId, barberoId, inicio },
          codigo
        )
        setPaso("listo")
        notify.success(mensaje)
      } catch (err) {
        notify.error(getErrorMessage(err))
      }
    },
    [contacto, servicioId, barberoId, inicio, handleConfirmarReservaPortal]
  )

  const reiniciar = useCallback(() => {
    setPaso("servicio")
    setServicioId(null)
    setBarberoId(null)
    setFechaDia(null)
    setInicio(null)
    setContacto(null)
  }, [])

  const hrefCitas = `/b/${slug}/mis-citas`
  const hrefRegistro = `/b/${slug}/registro`

  if (loadingPortal || !barberia) {
    return (
      <main className="mx-auto w-full max-w-[1200px] space-y-6 p-4 sm:p-6 lg:px-8">
        <DataSkeleton variant="text" count={2} />
        <DataSkeleton variant="list" count={4} />
      </main>
    )
  }

  return (
    <MotionConfig reducedMotion="user">
      <PortalCabeceraNav
        nombre={barberia.nombre}
        iniciales={barberia.iniciales}
        abiertoAhora={barberia.abiertoAhora}
        horarioHoy={barberia.horarioHoy}
        hrefRegistro={hrefRegistro}
        hrefCitas={hrefCitas}
      />

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 pb-28 sm:px-6 lg:px-8 lg:pb-14">
        {paso === "listo" && reserva ? (
          <div className="flex justify-center py-8">
            <div className="w-full max-w-xl">
              <PortalConfirmacion
                reserva={reserva}
                barberia={barberia}
                hrefCitas={hrefCitas}
                onReservarOtra={reiniciar}
              />
            </div>
          </div>
        ) : (
          <>
            {paso === "servicio" && (
              <div className="py-8 sm:py-10">
                <PortalPortada barberia={barberia} />
              </div>
            )}

            <div
              className={`grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10 ${paso === "servicio" ? "" : "pt-8"}`}
            >
              <div className="min-w-0">
                <PortalPasosNav pasoActual={paso} onIrAPaso={irAPaso} />

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
                          servicioId={servicioId}
                          loading={false}
                          onSeleccionar={(elegido) => setServicioId(elegido.id)}
                        />
                      )}

                      {paso === "barbero" && (
                        <PortalBarberosList
                          barberos={barberos}
                          barberoId={barberoId}
                          loading={false}
                          onSeleccionar={(elegido) => setBarberoId(elegido.id)}
                        />
                      )}

                      {paso === "agenda" && (
                        <PortalAgendaList
                          agenda={agenda}
                          fechaDia={fechaDia}
                          inicio={inicio}
                          loading={loadingAgenda}
                          onSeleccionarDia={elegirDia}
                          onSeleccionarFranja={elegirFranja}
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
                            telefono={contacto.telefono}
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
                    servicio={servicio}
                    barbero={barbero}
                    inicio={inicio}
                    textoCta={copia.cta}
                    puedeContinuar={puedeContinuar}
                    onContinuar={avanzar}
                    sinCta={!copia.cta}
                  />
                </div>
                <PortalNegocioCard barberia={barberia} />
              </aside>
            </div>
          </>
        )}
      </main>

      {/* Móvil: barra fija con el total y el avance del paso actual */}
      {paso !== "listo" && !!copia.cta && (
        <div className="fixed inset-x-0 bottom-0 z-20 lg:hidden">
          <PortalResumenDetail
            servicio={servicio}
            barbero={barbero}
            inicio={inicio}
            textoCta={copia.cta}
            puedeContinuar={puedeContinuar}
            onContinuar={avanzar}
            compacta
          />
        </div>
      )}
    </MotionConfig>
  )
}
