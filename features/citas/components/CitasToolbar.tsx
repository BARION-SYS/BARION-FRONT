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
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon-lg"
          className="cursor-pointer"
          aria-label="Semana anterior"
        >
          <ChevronLeft aria-hidden />
        </Button>
        <span className="text-sm font-semibold text-foreground tabular-nums">{rotulo}</span>
        <Button
          variant="outline"
          size="icon-lg"
          className="cursor-pointer"
          aria-label="Semana siguiente"
        >
          <ChevronRight aria-hidden />
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="cursor-pointer text-xs text-muted-foreground"
        >
          Hoy
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search
            className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Buscar cita..."
            aria-label="Buscar cita"
            className="h-9 w-44 pl-8 text-xs"
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
