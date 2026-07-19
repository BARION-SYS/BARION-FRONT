"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts"

const revenueData = [
  { day: "Lun", ingresos: 420, citas: 12 },
  { day: "Mar", ingresos: 580, citas: 16 },
  { day: "Mié", ingresos: 390, citas: 10 },
  { day: "Jue", ingresos: 720, citas: 20 },
  { day: "Vie", ingresos: 890, citas: 24 },
  { day: "Sáb", ingresos: 1240, citas: 32 },
  { day: "Dom", ingresos: 760, citas: 18 },
]

const monthlyData = [
  { month: "Ene", ingresos: 12400, meta: 14000 },
  { month: "Feb", ingresos: 15200, meta: 14000 },
  { month: "Mar", ingresos: 13800, meta: 15000 },
  { month: "Abr", ingresos: 17600, meta: 16000 },
  { month: "May", ingresos: 16400, meta: 16000 },
  { month: "Jun", ingresos: 19200, meta: 18000 },
  { month: "Jul", ingresos: 21000, meta: 20000 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg p-3 text-xs shadow-xl">
        <p className="text-muted-foreground font-medium mb-2">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} style={{ color: entry.color }} className="font-semibold">
            {entry.name === "ingresos" ? `$${entry.value.toLocaleString()}` : `${entry.value} citas`}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function RevenueAreaChart() {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm font-semibold text-foreground">Ingresos esta semana</p>
          <p className="text-xs text-muted-foreground mt-0.5">14 — 20 Julio 2026</p>
        </div>
        <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
          {["Sem", "Mes", "Año"].map((t) => (
            <button
              key={t}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${t === "Sem" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={revenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#d4a843" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#d4a843" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="ingresos" stroke="#d4a843" strokeWidth={2} fill="url(#goldGradient)" dot={false} activeDot={{ r: 4, fill: "#d4a843" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function MonthlyBarChart() {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm font-semibold text-foreground">Ingresos vs Meta</p>
          <p className="text-xs text-muted-foreground mt-0.5">Comparativo mensual 2026</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={10} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="ingresos" fill="#d4a843" radius={[4, 4, 0, 0]} name="ingresos" />
          <Bar dataKey="meta" fill="#27272a" radius={[4, 4, 0, 0]} name="meta" />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-primary inline-block" /><span className="text-xs text-muted-foreground">Ingresos</span></div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-border inline-block" /><span className="text-xs text-muted-foreground">Meta</span></div>
      </div>
    </div>
  )
}
