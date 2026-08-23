"use client"

import { use, useEffect, useMemo } from "react"
import Link from "next/link"
import { MotionConfig } from "motion/react"
import { SearchX } from "lucide-react"
import { PortalCabeceraNav } from "@features/portal/components/PortalCabeceraNav"
import { PortalSeguimientoDetail } from "@features/portal/components/PortalSeguimientoDetail"
import { usePortal } from "@features/portal/hooks/usePortal"
import { type ContextoFormato } from "@features/portal/utils/formato"
import { horarioDeHoy } from "@features/portal/utils/horarios"
import { Button } from "@shared/components/ui/button"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"
import { useMarcaStore } from "@store/marca.store"
import { usePortalStore } from "@store/portal.store"
import { regionDePais } from "@config/regiones"
import { useTextos } from "@shared/textos/useTextos"

/**
 * SEGUIMIENTO DE UNA CITA — `/b/{slug}/seguimiento/{codigo}`.
 *
 * **Es el destino del botón «Ver mi cita» de cada correo de confirmación**, así
 * que quien llega puede no haber entrado nunca al portal: sin sesión, sin cuenta
 * y probablemente desde el móvil, en la bandeja de entrada.
 *
 * La ruta llevaba tiempo enlazada desde el worker y publicada por la api
 * (`GET /publico/barberias/{slug}/citas/{codigo}`), pero esta página no existía:
 * cada confirmación mandaba a un 404. Era el único fallo del sistema que veía el
 * cliente final antes que nadie de dentro.
 *
 * **Solo lectura.** El código viaja en un correo que se reenvía, así que tenerlo
 * no demuestra ser el cliente. Cancelar y reagendar viven donde sí se sabe quién
 * está delante: el token de un solo uso (`/accion/{token}`) o «Mis citas».
 */
export default function SeguimientoPage({
  params,
}: {
  params: Promise<{ slug: string; codigo: string }>
}) {
  const { slug, codigo } = use(params)
  const {
    barberia,
    seguimiento,
    loadingPortal,
    loadingSeguimiento,
    fetchPortal,
    fetchSeguimiento,
  } = usePortal()

  const setMarca = useMarcaStore((s) => s.setMarca)
  const setRegion = usePortalStore((s) => s.setRegion)
  const t = useTextos("portal.seguimiento")

  useEffect(() => {
    void fetchPortal(slug)
  }, [fetchPortal, slug])

  useEffect(() => {
    void fetchSeguimiento(slug, codigo)
  }, [fetchSeguimiento, slug, codigo])

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

  const sede = barberia?.sedes[0] ?? null

  const formato: ContextoFormato = useMemo(
    () => ({
      zonaHoraria: sede?.zonaHoraria ?? "UTC",
      moneda: barberia?.moneda ?? "COP",
      locale: barberia?.locale,
    }),
    [sede?.zonaHoraria, barberia?.moneda, barberia?.locale]
  )

  const cargando = loadingPortal || loadingSeguimiento

  return (
    <MotionConfig reducedMotion="user">
      <PortalCabeceraNav
        nombre={barberia?.nombreComercial ?? ""}
        abiertoAhora={sede?.abiertoAhora ?? false}
        horarioHoy={sede ? horarioDeHoy(sede.horario, new Date().getDay()) : ""}
        hrefCitas={`/b/${slug}/mis-citas`}
        hrefVolver={`/b/${slug}`}
      />

      <main className="mx-auto w-full max-w-[720px] flex-1 px-4 py-8 sm:px-6 lg:py-10">
        {cargando ? (
          <DataSkeleton variant="card" />
        ) : seguimiento ? (
          <PortalSeguimientoDetail
            cita={seguimiento}
            sede={sede}
            formato={formato}
            hrefCitas={`/b/${slug}/mis-citas`}
          />
        ) : (
          /* Un código que no resuelve NO es una avería: está mal copiado, es de
             otra barbería o la cita ya no existe. Se dice con esas palabras y se
             ofrece la salida útil, que es entrar a sus citas */
          <section className="rounded-2xl border border-border bg-card p-8 text-center">
            <span
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary"
              aria-hidden
            >
              <SearchX className="h-7 w-7 text-muted-foreground" />
            </span>
            <h1 className="mt-4 text-xl font-bold text-foreground">{t("noEncontrada")}</h1>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              El código <span className="font-semibold tabular-nums">{codigo}</span> no corresponde
              a ninguna cita de {barberia?.nombreComercial ?? "esta barbería"}. Puede estar mal
              copiado o pertenecer a otra.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button
                render={<Link href={`/b/${slug}/mis-citas`} />}
                size="lg"
                className="h-12 text-sm font-semibold"
              >
                Ver mis citas
              </Button>
              <Button
                render={<Link href={`/b/${slug}`} />}
                variant="outline"
                size="lg"
                className="h-12 text-sm font-semibold"
              >
                Reservar una cita
              </Button>
            </div>
          </section>
        )}
      </main>
    </MotionConfig>
  )
}
