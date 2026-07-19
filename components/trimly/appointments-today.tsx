"use client"

import { Clock, CheckCircle2, XCircle, Circle, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const appointments = [
  { id: 1, client: "Carlos Mendoza", barber: "Miguel", service: "Corte + Barba", time: "09:00", duration: 45, status: "completed", avatar: "CM" },
  { id: 2, client: "Luis García", barber: "Pedro", service: "Corte Clásico", time: "09:30", duration: 30, status: "completed", avatar: "LG" },
  { id: 3, client: "Andrés Torres", barber: "Miguel", service: "Fade + Diseño", time: "10:15", duration: 50, status: "in-progress", avatar: "AT" },
  { id: 4, client: "Roberto Silva", barber: "Juan", service: "Corte + Barba", time: "11:00", duration: 45, status: "confirmed", avatar: "RS" },
  { id: 5, client: "Diego Martínez", barber: "Pedro", service: "Corte Clásico", time: "11:30", duration: 30, status: "confirmed", avatar: "DM" },
  { id: 6, client: "Felipe Ruiz", barber: "Miguel", service: "Barba", time: "12:00", duration: 25, status: "pending", avatar: "FR" },
  { id: 7, client: "Samuel López", barber: "Juan", service: "Fade Completo", time: "14:00", duration: 60, status: "cancelled", avatar: "SL" },
]

const statusConfig = {
  completed: { label: "Completada", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  "in-progress": { label: "En curso", icon: Clock, color: "text-primary", bg: "bg-primary/10" },
  confirmed: { label: "Confirmada", icon: Circle, color: "text-blue-400", bg: "bg-blue-400/10" },
  pending: { label: "Pendiente", icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10" },
  cancelled: { label: "Cancelada", icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
}

const avatarColors = [
  "bg-primary/20 text-primary",
  "bg-blue-500/20 text-blue-400",
  "bg-emerald-500/20 text-emerald-400",
  "bg-purple-500/20 text-purple-400",
]

export function AppointmentsToday() {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Citas de hoy</p>
          <p className="text-xs text-muted-foreground mt-0.5">Lunes, 14 Julio 2026</p>
        </div>
        <button className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
          Ver todas <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[320px] pr-1">
        {appointments.map((apt, i) => {
          const { label, icon: StatusIcon, color, bg } = statusConfig[apt.status as keyof typeof statusConfig]
          return (
            <div
              key={apt.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-all hover:border-border/80 cursor-pointer",
                apt.status === "in-progress" ? "border-primary/30 bg-primary/5" : "border-transparent bg-secondary/50 hover:bg-secondary"
              )}
            >
              {/* Avatar */}
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0", avatarColors[i % avatarColors.length])}>
                {apt.avatar}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{apt.client}</p>
                <p className="text-[11px] text-muted-foreground truncate">{apt.service} · {apt.barber}</p>
              </div>

              {/* Time */}
              <div className="text-right shrink-0">
                <p className="text-xs font-semibold text-foreground">{apt.time}</p>
                <p className="text-[11px] text-muted-foreground">{apt.duration} min</p>
              </div>

              {/* Status */}
              <div className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full shrink-0", bg)}>
                <StatusIcon className={cn("w-3 h-3", color)} />
                <span className={cn("text-[10px] font-medium hidden sm:inline", color)}>{label}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary row */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border text-xs">
        <div className="text-muted-foreground">
          <span className="text-foreground font-semibold">7</span> citas totales
        </div>
        <div className="flex items-center gap-3">
          <span className="text-emerald-400"><span className="font-semibold">2</span> completas</span>
          <span className="text-primary"><span className="font-semibold">1</span> en curso</span>
          <span className="text-destructive"><span className="font-semibold">1</span> cancelada</span>
        </div>
      </div>
    </div>
  )
}
