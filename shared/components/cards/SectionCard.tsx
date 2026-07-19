import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@shared/components/ui/card"
import { cn } from "@shared/utils/cn"

interface SectionCardProps {
  titulo: string
  subtitulo?: string
  accion?: React.ReactNode
  className?: string
  children: React.ReactNode
}

// Tarjeta estándar del panel con encabezado consistente, sobre Card de shadcn.
export function SectionCard({ titulo, subtitulo, accion, className, children }: SectionCardProps) {
  return (
    <Card className={cn("gap-4 py-5", className)}>
      <CardHeader className="px-5">
        <CardTitle className="text-sm font-semibold">{titulo}</CardTitle>
        {subtitulo && <CardDescription className="text-xs">{subtitulo}</CardDescription>}
        {accion && <CardAction>{accion}</CardAction>}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col px-5">{children}</CardContent>
    </Card>
  )
}
