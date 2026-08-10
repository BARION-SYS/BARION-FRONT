"use client"

import { useEffect } from "react"
import { Apariencia } from "@features/configuracion/components/Apariencia"
import { useConfiguracion } from "@features/configuracion/hooks/useConfiguracion"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"

/**
 * Logotipo y vista previa del portal.
 *
 * Aquí NO se eligen los colores: la marca se aplica desde la paleta del navbar y
 * vale para panel y portal a la vez. Lo único que necesita esta pantalla de la api
 * es el nombre comercial, porque lo que enseña es cómo se va a ver.
 */
export default function ConfiguracionAparienciaPage() {
  const { barberia, loadingBarberia, fetchBarberia } = useConfiguracion()

  useEffect(() => {
    void fetchBarberia()
  }, [fetchBarberia])

  if (loadingBarberia) return <DataSkeleton variant="card" count={2} />
  if (!barberia) return null

  return <Apariencia nombreBarberia={barberia.nombreComercial} />
}
