import { Avatar, AvatarFallback } from "@shared/components/ui/avatar"
import { cn } from "@shared/utils/cn"

interface InitialsAvatarProps {
  iniciales: string
  /** Cualquier color CSS, normalmente un token: `var(--chart-2)` */
  color?: string
  tamano?: "sm" | "md" | "lg"
  className?: string
}

const clasesPorTamano = {
  sm: "size-8 text-[11px]",
  md: "size-10 text-xs",
  lg: "size-12 text-sm",
}

export function InitialsAvatar({
  iniciales,
  color = "var(--primary)",
  tamano = "sm",
  className,
}: InitialsAvatarProps) {
  // Color dinámico vía variable CSS — el estilo lo hacen las clases, no style directo.
  return (
    <Avatar
      className={cn(clasesPorTamano[tamano], className)}
      style={{ "--tono": color } as React.CSSProperties}
      aria-hidden
    >
      <AvatarFallback className="bg-[color-mix(in_srgb,var(--tono)_15%,transparent)] font-bold text-(--tono)">
        {iniciales}
      </AvatarFallback>
    </Avatar>
  )
}
