import Link from "next/link"
import { Lock, Sparkles } from "lucide-react"
import { rutaDeSeccion } from "@features/configuracion/utils/secciones"
import { Button } from "@shared/components/ui/button"
import { cn } from "@shared/utils/cn"

interface FuncionDelPlanProps {
  /** Cómo se llama la sección para quien la mira: «Los reportes». */
  titulo: string
  /** Qué se lleva con ella, en una frase corta. */
  detalle?: string
  /** Alto mínimo, para que la sección no colapse a una franja. */
  alto?: number
  className?: string
}

/**
 * «Esto va en otro plan» — y NO es un error.
 *
 * Es la cara de un 403 con `motivo: "funcion_no_incluida"`, que es un 403 raro:
 * la ruta existe, la persona TIENE la capacidad, y lo único que falta es que la
 * barbería lo haya contratado. Pintarlo con el bloque rojo de siempre le dice a
 * quien lo lee que algo se rompió, cuando lo que hay es una puerta cerrada con
 * una llave que él mismo puede comprar — normalmente quien mira es el dueño.
 *
 * ── La jerarquía, de arriba a abajo ─────────────────────────────────────────
 * 1. **Etiqueta** — de qué tipo de límite se trata, en una palabra.
 * 2. **Titular** — qué sección es. Es lo único que se lee si solo se ojea.
 * 3. **Frase** — qué se gana y, sobre todo, qué NO se pierde: quien ve un
 *    candado teme que le hayan apagado algo más.
 * 4. **Acción** — una sola, y lleva al sitio donde se resuelve.
 *
 * Sin movimiento: no hay nada que comunicar animando un candado. Y **sin maqueta
 * de fondo**: se probó pintar detrás la sección desenfocada y no aportaba nada
 * —unas tarjetas borrosas se leen como una pantalla a medio cargar, no como algo
 * que se puede desbloquear—. Lo que tiene que quedar claro es el texto.
 *
 * El bloque se anuncia como región con su propio nombre.
 */
export function FuncionDelPlan({ titulo, detalle, alto = 220, className }: FuncionDelPlanProps) {
  return (
    <section
      aria-label={`${titulo}: incluido en otro plan`}
      className={cn(
        "flex items-center justify-center rounded-xl border border-dashed border-border bg-card/40 p-6",
        className
      )}
      style={{ minHeight: alto }}
    >
      <div className="flex w-full max-w-md flex-col items-center gap-4 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          <Lock className="size-3.5" aria-hidden />
          Incluido en otro plan
        </span>

        <div className="space-y-1.5">
          <p className="text-base font-semibold text-balance text-foreground">{titulo}</p>
          {detalle && (
            <p className="mx-auto max-w-sm text-sm leading-relaxed text-pretty text-muted-foreground">
              {detalle}
            </p>
          )}
        </div>

        {/* Una sola acción, y a ancho completo en móvil: es el objetivo táctil
            del bloque, no un enlace de pie de página. */}
        <Button
          className="h-11 w-full sm:h-10 sm:w-auto sm:px-5"
          render={<Link href={rutaDeSeccion("plan")} />}
        >
          <Sparkles className="size-4" aria-hidden />
          Ver planes
        </Button>
      </div>
    </section>
  )
}
