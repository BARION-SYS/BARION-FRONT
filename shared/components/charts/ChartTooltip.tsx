"use client"

// active/payload/label los inyecta recharts — nombres fijos de su API.
interface EntradaTooltip {
  name?: string
  value?: number | string
  color?: string
}

interface ChartTooltipProps {
  active?: boolean
  payload?: EntradaTooltip[]
  label?: string
  formatear?: (entrada: EntradaTooltip) => string
}

// Uso: <Tooltip content={<ChartTooltip formatear={…} />} />
export function ChartTooltip({ active, payload, label, formatear }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-lg border border-border bg-popover p-3 text-xs shadow-xl">
      {label && <p className="mb-2 font-medium text-muted-foreground">{label}</p>}
      {payload.map((entrada, i) => (
        <p
          key={i}
          className="font-semibold text-(--tono)"
          style={{ "--tono": entrada.color } as React.CSSProperties}
        >
          {formatear ? formatear(entrada) : `${entrada.name}: ${entrada.value}`}
        </p>
      ))}
    </div>
  )
}
