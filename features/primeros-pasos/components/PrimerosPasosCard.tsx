import Link from "next/link"
import { Check, ChevronRight } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { cn } from "@shared/utils/cn"
import type { PasoInicial } from "@features/primeros-pasos/types/primeros-pasos.types"
import { useTextos } from "@shared/textos/useTextos"

interface PrimerosPasosCardProps {
  paso: PasoInicial
  hecho: boolean
}

/**
 * Un paso de la lista. Presentacional puro: quién puede verlo y si está hecho lo
 * decide el padre.
 *
 * El enlace es `next/link` porque no sale de la aplicación: las tres pantallas
 * que resuelven estos pasos son del mismo panel.
 */
export function PrimerosPasosCard({ paso, hecho }: PrimerosPasosCardProps) {
  const t = useTextos("primerosPasos")
  const Icono = hecho ? Check : paso.icono

  return (
    <div
      className={cn(
        "flex h-full items-start gap-3 rounded-lg border p-3 transition-colors",
        hecho ? "border-transparent bg-secondary/40" : "border-border bg-card hover:bg-secondary/30"
      )}
    >
      <span
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-full",
          hecho ? "bg-(--exito)/10 text-(--exito)" : "bg-primary/10 text-primary"
        )}
      >
        <Icono className="size-4" aria-hidden />
      </span>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm font-semibold",
            hecho ? "text-muted-foreground line-through" : "text-foreground"
          )}
        >
          {paso.titulo}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{paso.descripcion}</p>
      </div>

      {hecho ? (
        <span className="sr-only">{t("hecho")}</span>
      ) : (
        <Button variant="outline" render={<Link href={paso.href} />}>
          {paso.accion}
          <ChevronRight aria-hidden />
        </Button>
      )}
    </div>
  )
}
