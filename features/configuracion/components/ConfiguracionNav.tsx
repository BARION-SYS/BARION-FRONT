"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { rutaDeSeccion, seccionDesdePathname } from "@features/configuracion/utils/secciones"
import { cn } from "@shared/utils/cn"
import type { SeccionConfiguracion } from "@features/configuracion/types/configuracion.types"

interface Props {
  secciones: SeccionConfiguracion[]
}

/**
 * El menú de apartados. Cada entrada es un ENLACE a su ruta, no un botón que
 * cambia un estado: así se puede compartir la dirección de un apartado, el botón
 * de atrás funciona y abrir uno no descarga el código de los otros.
 *
 * Cuál está activo sale de la dirección y no de una prop: el estado lo tiene ya
 * el enrutador, y pasarlo además por props obligaría a que alguien los mantuviera
 * de acuerdo. Sigue siendo presentacional — no pide datos ni muta nada.
 */
export function ConfiguracionNav({ secciones }: Props) {
  const pathname = usePathname()
  const activa = seccionDesdePathname(pathname)

  return (
    <nav aria-label="Secciones de configuración" className="w-full shrink-0 md:w-56">
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {secciones.map((seccion) => {
          const esActiva = seccion.id === activa
          return (
            <Button
              key={seccion.id}
              variant="ghost"
              render={<Link href={rutaDeSeccion(seccion.id)} />}
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
