"use client"

import { TrendingUp, Users, CalendarCheck, DollarSign, Scissors } from "lucide-react"
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts"

const monthlyRevenue = [
  { month: "Ene", ingresos: 12400, clientes: 84 },
  { month: "Feb", ingresos: 15200, clientes: 102 },
  { month: "Mar", ingresos: 13800, clientes: 94 },
  { month: "Abr", ingresos: 17600, clientes: 118 },
  { month: "May", ingresos: 16400, clientes: 112 },
  { month: "Jun", ingresos: 19200, clientes: 130 },
  { month: "Jul", ingresos: 21000, clientes: 142 },
]

const cancelationData = [
  { month: "Ene", canceladas: 8, completadas: 76 },
  { month: "Feb", canceladas: 6, completadas: 96 },
  { month: "Mar", canceladas: 10, completadas: 84 },
  { month: "Abr", canceladas: 5, completadas: 113 },
  { month: "May", canceladas: 7, completadas: 105 },
  { month: "Jun", canceladas: 4, completadas: 126 },
  { month: "Jul", canceladas: 3, completadas: 139 },
]

const topServices = [
  { name: "Corte Clásico", value: 35, color: "#d4a843" },
  { name: "Fade + Diseño", value: 28, color: "#3b82f6" },
  { name: "Corte + Barba", value: 22, color: "#22c55e" },
  { name: "Solo Barba", value: 15, color: "#f59e0b" },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg p-3 text-xs shadow-xl">
        <p className="text-muted-foreground font-medium mb-1.5">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="font-semibold">
            {p.name === "ingresos" ? `$${p.value.toLocaleString()}` : `${p.value}`}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function EstadisticasPage() {
  return (
    <main className="flex-1 overflow-y-auto p-6 space-y-5">
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Ingresos totales", value: "$115,600", change: "+34%", icon: DollarSign, color: "text-primary" },
          { label: "Clientes únicos", value: "782", change: "+18%", icon: Users, color: "text-blue-400" },
          { label: "Citas completadas", value: "738", change: "+22%", icon: CalendarCheck, color: "text-emerald-400" },
          { label: "Ticket promedio", value: "$156", change: "+8%", icon: TrendingUp, color: "text-yellow-400" },
          { label: "Tasa de retorno", value: "68%", change: "+5%", icon: Scissors, color: "text-purple-400" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{s.label}</p>
              <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
            </div>
            <p className="text-xl font-bold text-foreground">{s.value}</p>
            <p className="text-[11px] text-emerald-400 font-medium mt-1">{s.change} vs año ant.</p>
          </div>
        ))}
      </div>

      {/* Main charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Evolución de ingresos</p>
              <p className="text-xs text-muted-foreground mt-0.5">Enero — Julio 2026</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyRevenue}>
              <defs>
                <linearGradient id="grad-rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4a843" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#d4a843" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="grad-cli" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="ingresos" stroke="#d4a843" strokeWidth={2} fill="url(#grad-rev)" dot={false} name="ingresos" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Service donut */}
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-sm font-semibold text-foreground mb-4">Distribución de servicios</p>
          <div className="flex justify-center">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={topServices} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                  {topServices.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {topServices.map(s => (
              <div key={s.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                <span className="text-xs text-muted-foreground flex-1">{s.name}</span>
                <span className="text-xs font-bold text-foreground">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Completed vs Cancelled */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="mb-4">
            <p className="text-sm font-semibold text-foreground">Citas completadas vs canceladas</p>
            <p className="text-xs text-muted-foreground mt-0.5">Enero — Julio 2026</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={cancelationData} barSize={12} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="completadas" fill="#22c55e" radius={[4, 4, 0, 0]} name="completadas" />
              <Bar dataKey="canceladas" fill="#ef4444" radius={[4, 4, 0, 0]} name="canceladas" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /><span className="text-xs text-muted-foreground">Completadas</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-destructive inline-block" /><span className="text-xs text-muted-foreground">Canceladas</span></div>
          </div>
        </div>

        {/* Client growth */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="mb-4">
            <p className="text-sm font-semibold text-foreground">Crecimiento de clientes</p>
            <p className="text-xs text-muted-foreground mt-0.5">Nuevos registros mensuales</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="clientes" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 3 }} name="clientes" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </main>
  )
}
