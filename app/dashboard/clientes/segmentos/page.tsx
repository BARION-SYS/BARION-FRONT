"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Plus } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { Modal } from "@shared/components/modals/Modal"
import { SidePanel } from "@shared/components/modals/SidePanel"
import { notify } from "@shared/services/notify"
import { getErrorMessage } from "@shared/utils/error"
import { useSegmentos } from "@features/segmentos/hooks/useSegmentos"
import { ID_FORM_SEGMENTO, SegmentosForm } from "@features/segmentos/components/SegmentosForm"
import { SegmentosList } from "@features/segmentos/components/SegmentosList"
import { useTextos } from "@shared/textos/useTextos"
import type { DatosSegmento } from "@features/segmentos/schemas/segmentos.schema"
import type { Segmento } from "@features/segmentos/types/segmentos.types"

/**
 * El catálogo de etiquetas de la barbería.
 *
 * ── Por qué cuelga de clientes y no de la barra lateral ─────────────────────
 * Una etiqueta no se administra a diario: se define una vez y se revisa cuando
 * algo no cuadra. Quien llega aquí viene de mirar su clientela y preguntarse qué
 * significa una insignia, así que el camino natural es ese y no una entrada
 * permanente que compita con las siete que sí se usan cada día.
 *
 * ── Lo que esta pantalla NO hace ────────────────────────────────────────────
 * Repartir clientes a mano en una etiqueta estática. Eso se hace desde la ficha
 * de cada cliente, que es donde se sabe de quién se está hablando; una lista de
 * dos mil nombres con casillas no es una pantalla, es un formulario imposible.
 */
export default function SegmentosPage() {
  const {
    segmentos,
    loadingLista,
    loadingAction,
    error,
    fetchSegmentos,
    handleCreateSegmento,
    handleUpdateSegmento,
    handleDeactivateSegmento,
    handleActivateSegmento,
  } = useSegmentos()

  const t = useTextos("segmentos")
  const tComun = useTextos("comun")

  const [panelAbierto, setPanelAbierto] = useState(false)
  const [enEdicion, setEnEdicion] = useState<Segmento | null>(null)
  const [porDarDeBaja, setPorDarDeBaja] = useState<Segmento | null>(null)

  useEffect(() => {
    void fetchSegmentos()
  }, [fetchSegmentos])

  const abrirAlta = useCallback(() => {
    setEnEdicion(null)
    setPanelAbierto(true)
  }, [])

  const abrirEdicion = useCallback((segmento: Segmento) => {
    setEnEdicion(segmento)
    setPanelAbierto(true)
  }, [])

  const guardar = useCallback(
    async (datos: DatosSegmento): Promise<void> => {
      try {
        const mensaje = enEdicion
          ? await handleUpdateSegmento(enEdicion.id, datos)
          : await handleCreateSegmento(datos)
        notify.success(mensaje)
        setPanelAbierto(false)
        setEnEdicion(null)
        await fetchSegmentos()
      } catch (err) {
        notify.error(getErrorMessage(err))
      }
    },
    [enEdicion, handleCreateSegmento, handleUpdateSegmento, fetchSegmentos]
  )

  const darDeBaja = useCallback(async (): Promise<void> => {
    if (!porDarDeBaja) return
    try {
      const mensaje = await handleDeactivateSegmento(porDarDeBaja.id)
      notify.success(mensaje)
      setPorDarDeBaja(null)
      await fetchSegmentos()
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }, [porDarDeBaja, handleDeactivateSegmento, fetchSegmentos])

  const reactivar = useCallback(
    async (segmento: Segmento): Promise<void> => {
      try {
        const mensaje = await handleActivateSegmento(segmento.id)
        notify.success(mensaje)
        await fetchSegmentos()
      } catch (err) {
        notify.error(getErrorMessage(err))
      }
    },
    [handleActivateSegmento, fetchSegmentos]
  )

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" render={<Link href="/dashboard/clientes" />}>
          <ArrowLeft className="size-4" />
          {t("volver")}
        </Button>

        <Button onClick={abrirAlta}>
          <Plus className="size-4" />
          {t("nueva")}
        </Button>
      </div>

      <SectionCard titulo={t("titulo")} subtitulo={t("subtitulo")}>
        {error && <p className="mb-3 text-sm text-(--destructive)">{error}</p>}

        <SegmentosList
          segmentos={segmentos}
          loading={loadingLista}
          onEditar={abrirEdicion}
          onDesactivar={setPorDarDeBaja}
          onActivar={(segmento) => void reactivar(segmento)}
        />
      </SectionCard>

      <SidePanel
        open={panelAbierto}
        onOpenChange={setPanelAbierto}
        titulo={enEdicion ? t("form.tituloEdicion") : t("form.tituloAlta")}
        footer={
          <Button type="submit" form={ID_FORM_SEGMENTO} disabled={loadingAction}>
            {enEdicion ? t("form.guardar") : t("form.crear")}
          </Button>
        }
      >
        <SegmentosForm segmento={enEdicion} onSubmit={guardar} />
      </SidePanel>

      <Modal
        open={Boolean(porDarDeBaja)}
        onOpenChange={(abierto) => !abierto && setPorDarDeBaja(null)}
        titulo={t("baja.titulo")}
        footer={
          <>
            <Button variant="ghost" onClick={() => setPorDarDeBaja(null)}>
              {tComun("cancelar")}
            </Button>
            <Button variant="destructive" disabled={loadingAction} onClick={() => void darDeBaja()}>
              {t("baja.confirmar")}
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          {t("baja.detalle", { nombre: porDarDeBaja?.nombre ?? "" })}
        </p>
      </Modal>
    </div>
  )
}
