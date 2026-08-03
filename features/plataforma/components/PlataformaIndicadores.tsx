"use client"

import { Building2, PauseCircle, Scissors, Store, TimerReset } from "lucide-react"
import { StatCard } from "@shared/components/stats/StatCard"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"
import { useFormato } from "@shared/hooks/useFormato"
import type { ResumenPlataforma } from "@features/plataforma/types/plataforma.types"

interface PlataformaIndicadoresProps {
  resumen: ResumenPlataforma
  loading: boolean
}

/**
 * Los números del negocio de Barion, no los de una barbería.
 *
 * Salen de contar el inventario completo —lo que ya viaja en cada fila—, así que
 * son ciertos en el momento en que se pintan y no dependen de ningún agregado
 * nocturno. No hay comparación contra el periodo anterior a propósito: la API no
 * publica historia de la plataforma, y una flecha de tendencia inventada es
 * peor que ninguna.
 */
export function PlataformaIndicadores({ resumen, loading }: PlataformaIndicadoresProps) {
  const { numero } = useFormato()

  if (loading) return <DataSkeleton variant="stats" count={5} />

  const atencion = resumen.porEstado.suspendida + resumen.porEstado.solo_lectura

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5">
      <StatCard
        titulo="Barberías"
        valor={numero(resumen.total)}
        subtitulo={`${numero(resumen.porEstado.activa)} operando con normalidad`}
        icono={Store}
        acento
      />
      <StatCard
        titulo="En prueba"
        valor={numero(resumen.enPrueba)}
        subtitulo={
          resumen.sinSuscripcion > 0
            ? `${numero(resumen.sinSuscripcion)} sin suscripción todavía`
            : "Todas tienen suscripción"
        }
        icono={TimerReset}
      />
      <StatCard
        titulo="Requieren atención"
        valor={numero(atencion)}
        subtitulo={`${numero(resumen.porEstado.suspendida)} suspendidas · ${numero(resumen.porEstado.solo_lectura)} en solo lectura`}
        icono={PauseCircle}
      />
      <StatCard
        titulo="Sedes activas"
        valor={numero(resumen.sedesActivas)}
        subtitulo="Sumando todas las barberías"
        icono={Building2}
      />
      <StatCard
        titulo="Barberos activos"
        valor={numero(resumen.barberosActivos)}
        subtitulo="Quienes atienden hoy en la plataforma"
        icono={Scissors}
      />
    </div>
  )
}
