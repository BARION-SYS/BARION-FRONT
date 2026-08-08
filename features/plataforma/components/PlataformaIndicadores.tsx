"use client"

import {
  CalendarClock,
  MoonStar,
  PauseCircle,
  Scissors,
  Store,
  TimerReset,
  Users,
} from "lucide-react"
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

  if (loading) return <DataSkeleton variant="stats" count={7} />

  const atencion = resumen.porEstado.suspendida + resumen.porEstado.solo_lectura

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-7">
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
      {/* La clientela de las barberías, sumada. Es el tamaño real de lo que
          sostiene Barion: veinte barberías con dos mil personas debajo es otro
          producto que veinte con cincuenta */}
      <StatCard
        titulo="Clientes"
        valor={numero(resumen.clientesTotal)}
        subtitulo={
          resumen.clientesNuevos30d > 0
            ? `${numero(resumen.clientesNuevos30d)} nuevos en 30 días`
            : "Ninguno nuevo en 30 días"
        }
        icono={Users}
      />
      <StatCard
        titulo="Citas · 30 días"
        valor={numero(resumen.citas30d)}
        subtitulo={`${numero(resumen.citasTotal)} desde el principio`}
        icono={CalendarClock}
      />
      {/* Va junto a lo demás y no escondido: es la señal que se adelanta al
          impago. Una barbería deja de usar Barion meses antes de dejar de
          pagarlo, y para entonces ya no hay nada que hacer */}
      <StatCard
        titulo="Sin actividad"
        valor={numero(resumen.inactivas30d)}
        subtitulo="Ninguna cita creada en 30 días"
        icono={MoonStar}
      />
      <StatCard
        titulo="Barberos activos"
        valor={numero(resumen.barberosActivos)}
        subtitulo={`En ${numero(resumen.sedesActivas)} sedes`}
        icono={Scissors}
      />
    </div>
  )
}
