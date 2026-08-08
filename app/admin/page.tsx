"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, Tags } from "lucide-react"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { Modal } from "@shared/components/modals/Modal"
import { Button } from "@shared/components/ui/button"
import { notify } from "@shared/services/notify"
import { getErrorMessage } from "@shared/utils/error"
import { puede } from "@features/auth/utils/permisos"
import { useAuthStore } from "@store/auth.store"
import { usePlataforma } from "@features/plataforma/hooks/usePlataforma"
import { PlataformaAltasList } from "@features/plataforma/components/PlataformaAltasList"
import { PlataformaClientelaList } from "@features/plataforma/components/PlataformaClientelaList"
import { PlataformaDetail } from "@features/plataforma/components/PlataformaDetail"
import { PlataformaEstadoChart } from "@features/plataforma/components/PlataformaEstadoChart"
import { PlataformaIndicadores } from "@features/plataforma/components/PlataformaIndicadores"
import { PlataformaPaisesList } from "@features/plataforma/components/PlataformaPaisesList"
import { PlataformaSegmentosChart } from "@features/plataforma/components/PlataformaSegmentosChart"
import {
  distribucionPorEstado,
  distribucionPorPlan,
  resumirInventario,
  topClientela,
  ultimasAltas,
  usoPorPais,
} from "@features/plataforma/utils/inventario"
import type { EstadoBarberia } from "@features/plataforma/types/plataforma.types"

/**
 * Cómo va el negocio de Barion, no el de una barbería.
 *
 * Todo lo que se ve aquí sale del inventario COMPLETO —una sola lectura con
 * `paginar=false`— y se cuenta en el cliente: son sumas de lo que ya viaja en
 * cada fila, y pedirle a la API un endpoint de agregados sería mantener la misma
 * verdad en dos sitios. Cuando no hay barberías todavía no se pintan ceros: se
 * dice que no hay ninguna, que es otra cosa.
 */
export default function AdminPage() {
  const {
    barberias,
    ficha,
    loadingLista,
    loadingFicha,
    loadingAction,
    error,
    fetchBarberias,
    fetchBarberia,
    handleChangeEstadoBarberia,
    limpiarFicha,
  } = usePlataforma()

  const sesion = useAuthStore((estado) => estado.sesion)
  const gestiona = puede(sesion, "plataforma.barberias.gestionar")

  // Estado de UI: la ficha abierta vive en el contenedor, nunca en el hook.
  const [abierta, setAbierta] = useState(false)

  const cargar = useCallback(() => {
    // Sin paginar: el resumen cuenta el inventario entero, y `limit=100` como
    // sustituto empieza a mentir el día que haya 101 barberías.
    void fetchBarberias({ paginar: false })
  }, [fetchBarberias])

  useEffect(() => {
    cargar()
  }, [cargar])

  const resumen = useMemo(() => resumirInventario(barberias), [barberias])
  const porEstado = useMemo(() => distribucionPorEstado(barberias), [barberias])
  const porPais = useMemo(() => usoPorPais(barberias), [barberias])
  const porPlan = useMemo(() => distribucionPorPlan(barberias), [barberias])
  const recientes = useMemo(() => ultimasAltas(barberias), [barberias])
  const conMasClientela = useMemo(() => topClientela(barberias), [barberias])

  const onAbrir = useCallback(
    (id: string) => {
      setAbierta(true)
      void fetchBarberia(id)
    },
    [fetchBarberia]
  )

  const onCerrar = useCallback(
    (abierto: boolean) => {
      setAbierta(abierto)
      if (!abierto) limpiarFicha()
    },
    [limpiarFicha]
  )

  const onCambiarEstado = useCallback(
    async (id: string, destino: EstadoBarberia) => {
      try {
        const mensaje = await handleChangeEstadoBarberia(id, { estado: destino })
        notify.success(mensaje)
        cargar()
      } catch (err) {
        notify.error(getErrorMessage(err))
      }
    },
    [handleChangeEstadoBarberia, cargar]
  )

  return (
    <main className="scroll-fino flex flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6">
      {error && <p className="text-sm text-destructive">{error}</p>}

      <PlataformaIndicadores resumen={resumen} loading={loadingLista} />

      <div className="grid gap-4 xl:grid-cols-3">
        <PlataformaEstadoChart segmentos={porEstado} total={resumen.total} />
        {/* El país dejó de ser una barra: «dónde se vendió» y «dónde se usa» no
            son la misma pregunta, y tres cifras por país no caben en un eje */}
        <PlataformaPaisesList paises={porPais} loading={loadingLista} />
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
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          titulo="Con más clientela"
          subtitulo="A quién no se puede perder"
          accion={
            <Button variant="outline" size="sm" render={<Link href="/admin/barberias" />}>
              Ver el inventario
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          }
        >
          <PlataformaClientelaList
            barberias={conMasClientela}
            loading={loadingLista}
            onAbrir={(barberia) => onAbrir(barberia.id)}
          />
        </SectionCard>

        <SectionCard titulo="Últimas altas" subtitulo="Lo que entró más recientemente">
          <PlataformaAltasList
            barberias={recientes}
            loading={loadingLista}
            onAbrir={(barberia) => onAbrir(barberia.id)}
          />
        </SectionCard>
      </div>

      <Modal
        open={abierta}
        onOpenChange={onCerrar}
        titulo="Ficha de la barbería"
        descripcion="Cómo está montada y en qué estado opera."
        size="lg"
      >
        <PlataformaDetail
          ficha={ficha}
          loading={loadingFicha}
          gestiona={gestiona}
          cargandoAccion={loadingAction}
          onCambiarEstado={(destino) => ficha && void onCambiarEstado(ficha.id, destino)}
        />
      </Modal>
    </main>
  )
}
