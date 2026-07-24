"use client"

import { use, useCallback, useEffect, useState } from "react"
import { AnimatePresence, MotionConfig, motion } from "motion/react"
import { PortalBienvenida } from "@features/portal/components/PortalBienvenida"
import { PortalCabeceraNav } from "@features/portal/components/PortalCabeceraNav"
import { PortalNegocioCard } from "@features/portal/components/PortalNegocioCard"
import { PortalOtpForm } from "@features/portal/components/PortalOtpForm"
import { PortalRegistroForm } from "@features/portal/components/PortalRegistroForm"
import { usePortal } from "@features/portal/hooks/usePortal"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"
import { notify } from "@shared/services/notify"
import { getErrorMessage } from "@shared/utils/error"
import { useMarcaStore } from "@store/marca.store"
import type { DatosCodigo, DatosRegistro } from "@features/portal/schemas/portal.schema"

type FaseRegistro = "datos" | "codigo" | "listo"

const copiaPorFase: Record<FaseRegistro, { titulo: string; subtitulo: string }> = {
  datos: {
    titulo: "Crea tu perfil",
    subtitulo: "Una vez y listo: la barbería te reconoce en cada reserva.",
  },
  codigo: {
    titulo: "Confirma tu número",
    subtitulo: "Verificamos el celular para que nadie más reserve a tu nombre.",
  },
  listo: { titulo: "Perfil creado", subtitulo: "" },
}

// Alta pública de clientes de la barbería: sin ella el módulo de clientes del panel no se alimenta.
export default function RegistroPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const {
    barberia,
    barberos,
    cliente,
    loadingPortal,
    loadingAction,
    fetchPortal,
    handleSolicitarCodigoPortal,
    handleRegistrarClientePortal,
  } = usePortal()

  const [fase, setFase] = useState<FaseRegistro>("datos")
  const [datos, setDatos] = useState<DatosRegistro | null>(null)

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

  const enviarDatos = useCallback(
    async (valores: DatosRegistro) => {
      try {
        const mensaje = await handleSolicitarCodigoPortal({ telefono: valores.telefono })
        setDatos(valores)
        setFase("codigo")
        notify.success(mensaje)
      } catch (err) {
        notify.error(getErrorMessage(err))
      }
    },
    [handleSolicitarCodigoPortal]
  )

  const reenviarCodigo = useCallback(async () => {
    if (!datos) return
    try {
      const mensaje = await handleSolicitarCodigoPortal({ telefono: datos.telefono })
      notify.success(mensaje)
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }, [datos, handleSolicitarCodigoPortal])

  const confirmarRegistro = useCallback(
    async (_codigo: DatosCodigo) => {
      if (!datos) return
      try {
        const mensaje = await handleRegistrarClientePortal(datos)
        setFase("listo")
        notify.success(mensaje)
      } catch (err) {
        notify.error(getErrorMessage(err))
      }
    },
    [datos, handleRegistrarClientePortal]
  )

  const hrefReservar = `/b/${slug}`
  const hrefCitas = `/b/${slug}/mis-citas`
  const copia = copiaPorFase[fase]

  if (loadingPortal || !barberia) {
    return (
      <main className="mx-auto w-full max-w-[1400px] space-y-5 p-4 sm:p-6 lg:px-8">
        <DataSkeleton variant="form" count={4} />
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
        hrefVolver={hrefReservar}
        hrefCitas={hrefCitas}
      />

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
          <div className="min-w-0">
            <section
              className="rounded-2xl border border-border bg-card p-5 sm:p-7"
              aria-labelledby="titulo-registro"
            >
              {fase !== "listo" && (
                <header className="mb-5">
                  <p className="text-[11px] font-semibold tracking-[0.2em] text-primary uppercase">
                    Clientes de {barberia.nombre}
                  </p>
                  <h1
                    id="titulo-registro"
                    className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
                  >
                    {copia.titulo}
                  </h1>
                  <p className="mt-1.5 text-sm text-muted-foreground">{copia.subtitulo}</p>
                </header>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={fase}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ type: "spring", stiffness: 160, damping: 24 }}
                >
                  {fase === "datos" && (
                    <PortalRegistroForm
                      barberos={barberos}
                      onSubmit={enviarDatos}
                      cargando={loadingAction}
                    />
                  )}

                  {fase === "codigo" && datos && (
                    <PortalOtpForm
                      telefono={datos.telefono}
                      onSubmit={confirmarRegistro}
                      onReenviar={reenviarCodigo}
                      cargando={loadingAction}
                    />
                  )}

                  {fase === "listo" && cliente && (
                    <PortalBienvenida
                      cliente={cliente}
                      nombreBarberia={barberia.nombre}
                      hrefReservar={hrefReservar}
                      hrefCitas={hrefCitas}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </section>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <PortalNegocioCard barberia={barberia} />
          </aside>
        </div>
      </main>
    </MotionConfig>
  )
}
