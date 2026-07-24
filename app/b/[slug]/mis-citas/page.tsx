"use client"

import { use, useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { MotionConfig } from "motion/react"
import { PortalAccesoForm } from "@features/portal/components/PortalAccesoForm"
import { PortalCabeceraNav } from "@features/portal/components/PortalCabeceraNav"
import { PortalCitasList } from "@features/portal/components/PortalCitasList"
import { PortalNegocioCard } from "@features/portal/components/PortalNegocioCard"
import { PortalOtpForm } from "@features/portal/components/PortalOtpForm"
import { usePortal } from "@features/portal/hooks/usePortal"
import { Button } from "@shared/components/ui/button"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"
import { Modal } from "@shared/components/modals/Modal"
import { notify } from "@shared/services/notify"
import { getErrorMessage } from "@shared/utils/error"
import { useMarcaStore } from "@store/marca.store"
import type { DatosAcceso, DatosCodigo } from "@features/portal/schemas/portal.schema"
import type { CitaCliente } from "@features/portal/types/portal.types"

type FaseAcceso = "telefono" | "codigo" | "citas"

// Área del cliente en el portal: consulta y cancela sus citas con el celular verificado.
export default function MisCitasPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const {
    barberia,
    citas,
    loadingPortal,
    loadingCitas,
    loadingAction,
    fetchPortal,
    fetchCitasCliente,
    handleSolicitarCodigoPortal,
    handleCancelarCitaPortal,
  } = usePortal()

  const [fase, setFase] = useState<FaseAcceso>("telefono")
  const [telefono, setTelefono] = useState("")
  const [citaACancelar, setCitaACancelar] = useState<CitaCliente | null>(null)

  const setColorMarca = useMarcaStore((s) => s.setColorMarca)
  const setColorFondo = useMarcaStore((s) => s.setColorFondo)

  useEffect(() => {
    void fetchPortal(slug)
  }, [fetchPortal, slug])

  useEffect(() => {
    if (!barberia) return
    setColorMarca(barberia.colorMarca)
    setColorFondo(barberia.colorFondo)
  }, [barberia, setColorMarca, setColorFondo])

  const pedirCodigo = useCallback(
    async (datos: DatosAcceso) => {
      try {
        const mensaje = await handleSolicitarCodigoPortal(datos)
        setTelefono(datos.telefono)
        setFase("codigo")
        notify.success(mensaje)
      } catch (err) {
        notify.error(getErrorMessage(err))
      }
    },
    [handleSolicitarCodigoPortal]
  )

  const reenviarCodigo = useCallback(async () => {
    try {
      const mensaje = await handleSolicitarCodigoPortal({ telefono })
      notify.success(mensaje)
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }, [telefono, handleSolicitarCodigoPortal])

  // El código ya validado abre la lista: la consulta viaja con el teléfono verificado.
  const verificarCodigo = useCallback(
    async (_codigo: DatosCodigo) => {
      try {
        await fetchCitasCliente({ telefono })
        setFase("citas")
      } catch (err) {
        notify.error(getErrorMessage(err))
      }
    },
    [telefono, fetchCitasCliente]
  )

  const cancelarCita = useCallback(async () => {
    if (!citaACancelar) return
    try {
      const mensaje = await handleCancelarCitaPortal(citaACancelar.id)
      setCitaACancelar(null)
      await fetchCitasCliente({ telefono })
      notify.success(mensaje)
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }, [citaACancelar, telefono, handleCancelarCitaPortal, fetchCitasCliente])

  const hrefRegistro = `/b/${slug}/registro`

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
        nombre={barberia.nombre}
        iniciales={barberia.iniciales}
        abiertoAhora={barberia.abiertoAhora}
        horarioHoy={barberia.horarioHoy}
        hrefVolver={`/b/${slug}`}
        hrefRegistro={hrefRegistro}
      />

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
          <div className="min-w-0 space-y-5">
            <header>
              <p className="text-[11px] font-semibold tracking-[0.2em] text-primary uppercase">
                {barberia.nombre}
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Mis citas
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {fase === "citas"
                  ? `Citas asociadas a ${telefono}`
                  : "Entra con el celular con el que reservaste — sin contraseñas."}
              </p>
            </header>

            <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
              {fase === "telefono" && (
                <PortalAccesoForm onSubmit={pedirCodigo} cargando={loadingAction} />
              )}

              {fase === "codigo" && (
                <PortalOtpForm
                  telefono={telefono}
                  onSubmit={verificarCodigo}
                  onReenviar={reenviarCodigo}
                  cargando={loadingAction || loadingCitas}
                />
              )}

              {fase === "citas" && (
                <PortalCitasList
                  citas={citas}
                  loading={loadingCitas}
                  onCancelar={setCitaACancelar}
                />
              )}
            </section>

            {fase !== "citas" && (
              <p className="text-center text-xs text-muted-foreground">
                ¿Nunca has reservado aquí?{" "}
                <Button
                  render={<Link href={hrefRegistro} />}
                  nativeButton={false}
                  variant="link"
                  className="h-auto p-0 text-xs font-semibold"
                >
                  Crea tu perfil
                </Button>
              </p>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <PortalNegocioCard barberia={barberia} />
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
              onClick={cancelarCita}
              className="h-11 flex-1 cursor-pointer text-xs font-semibold"
            >
              Sí, cancelar
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          {citaACancelar?.servicio} con {citaACancelar?.barbero} · {citaACancelar?.codigo}
        </p>
      </Modal>
    </MotionConfig>
  )
}
