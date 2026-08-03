"use client"

import { use, useCallback, useEffect, useMemo, useState } from "react"
import { MotionConfig } from "motion/react"
import { Gift, Star } from "lucide-react"
import { PortalAccesoForm } from "@features/portal/components/PortalAccesoForm"
import { PortalCabeceraNav } from "@features/portal/components/PortalCabeceraNav"
import { PortalCitasList } from "@features/portal/components/PortalCitasList"
import { PortalNegocioCard } from "@features/portal/components/PortalNegocioCard"
import { PortalOtpForm } from "@features/portal/components/PortalOtpForm"
import { usePortal } from "@features/portal/hooks/usePortal"
import { type ContextoFormato } from "@features/portal/utils/formato"
import { horarioDeHoy } from "@features/portal/utils/horarios"
import { marcaQr } from "@features/portal/utils/qr"
import { resumenServicios } from "@features/citas/utils/servicios"
import { Button } from "@shared/components/ui/button"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"
import { Modal } from "@shared/components/modals/Modal"
import { notify } from "@shared/services/notify"
import { getErrorMessage } from "@shared/utils/error"
import { useMarcaStore } from "@store/marca.store"
import type { DatosSolicitarCodigo } from "@features/portal/schemas/portal.schema"
import type { Cita } from "@features/portal/types/portal.types"

/** Qué se pinta: pedir el correo, escribir el código, o ya lo suyo. */
type FaseAcceso = "correo" | "codigo" | "citas"

/**
 * El área del cliente: sus citas, sus puntos y sus permisos de comunicación.
 *
 * **No hay pantalla de login**, y no la habrá: entrar es pedir el código y
 * escribirlo, que es exactamente lo mismo que hace al reservar. La sesión vive en
 * una cookie httpOnly de 30 días, así que quien ya entró llega directo a sus citas
 * — se comprueba pidiéndolas: un 401 no es un error que enseñar, es "todavía no has
 * entrado".
 */
