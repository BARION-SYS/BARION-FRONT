"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, Store, Tags } from "lucide-react"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"
import { SinDatos } from "@shared/components/feedback/SinDatos"
import { Button } from "@shared/components/ui/button"
import { puede } from "@features/auth/utils/permisos"
import { useAuthStore } from "@store/auth.store"
import { usePlataforma } from "@features/plataforma/hooks/usePlataforma"
import { PlataformaAltasList } from "@features/plataforma/components/PlataformaAltasList"
import { PlataformaAtencionList } from "@features/plataforma/components/PlataformaAtencionList"
import { PlataformaClientelaList } from "@features/plataforma/components/PlataformaClientelaList"
import { PlataformaEvolucionChart } from "@features/plataforma/components/PlataformaEvolucionChart"
import { PlataformaFacturacionChart } from "@features/plataforma/components/PlataformaFacturacionChart"
import { PlataformaIndicadores } from "@features/plataforma/components/PlataformaIndicadores"
import { PlataformaPaisesList } from "@features/plataforma/components/PlataformaPaisesList"
import { PlataformaSaludChart } from "@features/plataforma/components/PlataformaSaludChart"
import { PlataformaSegmentosChart } from "@features/plataforma/components/PlataformaSegmentosChart"
import {
  distribucionPorPlan,
  resumirInventario,
  topClientela,
  ultimasAltas,
  usoPorPais,
} from "@features/plataforma/utils/inventario"
import {
  MOTIVO_ATENCION,
  adopcion,
  requierenAtencion,
  saludDeCartera,
  type MotivoAtencion,
} from "@features/plataforma/utils/salud"
import { mesesHasta } from "@features/plataforma/utils/series"

/** La ventana de la historia. Doce meses: un año entero de estacionalidad. */
const MESES = 12

/**
 * Cómo va el negocio de Barion, no el de una barbería.
 *
 * Dos fuentes, y cada una responde lo suyo: el INVENTARIO completo (una lectura
 * con `paginar=false`) dice dónde está cada barbería hoy, y la HISTORIA mensual
 * dice hacia dónde va la plataforma. La facturación solo se pide con la
 * capacidad de cobrar: quien solo consulta el inventario no la necesita.
 */
export default function AdminPage() {
  const {
    barberias,
    metricas,
    facturacion,
    loadingLista,
    loadingMetricas,
    loadingFacturacion,
    error,
    errorMetricas,
    fetchBarberias,
    fetchMetricas,
    fetchFacturacion,
  } = usePlataforma()

  const sesion = useAuthStore((estado) => estado.sesion)
  const veFacturacion = puede(sesion, "plataforma.suscripciones.gestionar")

  // El «ahora» de la pantalla, fijado al montar: el pulso y los meses de la
  // ventana tienen que medirse contra el mismo instante en todos los bloques.
  const [ahora] = useState(() => new Date())

  useEffect(() => {
    // Sin paginar: el resumen cuenta el inventario entero, y `limit=100` como
    // sustituto empieza a mentir el día que haya 101 barberías.
    void fetchBarberias({ paginar: false })
    void fetchMetricas({ meses: MESES })
  }, [fetchBarberias, fetchMetricas])

  useEffect(() => {
    if (veFacturacion) void fetchFacturacion({ meses: MESES })
  }, [veFacturacion, fetchFacturacion])

  const resumen = useMemo(() => resumirInventario(barberias), [barberias])
  const salud = useMemo(() => saludDeCartera(barberias, ahora), [barberias, ahora])
  const atencion = useMemo(() => requierenAtencion(barberias, ahora), [barberias, ahora])
  const uso = useMemo(() => adopcion(barberias), [barberias])
  const porPais = useMemo(() => usoPorPais(barberias), [barberias])
  const porPlan = useMemo(() => distribucionPorPlan(barberias), [barberias])
  const recientes = useMemo(() => ultimasAltas(barberias), [barberias])
  const conMasClientela = useMemo(() => topClientela(barberias), [barberias])
  const ventana = useMemo(() => mesesHasta(ahora, MESES), [ahora])

  // «3 dormidas · 2 en mora»: los dos motivos más frecuentes, para que la
  // tarjeta diga de qué va el número sin tener que bajar a la lista.
  const detalleAtencion = useMemo(() => {
    const cuenta = new Map<MotivoAtencion, number>()
    for (const item of atencion) {
      for (const motivo of item.motivos) cuenta.set(motivo, (cuenta.get(motivo) ?? 0) + 1)
    }
    const partes = [...cuenta.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([motivo, total]) => `${total} ${MOTIVO_ATENCION[motivo].etiqueta.toLowerCase()}`)
    return partes.length > 0 ? partes.join(" · ") : "Ninguna por ahora"
  }, [atencion])

  const planes = (
    <PlataformaSegmentosChart
      titulo="Por plan"
      subtitulo="Qué tiene contratado cada quien"
      segmentos={porPlan}
      color="var(--chart-1)"
      vacio={{
        titulo: "Sin planes contratados",
        detalle: "Cada alta arranca con su plan de prueba.",
        icono: Tags,
      }}
    />
  )

  return (
    <main className="scroll-fino flex flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6">
      {error && <p className="text-sm text-destructive">{error}</p>}

      <PlataformaIndicadores
        resumen={resumen}
        meses={metricas}
        adopcion={uso}
        atencion={{ total: atencion.length, detalle: detalleAtencion }}
        loading={loadingLista}
      />

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <PlataformaEvolucionChart
            meses={metricas}
            loading={loadingMetricas}
            error={errorMetricas}
          />
        </div>

        {/* El foco del área: quién opera sano y a quién hay que llamar hoy */}
        <SectionCard
          titulo="Pulso de la cartera"
          subtitulo="Las activas se miden por lo que agendan"
          className="h-full"
        >
          {loadingLista ? (
            <DataSkeleton variant="card" />
          ) : resumen.total === 0 ? (
            <SinDatos
              titulo="Todavía no hay barberías"
              detalle="En cuanto des de alta la primera, aquí se ve cómo está la cartera."
              icono={Store}
            />
          ) : (
            <PlataformaSaludChart segmentos={salud} total={resumen.total} />
          )}

          <div className="mt-5 border-t border-border pt-4">
            <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              A quién llamar hoy
            </p>
            <PlataformaAtencionList items={atencion} loading={loadingLista} />
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {veFacturacion && (
          <div className="min-w-0 lg:col-span-2">
            <PlataformaFacturacionChart
              facturacion={facturacion}
              meses={ventana}
              loading={loadingFacturacion}
            />
          </div>
        )}
        {/* El país dejó de ser una barra: «dónde se vendió» y «dónde se usa» no
            son la misma pregunta, y tres cifras por país no caben en un eje */}
        <PlataformaPaisesList paises={porPais} loading={loadingLista} />
        {!veFacturacion && planes}
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <SectionCard
          titulo="Con más clientela"
          subtitulo="A quién no se puede perder"
          accion={
            <Button variant="ghost" size="sm" render={<Link href="/admin/barberias" />}>
              Inventario
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          }
        >
          <PlataformaClientelaList barberias={conMasClientela} loading={loadingLista} />
        </SectionCard>

        {veFacturacion && planes}

        <SectionCard titulo="Últimas altas" subtitulo="Lo que entró más recientemente">
          <PlataformaAltasList barberias={recientes} loading={loadingLista} />
        </SectionCard>
      </div>
    </main>
  )
}
