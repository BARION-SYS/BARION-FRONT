"use client"

import { use, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { notFound } from "next/navigation"
import { MotionConfig } from "motion/react"
import { PortalAccionCancelarForm } from "@features/portal/components/PortalAccionCancelarForm"
import { PortalAccionDetail } from "@features/portal/components/PortalAccionDetail"
import { PortalAccionPuntajeForm } from "@features/portal/components/PortalAccionPuntajeForm"
import { PortalCabeceraNav } from "@features/portal/components/PortalCabeceraNav"
import { usePortal } from "@features/portal/hooks/usePortal"
import { motivoDeAccion } from "@features/portal/utils/acciones"
import { horarioDeHoy } from "@features/portal/utils/horarios"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"
import { getErrorMessage } from "@shared/utils/error"
import { useMarcaStore } from "@store/marca.store"
import type { DatosAccionEnlace } from "@features/portal/schemas/portal.schema"

/**
 * Qué se pinta: resolviendo el enlace, pidiendo lo que falta —el puntaje o el sí
 * de una cancelación—, o el desenlace.
 */
type FaseAccion = "resolviendo" | "puntaje" | "cancelar" | "hecho" | "fallo"

/**
 * A DÓNDE APUNTAN LOS ENLACES DE LOS CORREOS — `/b/{slug}/accion/{token}`.
 *
 * Confirmar la cita, cancelarla, tomar un cupo liberado de la lista de espera,
 * calificar y darse de baja de las comunicaciones comerciales: los cinco llegan
 * aquí, y esta pantalla **no sabe cuál es cuál**.
 *
 * ── Qué hace el enlace lo decide el TOKEN ───────────────────────────────────
 * No hay selector, ni parámetro, ni campo en el cuerpo que diga el propósito. Lo
 * resuelve la api al ejecutarlo, y es lo que impide que un enlace de «calificar»
 * reenviado por WhatsApp sirva para cancelarle la cita a otro. El cuerpo solo
 * aporta lo que el token no puede llevar dentro: el motivo y el puntaje.
 *
 * ── Por eso se ejecuta al abrir ─────────────────────────────────────────────
 * Tres de los cinco propósitos se completan con el cuerpo vacío, así que se llama
 * nada más entrar: quien pulsó «Confirmar mi cita» en su correo ya dijo lo que
 * quería, y una segunda pantalla de confirmación sería un paso de más.
 *
 * Los otros dos necesitan algo que el token no lleva dentro, y **la api lo dice
 * sin gastar el enlace** (marca el token como usado solo después de aplicar el
 * efecto). Esa negativa —`motivo`, nunca la frase del mensaje— es la que abre el
 * formulario que falta:
 *
 *  · `falta_puntaje` → la calificación, que exige la nota.
 *  · `requiere_confirmacion` → la cancelación, la ÚNICA destructiva: libera un
 *    cupo que puede coger otro, así que exige un clic explícito, y de paso es lo
 *    que permite pedir el motivo —antes era imposible, porque cuando se sabía que
 *    el token era de cancelación ya estaba gastado.
 *
 * Si `motivo` no llega —una api anterior a ese campo— el comportamiento es el de
 * siempre: solo se detecta la petición de puntaje y la cancelación se ejecuta al
 * abrir. No se rompe nada; se pierde la confirmación hasta que la api despliegue.
 *
 * ── Un enlace es de un solo uso ─────────────────────────────────────────────
 * De ahí el `useRef`: en desarrollo React monta dos veces y el segundo intento
 * recibiría «este enlace ya no sirve» sobre una acción que SÍ funcionó.
 *
 * Sus tres fallos —no existe, ya se usó, caducó— responden lo mismo a propósito,
 * y aquí se pintan igual: distinguirlos convertiría la pantalla en un oráculo de
 * qué enlaces ajenos siguen vivos.
 */
export default function AccionEnlacePage({
  params,
}: {
  params: Promise<{ slug: string; token: string }>
}) {
  const { slug, token } = use(params)
  const {
    barberia,
    accion,
    loadingPortal,
    loadingAccion,
    error,
    fetchPortal,
    handleEjecutarAccionPortal,
  } = usePortal()

  const [fase, setFase] = useState<FaseAccion>("resolviendo")
  /** El `message` de la api: en éxito qué pasó, en fallo el único mensaje. */
  const [mensaje, setMensaje] = useState("")

  const ejecutado = useRef(false)
  const setMarca = useMarcaStore((s) => s.setMarca)

  // La ficha, con el mismo mecanismo que el escaparate: esta pantalla se abre
  // desde una bandeja de entrada y tiene que llevar la marca de SU barbería.
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
   * Ejecutar el enlace. Se usa dos veces: al abrir con el cuerpo vacío y, si la
   * api pidió algo, con lo que el cliente escribió — **el mismo token**, que
   * sigue vivo porque un rechazo no lo gasta.
   */
  const resolverEnlace = useCallback(
    async (datos: DatosAccionEnlace) => {
      try {
        setMensaje(await handleEjecutarAccionPortal(slug, token, datos))
        setFase("hecho")
      } catch (err) {
        // Los dos rechazos que NO son un fallo: falta un dato o falta el sí.
        const motivo = motivoDeAccion(err)
        if (motivo === "falta_puntaje") {
          setFase("puntaje")
          return
        }
        if (motivo === "requiere_confirmacion") {
          setFase("cancelar")
          return
        }
        setMensaje(getErrorMessage(err))
        setFase("fallo")
      }
    },
    [slug, token, handleEjecutarAccionPortal]
  )

  useEffect(() => {
    if (ejecutado.current) return
    ejecutado.current = true
    void resolverEnlace({})
  }, [resolverEnlace])

  const sede = barberia?.sedes[0] ?? null
  const horarioHoy = useMemo(
    () => (sede ? horarioDeHoy(sede.horario, new Date().getDay()) : ""),
    [sede]
  )

  if (loadingPortal) {
    return (
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-10 sm:px-6">
        <DataSkeleton variant="card" />
      </main>
    )
  }

  // Sin ficha no hay escaparate ni enlace que valga: la dirección no existe, la
  // barbería está suspendida o todavía no verificó su correo. Los tres son un 404.
  if (!barberia) {
    if (error) notFound()
    return null
  }

  const hrefPortal = `/b/${slug}`

  return (
    <MotionConfig reducedMotion="user">
      <PortalCabeceraNav
        nombre={barberia.nombreComercial}
        abiertoAhora={sede?.abiertoAhora ?? false}
        horarioHoy={horarioHoy}
        hrefVolver={hrefPortal}
      />

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-10 sm:px-6">
        {fase === "resolviendo" && <DataSkeleton variant="card" />}

        {fase === "puntaje" && (
          <section
            className="rounded-2xl border border-border bg-card p-6 sm:p-8"
            aria-labelledby="titulo-accion-pendiente"
          >
            <h1
              id="titulo-accion-pendiente"
              className="text-xl font-bold tracking-tight text-foreground sm:text-2xl"
            >
              Califica tu visita
            </h1>
            <p className="mt-1.5 mb-6 text-sm text-muted-foreground">
              Es lo que decide a quién recomendamos. Este enlace sirve una sola vez.
            </p>

            <PortalAccionPuntajeForm onSubmit={resolverEnlace} cargando={loadingAccion} />
          </section>
        )}

        {fase === "cancelar" && (
          <section
            className="rounded-2xl border border-border bg-card p-6 sm:p-8"
            aria-labelledby="titulo-accion-pendiente"
          >
            <h1
              id="titulo-accion-pendiente"
              className="text-xl font-bold tracking-tight text-foreground sm:text-2xl"
            >
              ¿Cancelas tu cita?
            </h1>
            <p className="mt-1.5 mb-6 text-sm text-muted-foreground">
              Todavía no hemos cancelado nada. Al confirmar, el cupo queda libre para otro cliente y
              no se puede deshacer.
            </p>

            <PortalAccionCancelarForm
              onSubmit={(datos) => resolverEnlace({ confirmado: true, motivo: datos.motivo })}
              hrefPortal={hrefPortal}
              cargando={loadingAccion}
            />
          </section>
        )}

        {(fase === "hecho" || fase === "fallo") && (
          <PortalAccionDetail
            resultado={fase === "hecho" ? (accion?.resultado ?? null) : null}
            mensaje={mensaje}
            nombreBarberia={barberia.nombreComercial}
            hrefPortal={hrefPortal}
            hrefCitas={accion?.citaId ? `${hrefPortal}/mis-citas` : null}
          />
        )}
      </main>
    </MotionConfig>
  )
}
