import { SectionCard } from "@shared/components/cards/SectionCard"
import { Badge } from "@shared/components/ui/badge"
import { useFormato } from "@shared/hooks/useFormato"
import type { SedeQr } from "@features/qr/types/qr.types"

interface QrSedesListProps {
  porSede: SedeQr[]
  /** La sede cuyo cartón se está enseñando, para señalarla en la lista. */
  sedeActualId: string | null
}

/**
 * Qué cartón funciona. Es la única lectura por sede que existe: la ficha de un
 * cliente cuelga de la barbería y no hay local al que atribuirla, así que aquí
 * solo van citas.
 *
 * **Las sedes en cero se enseñan igual.** Un cero es información —ese cartón no
 * está trayendo a nadie— y esconderlo dejaría la lista contando solo buenas
 * noticias.
 */
export function QrSedesList({ porSede, sedeActualId }: QrSedesListProps) {
  const { numero } = useFormato()

  return (
    <SectionCard titulo="Por sede" subtitulo="Citas atribuidas al cartón de cada local">
      <ul className="space-y-1.5">
        {porSede.map((fila) => (
          <li
            key={fila.sede.id}
            className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-secondary/50 motion-reduce:transition-none"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground">
                {fila.sede.nombre}
                {fila.sede.id === sedeActualId && (
                  <span className="ml-1.5 text-xs font-medium text-muted-foreground">
                    (el de arriba)
                  </span>
                )}
              </p>
              <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                {fila.slugQr}
              </p>
            </div>
            <Badge variant="secondary" className="shrink-0 text-xs tabular-nums">
              {numero(fila.citasDesdeQr)}
            </Badge>
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}
