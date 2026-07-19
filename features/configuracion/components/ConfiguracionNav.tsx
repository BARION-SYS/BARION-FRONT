import { ChevronRight } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { cn } from "@shared/utils/cn"
import type {
  IdSeccionConfiguracion,
  SeccionConfiguracion,
} from "@features/configuracion/types/configuracion.types"

interface Props {
  secciones: SeccionConfiguracion[]
  activa: IdSeccionConfiguracion
  alSeleccionar: (id: IdSeccionConfiguracion) => void
}

export function ConfiguracionNav({ secciones, activa, alSeleccionar }: Props) {
  return (
    <nav aria-label="Secciones de configuración" className="w-full shrink-0 md:w-56">
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {secciones.map((seccion) => {
          const esActiva = seccion.id === activa
          return (
            <Button
              key={seccion.id}
              variant="ghost"
              onClick={() => alSeleccionar(seccion.id)}
              aria-current={esActiva ? "true" : undefined}
              className={cn(
                "h-11 w-full cursor-pointer justify-between rounded-none border-b border-border px-4 text-sm transition-colors last:border-b-0 motion-reduce:transition-none",
                esActiva
                  ? "bg-primary/10 font-semibold text-primary hover:bg-primary/10 hover:text-primary"
                  : "font-normal text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <span className="flex items-center gap-2.5">
                <seccion.icono className="h-4 w-4 shrink-0" aria-hidden />
                {seccion.etiqueta}
              </span>
              <ChevronRight className="size-3" aria-hidden />
            </Button>
          )
        })}
      </div>
    </nav>
  )
}
