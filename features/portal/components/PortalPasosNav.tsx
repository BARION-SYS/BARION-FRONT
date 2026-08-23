"use client"

import { Check } from "lucide-react"
import { cn } from "@shared/utils/cn"
import type { PasoReserva } from "@features/portal/types/portal.types"
import { useTextos } from "@shared/textos/useTextos"

/**
 * Los cuatro pasos que el cliente VE.
 *
 * Se tipan como esas cuatro claves y no como `PasoReserva` entero: la unión del
 * dominio incluye `codigo` y `listo`, que no son etapas de la barra —`codigo` es
 * la misma etapa que `datos` a ojos de quien reserva, y `listo` ya no es un
 * paso—. Acotarlo aquí es lo que hace que el catálogo solo tenga que nombrar
 * cuatro, y que añadir un quinto no compile hasta tener su texto.
 */
type PasoConEtiqueta = Extract<PasoReserva, "barbero" | "servicio" | "agenda" | "datos">

interface PasoVisible {
  paso: PasoConEtiqueta
}

// Los pasos "datos" y "codigo" son una sola etapa a ojos del cliente: confirmar.
const pasos: PasoVisible[] = [
  // Solo las claves y su orden; el texto sale del catálogo dentro del componente.
  { paso: "barbero" },
  { paso: "servicio" },
  { paso: "agenda" },
  { paso: "datos" },
]

const orden: PasoReserva[] = ["barbero", "servicio", "agenda", "datos", "codigo", "listo"]

interface PortalPasosNavProps {
  pasoActual: PasoReserva
  onIrAPaso: (paso: PasoReserva) => void
}

// Progreso del flujo de reserva: siempre visible, permite volver a un paso ya completado.
export function PortalPasosNav({ pasoActual, onIrAPaso }: PortalPasosNavProps) {
  const t = useTextos("portal.pasos")
  const indiceActual = orden.indexOf(pasoActual)

  return (
    <nav aria-label={t("progreso")}>
      <ol className="flex items-center gap-1.5">
        {pasos.map(({ paso }, indice) => {
          const indicePaso = orden.indexOf(paso)
          const completado = indiceActual > indicePaso
          const activo =
            indicePaso === indiceActual || (paso === "datos" && pasoActual === "codigo")

          return (
            <li key={paso} className="flex min-w-0 flex-1 items-center gap-1.5">
              <button
                type="button"
                disabled={!completado}
                onClick={() => onIrAPaso(paso)}
                aria-current={activo ? "step" : undefined}
                className={cn(
                  "flex min-h-11 w-full min-w-0 flex-col items-start justify-center gap-1.5 rounded-lg px-1 text-left transition-colors motion-reduce:transition-none",
                  "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                  completado && "cursor-pointer"
                )}
              >
                <span
                  className={cn(
                    "h-1 w-full rounded-full transition-colors motion-reduce:transition-none",
                    activo || completado ? "bg-primary" : "bg-secondary"
                  )}
                  aria-hidden
                />
                <span
                  className={cn(
                    "flex items-center gap-1 truncate text-[11px] font-medium",
                    activo
                      ? "text-foreground"
                      : completado
                        ? "text-primary"
                        : "text-muted-foreground"
                  )}
                >
                  {completado && <Check className="h-3 w-3 shrink-0" aria-hidden />}
                  <span className="truncate">
                    {indice + 1}. {t(paso)}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
