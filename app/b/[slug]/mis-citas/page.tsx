"use client"

import { Suspense, use, useCallback, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { MotionConfig } from "motion/react"
import { Gift, Star } from "lucide-react"
import { regionDePais } from "@config/regiones"
import { PortalAccesoForm } from "@features/portal/components/PortalAccesoForm"
import { PortalCabeceraNav } from "@features/portal/components/PortalCabeceraNav"
import { PortalCitasList } from "@features/portal/components/PortalCitasList"
import { PortalGoogleForm } from "@features/portal/components/PortalGoogleForm"
import { PortalNegocioCard } from "@features/portal/components/PortalNegocioCard"
import { PortalOtpForm } from "@features/portal/components/PortalOtpForm"
import { usePortal } from "@features/portal/hooks/usePortal"
import { ordenarCitasCliente } from "@features/portal/utils/citas"
import { type ContextoFormato } from "@features/portal/utils/formato"
import { horarioDeHoy } from "@features/portal/utils/horarios"
import { marcaQr } from "@features/portal/utils/qr"
import { mensajeDeErrorOauth } from "@features/auth/utils/errores-oauth"
import { resumenServicios } from "@features/citas/utils/servicios"
import { Button } from "@shared/components/ui/button"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"
import { Modal } from "@shared/components/modals/Modal"
import { notify } from "@shared/services/notify"
import { getErrorMessage } from "@shared/utils/error"
import { useMarcaStore } from "@store/marca.store"
import { usePortalStore } from "@store/portal.store"
import type {
  DatosRegistrarClienteGoogle,
  DatosSolicitarCodigo,
} from "@features/portal/schemas/portal.schema"
import type { Cita } from "@features/portal/types/portal.types"
import { useTextos } from "@shared/textos/useTextos"

/** Qué se pinta: pedir el correo, escribir el código, o ya lo suyo. */
type FaseAcceso = "correo" | "codigo" | "google" | "citas"

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
  return (
    <Suspense>
      <ContenedorMisCitas slug={slug} />
    </Suspense>
  )
}

/**
 * `useSearchParams` obliga a vivir bajo un `Suspense`: sin él Next no puede
 * prerenderizar la página y el build falla. Se aísla aquí para que el límite no
 * se pierda al tocar el contenedor.
 */
