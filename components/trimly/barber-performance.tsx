"use client"

import { RadialBarChart, RadialBar, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts"
import { cn } from "@/lib/utils"

const barbers = [
  { name: "Miguel Ángel", role: "Senior", citas: 28, ingresos: 1840, comision: 552, rating: 4.9, pct: 94, color: "#d4a843", initials: "MA" },
  { name: "Pedro Gómez", role: "Barbero", citas: 22, ingresos: 1320, comision: 396, rating: 4.7, pct: 73, color: "#3b82f6", initials: "PG" },
  { name: "Juan Carlos", role: "Barbero", citas: 19, ingresos: 1140, comision: 342, rating: 4.6, pct: 62, color: "#22c55e", initials: "JC" },
]

const serviceData = [
  { name: "Corte Clásico", value: 35, color: "#d4a843" },
  { name: "Fade + Diseño", value: 28, color: "#3b82f6" },
  { name: "Corte + Barba", value: 22, color: "#22c55e" },
  { name: "Solo Barba", value: 15, color: "#f59e0b" },
]

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg p-2 text-xs shadow-xl">
        <p className="text-foreground font-semibold">{payload[0].name}</p>
        <p className="text-muted-foreground">{payload[0].value}%</p>
      </div>
    )
  }
  return null
}

export function BarberPerformance() {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-foreground">Rendimiento barberos</p>
        <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-1 rounded-md">Esta semana</span>
      </div>
      <div className="space-y-4">
        {barbers.map((b) => (
          <div key={b.name} className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
              style={{ background: `${b.color}20`, color: b.color }}
            >
              {b.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <p className="text-xs font-semibold text-foreground leading-none">{b.name}</p>
                  <p className="text-[10px] text-muted-foreground">{b.citas} citas · ★ {b.rating}</p>
                </div>
                <p className="text-xs font-bold" style={{ color: b.color }}>${b.ingresos.toLocaleString()}</p>
              </div>
              <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${b.pct}%`, background: b.color }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ServiceDistribution() {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-foreground">Servicios populares</p>
        <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-1 rounded-md">Este mes</span>
      </div>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width={100} height={100}>
          <PieChart>
            <Pie data={serviceData} cx="50%" cy="50%" innerRadius={30} outerRadius={45} paddingAngle={3} dataKey="value">
              {serviceData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-2">
          {serviceData.map((s) => (
            <div key={s.name} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
              <span className="text-[11px] text-muted-foreground flex-1 truncate">{s.name}</span>
              <span className="text-[11px] font-semibold text-foreground">{s.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
