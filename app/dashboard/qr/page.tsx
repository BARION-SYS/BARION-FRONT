"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { QrCapacidadesCard } from "@features/qr/components/QrCapacidadesCard"
import { QrCodigoCard } from "@features/qr/components/QrCodigoCard"
import { QrEnlaceCard } from "@features/qr/components/QrEnlaceCard"
import { QrEscaneosList } from "@features/qr/components/QrEscaneosList"
import { useQr } from "@features/qr/hooks/useQr"
import { StatCard } from "@shared/components/stats/StatCard"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"

// Contenedor: instancia el hook UNA vez y reparte datos + callbacks por props.
export default function QrPage() {
  const { estadisticas, enlace, capacidades, escaneos, loadingQr, fetchQr } = useQr()

  // Estado de UI: confirmación transitoria del copiado.
  const [copiado, setCopiado] = useState(false)
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    void fetchQr()
  }, [fetchQr])

  useEffect(() => {
    return () => {
      if (temporizador.current) clearTimeout(temporizador.current)
    }
  }, [])

  const copiarEnlace = useCallback(() => {
    if (!enlace) return
    navigator.clipboard?.writeText(enlace.url).catch(() => {})
    setCopiado(true)
    if (temporizador.current) clearTimeout(temporizador.current)
    temporizador.current = setTimeout(() => setCopiado(false), 2000)
  }, [enlace])

  if (loadingQr) {
    return (
      <main className="flex flex-1 flex-col gap-5 overflow-y-auto p-4 md:p-6">
        <DataSkeleton variant="stats" count={3} className="grid-cols-1 sm:grid-cols-3" />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <DataSkeleton variant="card" />
          <DataSkeleton variant="list" count={4} />
        </div>
      </main>
    )
  }

  return (
    // Móvil: scroll de página. lg+: app-like — alto completo, columnas con scroll propio.
    <main className="flex flex-1 flex-col gap-5 overflow-y-auto p-4 md:p-6 lg:overflow-hidden">
      <section aria-label="Estadísticas del código QR" className="shrink-0">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {estadisticas.map((estadistica) => (
            <StatCard
              key={estadistica.clave}
              titulo={estadistica.titulo}
              valor={estadistica.valor}
              icono={estadistica.icono}
              acento={estadistica.acento}
            />
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:min-h-0 lg:flex-1 lg:grid-cols-[380px_minmax(0,1fr)]">
        {enlace && (
          <div className="scroll-fino flex lg:min-h-0 lg:overflow-y-auto">
            <QrCodigoCard
              nombreBarberia={enlace.nombreBarberia}
              url={enlace.url}
              copiado={copiado}
              onCopiar={copiarEnlace}
            />
          </div>
        )}
        <div className="scroll-fino space-y-4 lg:min-h-0 lg:overflow-y-auto lg:pr-0.5">
          {enlace && <QrEnlaceCard url={enlace.url} copiado={copiado} onCopiar={copiarEnlace} />}
          <QrCapacidadesCard capacidades={capacidades} />
          <QrEscaneosList escaneos={escaneos} />
        </div>
      </div>

      {/* Anuncio del copiado para lectores de pantalla */}
      <span aria-live="polite" className="sr-only">
        {copiado ? "Enlace copiado al portapapeles" : ""}
      </span>
    </main>
  )
}
