"use client"

import { useEffect, useMemo, useState } from "react"
import { Notificaciones } from "@features/configuracion/components/Notificaciones"
import { useConfiguracion } from "@features/configuracion/hooks/useConfiguracion"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"
import type {
  CanalNotificacion,
  CanalesNotificacion,
} from "@features/configuracion/types/configuracion.types"

/** Por qué canales se avisa a los clientes. */
export default function ConfiguracionNotificacionesPage() {
  const { canales, loadingCanales, fetchCanales } = useConfiguracion()

  /** Solo los canales que se tocaron aquí; el resto se lee de la api. */
  const [canalesTocados, setCanalesTocados] = useState<Partial<CanalesNotificacion>>({})

  useEffect(() => {
    void fetchCanales()
  }, [fetchCanales])

  /**
   * Los interruptores SALEN de lo que reporta la api, con encima lo que se haya
   * tocado en pantalla. Copiarlos a estado en un efecto dejaba todo en `false`
   * hasta que llegaba la respuesta, y volvía a pisarlos en cada recarga.
   */
  const canalesActivos = useMemo<CanalesNotificacion>(() => {
    const base: CanalesNotificacion = { whatsapp: false, sms: false, correo: false, interno: false }
    for (const canal of canales) base[canal.canal] = canal.activo
    return { ...base, ...canalesTocados }
  }, [canales, canalesTocados])

  const alternarCanal = (canal: CanalNotificacion) =>
    setCanalesTocados((tocados) => ({ ...tocados, [canal]: !canalesActivos[canal] }))

  if (loadingCanales) return <DataSkeleton variant="list" count={4} />

  return <Notificaciones canales={canales} activos={canalesActivos} alAlternar={alternarCanal} />
}
