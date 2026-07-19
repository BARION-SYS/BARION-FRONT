"use client"

import { useState } from "react"
import { Plus, Star, Scissors, DollarSign, Calendar, Clock, ChevronRight, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts"

const barbers = [
  {
    id: 1,
    name: "Miguel Ángel Reyes",
    role: "Barbero Senior",
    initials: "MA",
    color: "#d4a843",
    rating: 4.9,
    reviews: 142,
    status: "active",
    schedule: "Lun – Sáb · 09:00 – 19:00",
    services: ["Corte Clásico", "Fade + Diseño", "Corte + Barba", "Barba Completa"],
    stats: { citas: 28, ingresos: 1840, comision: 552, pct: 30 },
    weekly: [18, 22, 19, 28, 25, 30, 28],
    phone: "+52 55 1234 5678",
    email: "miguel@trimly.mx",
  },
  {
    id: 2,
    name: "Pedro Gómez Sánchez",
    role: "Barbero",
    initials: "PG",
    color: "#3b82f6",
    rating: 4.7,
    reviews: 98,
    status: "active",
    schedule: "Mar – Dom · 10:00 – 20:00",
    services: ["Corte Clásico", "Corte + Barba", "Fade Skin"],
    stats: { citas: 22, ingresos: 1320, comision: 396, pct: 30 },
    weekly: [14, 18, 15, 22, 20, 25, 22],
    phone: "+52 55 8765 4321",
    email: "pedro@trimly.mx",
  },
  {
    id: 3,
    name: "Juan Carlos Vega",
    role: "Barbero",
    initials: "JC",
    color: "#22c55e",
    rating: 4.6,
    reviews: 76,
    status: "vacation",
    schedule: "Lun – Vie · 08:00 – 17:00",
    services: ["Corte Clásico", "Barba", "Fade Completo"],
    stats: { citas: 19, ingresos: 1140, comision: 342, pct: 30 },
    weekly: [12, 15, 13, 19, 17, 20, 19],
    phone: "+52 55 5555 0000",
    email: "juan@trimly.mx",
  },
]

const weekDays = ["L", "M", "X", "J", "V", "S", "D"]

export default function BarberosPage() {
  const [selected, setSelected] = useState(barbers[0])

  return (
    <main className="flex-1 overflow-hidden flex gap-4 p-6">
      {/* Left: Barber list */}
      <div className="w-80 shrink-0 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Equipo ({barbers.length})</h2>
          <button className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Agregar
          </button>
        </div>

        {barbers.map(b => (
          <button key={b.id} onClick={() => setSelected(b)}
            className={cn("w-full text-left p-4 rounded-xl border transition-all",
              selected.id === b.id
                ? "border-primary/40 bg-primary/5"
                : "border-border bg-card hover:border-border/80 hover:bg-card/80"
            )}>
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm"
                  style={{ background: `${b.color}25`, color: b.color }}>
                  {b.initials}
                </div>
                <div className={cn("absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card",
                  b.status === "active" ? "bg-emerald-400" : "bg-yellow-400"
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{b.name}</p>
                <p className="text-xs text-muted-foreground">{b.role}</p>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-primary font-semibold">
                <Star className="w-3 h-3 fill-primary" /> {b.rating}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-secondary rounded-lg p-2">
                <p className="text-base font-bold text-foreground">{b.stats.citas}</p>
                <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Citas</p>
              </div>
              <div className="bg-secondary rounded-lg p-2">
                <p className="text-base font-bold text-foreground">${(b.stats.ingresos / 1000).toFixed(1)}k</p>
                <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Ingresos</p>
              </div>
              <div className="bg-secondary rounded-lg p-2">
                <p className="text-base font-bold" style={{ color: b.color }}>${b.stats.comision}</p>
                <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Comisión</p>
              </div>
            </div>

            {/* Mini sparkline */}
            <div className="mt-3 h-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={b.weekly.map((v, i) => ({ v, i }))}>
                  <defs>
                    <linearGradient id={`grad-${b.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={b.color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={b.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke={b.color} strokeWidth={1.5} fill={`url(#grad-${b.id})`} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </button>
        ))}
      </div>

      {/* Right: Detail panel */}
      <div className="flex-1 overflow-y-auto space-y-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold"
                style={{ background: `${selected.color}20`, color: selected.color }}>
                {selected.initials}
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">{selected.name}</h2>
                <p className="text-sm text-muted-foreground">{selected.role}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className={cn("flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full",
                    selected.status === "active" ? "bg-emerald-400/10 text-emerald-400" : "bg-yellow-400/10 text-yellow-400"
                  )}>
                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                    {selected.status === "active" ? "Activo" : "Vacaciones"}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-primary font-semibold">
                    <Star className="w-3 h-3 fill-primary" /> {selected.rating} ({selected.reviews} reseñas)
                  </div>
                </div>
              </div>
            </div>
            <button className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Citas esta semana", value: `${selected.stats.citas}`, icon: Calendar, color: "text-blue-400" },
              { label: "Ingresos semana", value: `$${selected.stats.ingresos.toLocaleString()}`, icon: DollarSign, color: "text-primary" },
              { label: "Comisión (30%)", value: `$${selected.stats.comision}`, icon: Scissors, color: "text-emerald-400" },
              { label: "Horario", value: "11h/día", icon: Clock, color: "text-muted-foreground" },
            ].map(s => (
              <div key={s.label} className="bg-secondary rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <s.icon className={cn("w-4 h-4", s.color)} />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{s.label}</p>
                </div>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-sm font-semibold text-foreground mb-4">Horario semanal</p>
          <p className="text-xs text-muted-foreground mb-4">{selected.schedule}</p>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, i) => {
              const hasWork = selected.schedule.includes("Lun") ? i < 6 : i >= 2
              return (
                <div key={day} className={cn("rounded-lg p-3 text-center border",
                  hasWork ? "border-primary/30 bg-primary/5" : "border-border bg-secondary"
                )}>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{day}</p>
                  <p className={cn("text-xs font-bold", hasWork ? "text-primary" : "text-muted-foreground")}>
                    {hasWork ? "✓" : "—"}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Services */}
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-sm font-semibold text-foreground mb-3">Servicios que realiza</p>
          <div className="flex flex-wrap gap-2">
            {selected.services.map(s => (
              <span key={s} className="px-3 py-1.5 bg-secondary border border-border text-xs font-medium text-muted-foreground rounded-lg">
                {s}
              </span>
            ))}
            <button className="px-3 py-1.5 border border-dashed border-border text-xs font-medium text-muted-foreground rounded-lg hover:border-primary/50 hover:text-primary transition-colors">
              + Agregar
            </button>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-sm font-semibold text-foreground mb-3">Información de contacto</p>
          <div className="space-y-2">
            {[
              { label: "Teléfono", value: selected.phone },
              { label: "Correo", value: selected.email },
            ].map(c => (
              <div key={c.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-xs text-muted-foreground">{c.label}</span>
                <span className="text-xs font-medium text-foreground">{c.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
