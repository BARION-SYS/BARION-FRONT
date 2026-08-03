"use client"

import { useRef } from "react"
import { AnimatePresence, motion } from "motion/react"
import type { Dialog as SheetPrimitive } from "@base-ui/react/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@shared/components/ui/sheet"
import { cn } from "@shared/utils/cn"

/**
 * Ancho en pantallas cómodas. En móvil NO aplica ninguno: el panel ocupa el
 * ancho entero, porque a 375 px un panel «estrecho» no deja leer nada.
 */
const anchoPorSize = {
  sm: "sm:max-w-md",
  md: "sm:max-w-xl",
  lg: "sm:max-w-3xl",
}

// Lenguaje de movimiento del repo: entrada con resorte suave, salida más corta.
const entrada = { type: "spring", stiffness: 140, damping: 22 } as const
const salida = { duration: 0.22, ease: [0.32, 0.72, 0, 1] } as const

interface SidePanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  titulo: string
  descripcion?: string
  footer?: React.ReactNode
  size?: keyof typeof anchoPorSize
  className?: string
  children: React.ReactNode
}

/**
 * Hermano del `Modal`, y con su misma filosofía: **shell presentacional puro**
 * sobre el `Dialog` de Base UI —el mismo primitivo, por la vía de `ui/sheet`—.
 * No sabe nada de lo que ocurre adentro: sin estado, sin lógica, sin hooks ni
 * services. El padre arma el contenido, arma el pie y controla el cierre.
 *
 * Lo que aporta frente al `Modal` es la forma: entra desde el borde derecho y
 * ocupa el alto completo, así que un formulario largo se lee de corrido en vez
 * de apretarse en un cuadro centrado. **Encabezado y pie quedan fijos y solo
 * scrollea el cuerpo**: el botón de envío nunca se va fuera de alcance.
 *
 * La animación la lleva `motion` bajo el `MotionConfig reducedMotion="user"`
 * del layout —el portal cambia de sitio en el DOM, no en el árbol de React, así
 * que el contexto sigue llegando y no hay que anidar otro—. Para que la salida
 * se vea hay dos piezas: `preventUnmountOnClose()` le pide a Base UI que no
 * desmonte al cerrar, y `unmount()` se llama cuando `AnimatePresence` termina.
 */
export function SidePanel({
  open,
  onOpenChange,
  titulo,
  descripcion,
  footer,
  size = "md",
  className,
  children,
}: SidePanelProps) {
  const acciones = useRef<SheetPrimitive.Root.Actions | null>(null)

  return (
    <Sheet
      open={open}
      onOpenChange={(abierto, detalles) => {
        if (!abierto) detalles.preventUnmountOnClose()
        onOpenChange(abierto)
      }}
      actionsRef={acciones}
    >
      <AnimatePresence onExitComplete={() => acciones.current?.unmount()}>
        {open && (
          <SheetContent
            key="side-panel"
            side="right"
            className={cn("gap-0 p-0", anchoPorSize[size], className)}
            render={
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0, transition: entrada }}
                exit={{ x: "100%", transition: salida }}
              />
            }
          >
            <SheetHeader className="shrink-0 gap-1 border-b border-border px-5 py-4 pr-14 sm:px-6 sm:pr-16">
              <SheetTitle>{titulo}</SheetTitle>
              {descripcion && <SheetDescription>{descripcion}</SheetDescription>}
            </SheetHeader>

            {/* Lo único que scrollea. `min-h-0` es lo que deja encoger al flex. */}
            <div className="scroll-fino min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-6">
              {children}
            </div>

            {footer && (
              <SheetFooter className="shrink-0 flex-col-reverse gap-2 border-t border-border bg-muted/50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                {footer}
              </SheetFooter>
            )}
          </SheetContent>
        )}
      </AnimatePresence>
    </Sheet>
  )
}
