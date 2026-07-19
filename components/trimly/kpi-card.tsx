import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface KpiCardProps {
  title: string
  value: string
  change?: string
  changeType?: "up" | "down" | "neutral"
  icon: LucideIcon
  accent?: boolean
  subtitle?: string
}

export function KpiCard({ title, value, change, changeType = "up", icon: Icon, accent, subtitle }: KpiCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl border p-5 flex flex-col gap-3 overflow-hidden transition-all hover:border-border/80",
        accent
          ? "bg-primary/10 border-primary/30"
          : "bg-card border-border"
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{title}</p>
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center",
          accent ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
        )}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div>
        <p className={cn("text-2xl font-bold tracking-tight", accent ? "text-primary" : "text-foreground")}>
          {value}
        </p>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>

      {change && (
        <div className={cn(
          "flex items-center gap-1 text-[11px] font-medium",
          changeType === "up" ? "text-emerald-400" : changeType === "down" ? "text-destructive" : "text-muted-foreground"
        )}>
          {changeType === "up" && <TrendingUp className="w-3 h-3" />}
          {changeType === "down" && <TrendingDown className="w-3 h-3" />}
          <span>{change}</span>
        </div>
      )}

      {/* subtle glow for accent card */}
      {accent && (
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute bottom-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-2xl" />
        </div>
      )}
    </div>
  )
}