export default function MisCitasPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const {
    barberia,
    citas,
    fidelidad,
    loadingPortal,
    loadingCitas,
    loadingAction,
    fetchPortal,
    fetchMisCitas,
    fetchFidelidad,
    handleSolicitarCodigoPortal,
    handleVerificarCodigoPortal,
    handleCancelarCitaPortal,
    handleCalificarCitaPortal,
  } = usePortal()

  const [fase, setFase] = useState<FaseAcceso>("correo")
  const [correo, setCorreo] = useState("")
  const [citaACancelar, setCitaACancelar] = useState<Cita | null>(null)
  const [citaACalificar, setCitaACalificar] = useState<Cita | null>(null)
  const [puntaje, setPuntaje] = useState(5)

  const setMarca = useMarcaStore((s) => s.setMarca)

  useEffect(() => {
    void fetchPortal(slug)
  }, [fetchPortal, slug])

  useEffect(() => {
    if (!barberia) return
    setMarca({
      colorMarca: barberia.marca.colorMarca,
      colorFondo: barberia.marca.colorFondo,
    })
  }, [barberia, setMarca])

  /**
   * Quien vuelve con la cookie viva no tiene que volver a identificarse: se
   * intentan sus citas y, si la api las da, se salta el código.
   */
  useEffect(() => {
    void fetchMisCitas().then((entro) => {
      if (!entro) return
      setFase("citas")
      void fetchFidelidad()
    })
  }, [fetchMisCitas, fetchFidelidad])

  const sede = barberia?.sedes[0] ?? null

  const formato: ContextoFormato = useMemo(
    () => ({
      zonaHoraria: sede?.zonaHoraria ?? "UTC",
      moneda: barberia?.moneda ?? "COP",
      locale: barberia?.locale,
    }),
    [sede?.zonaHoraria, barberia?.moneda, barberia?.locale]
  )

  const pedirCodigo = useCallback(
    async (datos: DatosSolicitarCodigo) => {
      try {
        const mensaje = await handleSolicitarCodigoPortal(slug, datos.email)
        setCorreo(datos.email)
        setFase("codigo")
        notify.success(mensaje)
      } catch (err) {
        notify.error(getErrorMessage(err))
      }
    },
    [slug, handleSolicitarCodigoPortal]
  )

  const reenviarCodigo = useCallback(async () => {
    try {
      notify.success(await handleSolicitarCodigoPortal(slug, correo))
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }, [slug, correo, handleSolicitarCodigoPortal])

  /**
   * Verificar deja la sesión. **Sin nombre ni teléfono**: quien entra por aquí ya
   * es cliente de la barbería, y si no lo fuera la api pediría esos datos — que es
   * lo que hace el flujo de reserva.
   *
   * La marca del cartón QR sí viaja: quien escaneó y entra por aquí puede ser una
   * ficha nueva, y es al verificar cuando nace con su `origen`.
   */
  const verificarCodigo = useCallback(
    async (codigo: string) => {
      try {
        await handleVerificarCodigoPortal(slug, {
          email: correo,
          codigo,
          slugQr: marcaQr(),
        })
        await fetchMisCitas()
        void fetchFidelidad()
        setFase("citas")
      } catch (err) {
        notify.error(getErrorMessage(err))
      }
    },
    [slug, correo, handleVerificarCodigoPortal, fetchMisCitas, fetchFidelidad]
  )

  const cancelarCita = useCallback(async () => {
    if (!citaACancelar) return
    try {
      const mensaje = await handleCancelarCitaPortal(citaACancelar.id)
      setCitaACancelar(null)
      await fetchMisCitas()
      notify.success(mensaje)
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }, [citaACancelar, handleCancelarCitaPortal, fetchMisCitas])

  const calificarCita = useCallback(async () => {
    if (!citaACalificar) return
    try {
      const mensaje = await handleCalificarCitaPortal(citaACalificar.id, { puntaje })
      setCitaACalificar(null)
      notify.success(mensaje)
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }, [citaACalificar, puntaje, handleCalificarCitaPortal])

  if (loadingPortal || !barberia) {
    return (
      <main className="mx-auto w-full max-w-[1200px] space-y-5 p-4 sm:p-6 lg:px-8">
        <DataSkeleton variant="list" count={3} />
      </main>
    )
  }

  return (
    <MotionConfig reducedMotion="user">
      <PortalCabeceraNav
        nombre={barberia.nombreComercial}
        abiertoAhora={sede?.abiertoAhora ?? false}
        horarioHoy={sede ? horarioDeHoy(sede.horario, new Date().getDay()) : ""}
        hrefVolver={`/b/${slug}`}
      />

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
          <div className="min-w-0 space-y-5">
            <header>
              <p className="text-[11px] font-semibold tracking-[0.2em] text-primary uppercase">
                {barberia.nombreComercial}
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Mis citas
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {fase === "citas"
                  ? "Tus citas en esta barbería. Puedes cancelar y calificar lo atendido."
                  : "Entra con el correo con el que reservaste — sin contraseñas."}
              </p>
            </header>

            <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
              {fase === "correo" && (
                <PortalAccesoForm onSubmit={pedirCodigo} cargando={loadingAction} />
              )}

              {fase === "codigo" && (
                <PortalOtpForm
                  destino={correo}
                  onSubmit={verificarCodigo}
                  onReenviar={reenviarCodigo}
                  cargando={loadingAction || loadingCitas}
                />
              )}

              {fase === "citas" && (
                <PortalCitasList
                  citas={citas}
                  loading={loadingCitas}
                  cargandoAccion={loadingAction}
                  formato={formato}
                  onCancelar={setCitaACancelar}
                  onCalificar={(cita) => {
                    setPuntaje(5)
                    setCitaACalificar(cita)
                  }}
                />
              )}
            </section>

            {/* Fidelización: solo si la barbería tiene programa. Sin él no se pinta
                nada — una sección vacía sugeriría que hay puntos que no existen. */}
            {fase === "citas" && fidelidad?.programa && (
              <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {fidelidad.programa.nombre}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {fidelidad.puntosHistoricos} puntos acumulados desde que vienes
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-primary tabular-nums">
                    {fidelidad.saldoPuntos}
                  </p>
                </div>

                {fidelidad.premios.length > 0 && (
                  <ul className="mt-4 space-y-2 border-t border-border pt-4">
                    {fidelidad.premios.map((premio) => (
                      <li
                        key={premio.id}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <Gift className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                          <span className="truncate text-foreground">{premio.nombre}</span>
                        </span>
                        <span className="shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
                          {premio.costoPuntos} pts
                          {!premio.alcanzable && " · te faltan"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <PortalNegocioCard sede={sede} />
          </aside>
        </div>
      </main>

      <Modal
        open={!!citaACancelar}
        onOpenChange={(abierto) => !abierto && setCitaACancelar(null)}
        titulo="¿Cancelar esta cita?"
        descripcion="Liberamos el cupo para otro cliente. Puedes volver a reservar cuando quieras."
        size="sm"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCitaACancelar(null)}
              className="h-11 flex-1 cursor-pointer text-xs font-semibold"
            >
              Mantener cita
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={loadingAction}
              onClick={() => void cancelarCita()}
              className="h-11 flex-1 cursor-pointer text-xs font-semibold"
            >
              Sí, cancelar
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          {citaACancelar && resumenServicios(citaACancelar.servicios.map((l) => l.nombre))} con{" "}
          {citaACancelar?.barbero?.nombrePublico ?? "tu barbero"} ·{" "}
          {citaACancelar?.codigoSeguimiento}
        </p>
      </Modal>

      <Modal
        open={!!citaACalificar}
        onOpenChange={(abierto) => !abierto && setCitaACalificar(null)}
        titulo="¿Cómo te fue?"
        descripcion="Una calificación por cita. El comentario lo publica la barbería si lo aprueba."
        size="sm"
        footer={
          <Button
            type="button"
            disabled={loadingAction}
            onClick={() => void calificarCita()}
            className="h-11 w-full cursor-pointer text-xs font-semibold"
          >
            Enviar calificación
          </Button>
        }
      >
        <div className="flex justify-center gap-2" role="radiogroup" aria-label="Puntaje">
          {[1, 2, 3, 4, 5].map((valor) => (
            <button
              key={valor}
              type="button"
              role="radio"
              aria-checked={puntaje === valor}
              aria-label={`${valor} de 5`}
              onClick={() => setPuntaje(valor)}
              className="cursor-pointer rounded-full p-1 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <Star
                className={
                  valor <= puntaje
                    ? "h-8 w-8 fill-primary text-primary"
                    : "h-8 w-8 text-muted-foreground"
                }
                aria-hidden
              />
            </button>
          ))}
        </div>
      </Modal>
    </MotionConfig>
  )
}
