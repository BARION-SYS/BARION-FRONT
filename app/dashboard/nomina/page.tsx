"use client"

import { useState } from "react"
import { DollarSign, TrendingUp, Scissors, Gift, Download, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const periods = ["Esta semana", "Este mes", "Este año"]

const barbers = [
  {
    id: 1, name: "Miguel Ángel Reyes", initials: "MA", color: "#d4a843",
    production: 1840, commission: 552, tips: 180, total: 732,
    pct: 30, citas: 28,
    daily: [
      { day: "Lun", prod: 180 },
      { day: "Mar", prod: 320 },
      { day: "Mié", prod: 240 },
      { day: "Jue", prod: 410 },
      { day: "Vie", prod: 290 },
      { day: "Sáb", prod: 400 },
    ]
  },
  {
    id: 2, name: "Pedro Gómez Sánchez", initials: "PG", color: "#3b82f6",
    production: 1320, commission: 396, tips: 110, total: 506,
    pct: 30, citas: 22,
    daily: [
      { day: "Lun", prod: 140 },
      { day: "Mar", prod: 220 },
      { day: "Mié", prod: 180 },
      { day: "Jue", prod: 290 },
      { day: "Vie", prod: 210 },
      { day: "Sáb", prod: 280 },
    ]
  },
  {
    id: 3, name: "Juan Carlos Vega", initials: "JC", color: "#22c55e",
    production: 1140, commission: 342, tips: 85, total: 427,
    pct: 30, citas: 19,
    daily: [
      { day: "Lun", prod: 120 },
      { day: "Mar", prod: 190 },
      { day: "Mié", prod: 160 },
      { day: "Jue", prod: 250 },
      { day: "Vie", prod: 180 },
      { day: "Sáb", prod: 240 },
    ]
  },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg p-2 text-xs shadow-xl">
        <p className="text-muted-foreground mb-1">{label}</p>
        <p className="text-primary font-bold">${payload[0].value}</p>
      </div>
    )
  }
  return null
}

export default function NominaPage() {
  const [period, setPeriod] = useState(0)
  const [selected, setSelected] = useState(barbers[0])

  const totalProd = barbers.reduce((a, b) => a + b.production, 0)
  const totalComm = barbers.reduce((a, b) => a + b.commission, 0)
  const totalTips = barbers.reduce((a, b) => a + b.tips, 0)

  return (
    <main className="flex-1 overflow-y-auto p-6 space-y-5">
      {/* Period selector + export */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
          {periods.map((p, i) => (
            <button key={p} onClick={() => setPeriod(i)}
              className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                period === i ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}>
              {p}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-2 bg-secondary border border-border rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
          <Download className="w-3.5 h-3.5" /> Exportar
        </button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Producción total", value: `$${totalProd.toLocaleString()}`, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
          { label: "Comisiones totales", value: `$${totalComm.toLocaleString()}`, icon: DollarSign, color: "text-blue-400", bg: "bg-blue-400/10" },
          { label: "Propinas totales", value: `$${totalTips}`, icon: Gift, color: "text-emerald-400", bg: "bg-emerald-400/10" },
          { label: "Total a pagar", value: `$${(totalComm + totalTips).toLocaleString()}`, icon: Scissors, color: "text-yellow-400", bg: "bg-yellow-400/10" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3", s.bg)}>
              <s.icon className={cn("w-4 h-4", s.color)} />
            </div>
            <p className="text-xl font-bold text-foreground">{s.value}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Barber list */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Equipo</p>
          {barbers.map(b => (
            <button key={b.id} onClick={() => setSelected(b)}
              className={cn("w-full text-left p-4 bg-card border rounded-xl transition-all",
                selected.id === b.id ? "border-primary/40 bg-primary/5" : "border-border hover:border-border/80"
              )}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: `${b.color}20`, color: b.color }}>
                  {b.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{b.name}</p>
                  <p className="text-[11px] text-muted-foreground">{b.citas} citas · {b.pct}% comisión</p>
                </div>
                <p className="text-sm font-bold" style={{ color: b.color }}>${b.total}</p>
              </div>
              <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(b.production / totalProd) * 100}%`, background: b.color }} />
              </div>
              <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground">
                <span>Prod: ${b.production.toLocaleString()}</span>
                <span>{((b.production / totalProd) * 100).toFixed(0)}% del total</span>
              </div>
            </button>
          ))}
        </div>

        {/* Detail chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
              style={{ background: `${selected.color}20`, color: selected.color }}>
              {selected.initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{selected.name}</p>
              <p className="text-xs text-muted-foreground">Producción diaria — {periods[period]}</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={selected.daily} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="prod" fill={selected.color} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          {/* Breakdown */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-border">
            {[
              { label: "Producción", value: `$${selected.production.toLocaleString()}`, sub: "100% ventas" },
              { label: "Comisión (30%)", value: `$${selected.commission}`, sub: "A pagar" },
              { label: "Propinas", value: `$${selected.tips}`, sub: "Acumuladas" },
            ].map(s => (
              <div key={s.label} className="bg-secondary rounded-xl p-4 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{s.label}</p>
                <p className="text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4 p-4 bg-primary/10 border border-primary/20 rounded-xl">
            <div>
              <p className="text-xs text-muted-foreground">Total a pagar a {selected.name.split(" ")[0]}</p>
              <p className="text-2xl font-bold text-primary mt-0.5">${selected.total}</p>
            </div>
            <button className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-primary/90 transition-colors">
              Marcar como pagado
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