function ContenedorMisCitas({ slug }: { slug: string }) {
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
    preregistro,
    loadingPreregistro,
    fetchPreregistroCliente,
    handleSolicitarCodigoPortal,
    handleVerificarCodigoPortal,
    handleRegistrarClienteGooglePortal,
    handleCancelarCitaPortal,
    handleCalificarCitaPortal,
  } = usePortal()

  const [fase, setFase] = useState<FaseAcceso>("correo")
  const [correo, setCorreo] = useState("")
  const [citaACancelar, setCitaACancelar] = useState<Cita | null>(null)
  const [citaACalificar, setCitaACalificar] = useState<Cita | null>(null)
  const [puntaje, setPuntaje] = useState(5)

  const setMarca = useMarcaStore((s) => s.setMarca)
  const setRegion = usePortalStore((s) => s.setRegion)
  const t = useTextos("portal.misCitas")

  // La api devuelve aquí tras el viaje al proveedor: `google=listo` cuando dejó
  // el pase, `error=…` cuando no pudo. El pase NO viaja por la dirección —va en
  // cookie firmada—, así que este parámetro solo dice si hay que ir a buscarlo.
  const parametros = useSearchParams()
  const vueltaDeGoogle = parametros.get("google") === "listo"
  const errorOauth = mensajeDeErrorOauth(parametros.get("error"))

  useEffect(() => {
    void fetchPortal(slug)
  }, [fetchPortal, slug])

  useEffect(() => {
    if (vueltaDeGoogle) void fetchPreregistroCliente(slug)
  }, [vueltaDeGoogle, fetchPreregistroCliente, slug])

  // El fallo del proveedor llega por una navegación, sin nada en pantalla que
  // lo explique: se dice al aterrizar y no se guarda para después.
  useEffect(() => {
    if (errorOauth) notify.error(errorOauth)
  }, [errorOauth])

  useEffect(() => {
    if (!barberia) return
    setMarca({
      colorMarca: barberia.marca.colorMarca,
      colorFondo: barberia.marca.colorFondo,
    })
    // Y su país, que es de donde sale el idioma del escaparate: aquí no hay una
    // persona con preferencia guardada, hay una barbería concreta.
    setRegion(regionDePais(barberia.pais) ?? null)
  }, [barberia, setMarca, setRegion])

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

  /**
   * La fase que se pinta, DERIVADA y no copiada a estado.
   *
   * Sin ficha en esta barbería hay que completar dos datos antes de entrar, y
   * eso lo dice tener pase —no un `setFase` dentro de un efecto, que provoca un
   * render en cascada—. «Citas» gana siempre: una vez dentro, el pase ya se
   * consumió y volver a enseñar su formulario sería un paso hacia atrás.
   */
  const faseEfectiva: FaseAcceso = fase === "citas" ? "citas" : preregistro ? "google" : fase

  const sede = barberia?.sedes[0] ?? null

  const formato: ContextoFormato = useMemo(
    () => ({
      zonaHoraria: sede?.zonaHoraria ?? "UTC",
      moneda: barberia?.moneda ?? "COP",
      locale: barberia?.locale,
    }),
    [sede?.zonaHoraria, barberia?.moneda, barberia?.locale]
  )

  /**
   * Lo que le queda por delante primero. Quien acaba de reservar aterriza aquí y
   * su cita tiene que estar a la vista, no debajo de dos años de historial — la
   * api las devuelve en orden de agenda, que es el que quiere el panel.
   */
  const citasOrdenadas = useMemo(
    () => ordenarCitasCliente(citas, new Date().toISOString()),
    [citas]
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

  const registrarConGoogle = useCallback(
    async (datos: DatosRegistrarClienteGoogle) => {
      try {
        await handleRegistrarClienteGooglePortal(slug, {
          ...datos,
          // La misma marca del cartón que usa el alta por código: atribución,
          // nunca autorización.
          slugQr: marcaQr() ?? undefined,
        })
        setFase("citas")
        void fetchMisCitas()
        void fetchFidelidad()
      } catch (err) {
        notify.error(getErrorMessage(err))
      }
    },
    [slug, handleRegistrarClienteGooglePortal, fetchMisCitas, fetchFidelidad]
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
                {t("titulo")}
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {faseEfectiva === "citas" ? t("conCitas") : t("sinSesion")}
              </p>
            </header>

            <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
              {faseEfectiva === "correo" &&
                (vueltaDeGoogle && loadingPreregistro ? (
                  // Volviendo del proveedor se espera al pase antes de pintar:
                  // enseñar el formulario del código y cambiarlo medio segundo
                  // después es peor que esperar medio segundo.
                  <DataSkeleton variant="form" />
                ) : (
                  <PortalAccesoForm onSubmit={pedirCodigo} slug={slug} cargando={loadingAction} />
                ))}

              {faseEfectiva === "google" && preregistro && (
                <PortalGoogleForm
                  onSubmit={registrarConGoogle}
                  preregistro={preregistro}
                  paisSugerido={regionDePais(barberia.pais)}
                  cargando={loadingAction}
                />
              )}

              {faseEfectiva === "codigo" && (
                <PortalOtpForm
                  destino={correo}
                  onSubmit={verificarCodigo}
                  onReenviar={reenviarCodigo}
                  cargando={loadingAction || loadingCitas}
                />
              )}

              {faseEfectiva === "citas" && (
                <PortalCitasList
                  citas={citasOrdenadas}
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
            {faseEfectiva === "citas" && fidelidad?.programa && (
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
        titulo={t("cancelarTitulo")}
        descripcion={t("cancelarDetalle")}
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
        titulo={t("calificarTitulo")}
        descripcion={t("calificarDetalle")}
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
        <div className="flex justify-center gap-2" role="radiogroup" aria-label={t("puntaje")}>
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
