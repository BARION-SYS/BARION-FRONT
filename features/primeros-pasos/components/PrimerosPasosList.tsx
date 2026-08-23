import { PrimerosPasosCard } from "@features/primeros-pasos/components/PrimerosPasosCard"
import { pasosHechos } from "@features/primeros-pasos/utils/pasos"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { Progress } from "@shared/components/ui/progress"
import { useTextos } from "@shared/textos/useTextos"
import type {
  PasoInicial,
  ProgresoInicial,
} from "@features/primeros-pasos/types/primeros-pasos.types"

interface PrimerosPasosListProps {
  /** Ya filtrados por lo que la sesión puede ejecutar. */
  pasos: PasoInicial[]
  progreso: ProgresoInicial
}

/**
 * Por dónde empezar. Sustituye al alta asistida que no existe: quien termina el
 * registro entra a un panel vacío y esto es lo único que le dice qué hacer.
 *
 * No se pinta sola cuando todo está hecho — de eso se encarga el padre, que es
 * quien sabe si queda algo pendiente.
 */
export function PrimerosPasosList({ pasos, progreso }: PrimerosPasosListProps) {
  const t = useTextos("primerosPasos")
  const hechos = pasosHechos(pasos, progreso)
  const porcentaje = Math.round((hechos / pasos.length) * 100)

  return (
    <SectionCard
      titulo={t("titulo")}
      subtitulo={t("subtitulo")}
      accion={
        <span className="text-xs font-semibold text-muted-foreground tabular-nums">
          {hechos} de {pasos.length}
        </span>
      }
    >
      <Progress
        value={porcentaje}
        aria-label={`Alta completada al ${porcentaje} por ciento`}
        className="mb-4 motion-reduce:[&_[data-slot=progress-indicator]]:transition-none"
      />

      <ol className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        {pasos.map((paso) => (
          <li key={paso.clave}>
            <PrimerosPasosCard paso={paso} hecho={progreso[paso.clave]} />
          </li>
        ))}
      </ol>
    </SectionCard>
  )
}
