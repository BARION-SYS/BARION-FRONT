"use client"

import { useEffect } from "react"
import { ConfiguracionNav } from "@features/configuracion/components/ConfiguracionNav"
import { useConfiguracion } from "@features/configuracion/hooks/useConfiguracion"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"

/**
 * El chrome de Configuración: el menú de apartados y el hueco donde se pinta el
 * que esté abierto.
 *
 * Vive en el layout y no en cada página porque **no se remonta al cambiar de
 * apartado**: el menú no parpadea, no se vuelve a pedir su catálogo y el scroll
 * del contenedor no se reinicia. Cada apartado de dentro es su propio padre —
 * pide lo suyo al montarse y tiene sus propios modales.
 */
export default function ConfiguracionLayout({ children }: { children: React.ReactNode }) {
  const { secciones, loadingSecciones, fetchSecciones } = useConfiguracion()

  useEffect(() => {
    void fetchSecciones()
  }, [fetchSecciones])

  return (
    <main className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 md:flex-row md:items-start md:p-6">
      {loadingSecciones || secciones.length === 0 ? (
        <DataSkeleton variant="list" count={6} className="shrink-0 md:w-56" />
      ) : (
        <ConfiguracionNav secciones={secciones} />
      )}

      <div className="w-full min-w-0 flex-1 space-y-4">{children}</div>
    </main>
  )
}
