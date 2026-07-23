import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Input } from "@shared/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@shared/components/ui/tabs"
import type { VistaCalendario } from "@features/citas/types/citas.types"

const etiquetasVista: Record<VistaCalendario, string> = {
  semana: "Semana",
  dia: "Día",
  lista: "Lista",
}

interface Props {
  rotulo: string
  vista: VistaCalendario
  alCambiarVista: (vista: VistaCalendario) => void
  busqueda: string
  alCambiarBusqueda: (busqueda: string) => void
  alNuevaCita: () => void
}

export function CitasToolbar({
  rotulo,
  vista,
  alCambiarVista,
  busqueda,
  alCambiarBusqueda,
  alNuevaCita,
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer"
            aria-label="Semana anterior"
          >
            <ChevronLeft aria-hidden />
          </Button>
          <span className="min-w-32 px-1 text-center text-sm font-bold text-foreground capitalize tabular-nums">
            {rotulo}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer"
            aria-label="Semana siguiente"
          >
            <ChevronRight aria-hidden />
          </Button>
        </div>
        <Button
          variant="outline"
          size="lg"
          className="cursor-pointer text-xs font-medium text-muted-foreground"
        >
          Hoy
        </Button>
      </div>

      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
        <div className="relative w-full sm:w-auto">
          <Search
            className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Buscar cita..."
            aria-label="Buscar cita"
            className="h-9 w-full rounded-full border-transparent bg-secondary/60 pl-8 text-xs transition-colors focus-visible:border-border focus-visible:bg-card sm:w-48"
            value={busqueda}
            onChange={(e) => alCambiarBusqueda(e.target.value)}
          />
        </div>

        <Tabs value={vista} onValueChange={(valor) => alCambiarVista(valor as VistaCalendario)}>
          <TabsList className="group-data-horizontal/tabs:h-9">
            {(Object.keys(etiquetasVista) as VistaCalendario[]).map((valor) => (
              <TabsTrigger key={valor} value={valor} className="cursor-pointer px-2.5 text-xs">
                {etiquetasVista[valor]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Button size="lg" className="cursor-pointer text-xs font-semibold" onClick={alNuevaCita}>
          <Plus aria-hidden /> Nueva cita
        </Button>
      </div>
    </div>
  )
}
