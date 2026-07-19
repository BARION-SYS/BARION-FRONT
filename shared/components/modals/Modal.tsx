"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shared/components/ui/dialog"
import { cn } from "@shared/utils/cn"

const anchoPorSize = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
}

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  titulo: string
  descripcion?: string
  footer?: React.ReactNode
  size?: keyof typeof anchoPorSize
  className?: string
  children: React.ReactNode
}

// Shell presentacional puro sobre Dialog — NO sabe nada de lo que pasa adentro:
// sin estado, sin lógica, sin hooks de datos. El contenido y el footer llegan del padre.
export function Modal({
  open,
  onOpenChange,
  titulo,
  descripcion,
  footer,
  size = "md",
  className,
  children,
}: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(anchoPorSize[size], className)}>
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          {descripcion && <DialogDescription>{descripcion}</DialogDescription>}
        </DialogHeader>
        {children}
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  )
}
