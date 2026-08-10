import { Store } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { SectionCard } from "@shared/components/cards/SectionCard"

interface AparienciaProps {
  nombreBarberia: string
}

// Identidad del NEGOCIO: su logotipo y cómo luce el portal de reservas. La vista
// previa se pinta con los tokens del panel, que son preferencia de quien mira —
// por eso es orientativa: el color real del portal es el de la barbería y viaja
// con su ficha desde la api.
export function Apariencia({ nombreBarberia }: AparienciaProps) {
  return (
    <div className="space-y-4">
      <SectionCard titulo="Logotipo">
        <Button
          variant="ghost"
          className="h-auto w-full cursor-pointer flex-col gap-3 rounded-xl border-2 border-dashed border-border p-8 whitespace-normal transition-colors hover:border-primary/50 motion-reduce:transition-none"
        >
          <span
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10"
            aria-hidden
          >
            <Store className="size-6 text-primary" />
          </span>
          <span className="flex flex-col gap-1">
            <span className="text-sm font-medium text-foreground">Subir logotipo</span>
            <span className="text-xs font-normal text-muted-foreground">
              PNG, JPG hasta 2MB · Recomendado 200×200px
            </span>
          </span>
        </Button>
      </SectionCard>

      <SectionCard
        titulo="Vista previa del portal de clientes"
        subtitulo="Orientativa: se pinta con los colores de tu panel, no con los del portal real"
      >
        {/* Simulación decorativa del portal público — no interactiva */}
        <div aria-hidden className="rounded-xl border border-border bg-background p-4">
          <div className="mb-4 flex items-center gap-2">
            {/* La marca ya sobrescribe --primary: tokens puros, cero estilos inline */}
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Store className="size-4" />
            </span>
            <span>
              <span className="block text-xs font-bold text-foreground">{nombreBarberia}</span>
              <span className="block text-[10px] text-muted-foreground">Reserva tu cita</span>
            </span>
          </div>
          <span className="block w-full rounded-lg bg-primary py-2.5 text-center text-sm font-bold text-primary-foreground">
            Reservar ahora
          </span>
        </div>
      </SectionCard>
    </div>
  )
}
