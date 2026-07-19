"use client"

import { useState } from "react"
import { Search, Plus, Filter, Star, Calendar, QrCode, Phone, Mail, ChevronRight, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

const clients = [
  { id: 1, name: "Carlos Mendoza", initials: "CM", phone: "+52 55 1111 2222", email: "carlos@mail.com", barber: "Miguel", visits: 24, lastVisit: "Hoy", spent: 2760, tag: "VIP", color: "#d4a843" },
  { id: 2, name: "Luis García", initials: "LG", phone: "+52 55 3333 4444", email: "luis@mail.com", barber: "Pedro", visits: 18, lastVisit: "Hace 3 días", spent: 1980, tag: "Frecuente", color: "#3b82f6" },
  { id: 3, name: "Andrés Torres", initials: "AT", phone: "+52 55 5555 6666", email: "andres@mail.com", barber: "Miguel", visits: 12, lastVisit: "Hace 1 semana", spent: 1440, tag: "Regular", color: "#22c55e" },
  { id: 4, name: "Roberto Silva", initials: "RS", phone: "+52 55 7777 8888", email: "roberto@mail.com", barber: "Juan", visits: 8, lastVisit: "Hace 2 semanas", spent: 920, tag: "Regular", color: "#22c55e" },
  { id: 5, name: "Diego Martínez", initials: "DM", phone: "+52 55 9999 0000", email: "diego@mail.com", barber: "Pedro", visits: 5, lastVisit: "Hace 3 semanas", spent: 550, tag: "Nuevo", color: "#f59e0b" },
  { id: 6, name: "Felipe Ruiz", initials: "FR", phone: "+52 55 2222 3333", email: "felipe@mail.com", barber: "Miguel", visits: 3, lastVisit: "Hace 1 mes", spent: 330, tag: "Nuevo", color: "#f59e0b" },
  { id: 7, name: "Samuel López", initials: "SL", phone: "+52 55 4444 5555", email: "samuel@mail.com", barber: "Juan", visits: 1, lastVisit: "Hoy", spent: 120, tag: "Nuevo", color: "#f59e0b" },
  { id: 8, name: "Mario Vega", initials: "MV", phone: "+52 55 6666 7777", email: "mario@mail.com", barber: "Pedro", visits: 31, lastVisit: "Ayer", spent: 3720, tag: "VIP", color: "#d4a843" },
]

const tagConfig: Record<string, string> = {
  VIP: "bg-primary/15 text-primary border-primary/30",
  Frecuente: "bg-blue-400/10 text-blue-400 border-blue-400/30",
  Regular: "bg-emerald-400/10 text-emerald-400 border-emerald-400/30",
  Nuevo: "bg-yellow-400/10 text-yellow-400 border-yellow-400/30",
}

const serviceHistory = [
  { date: "14 Jul", service: "Corte + Barba", barber: "Miguel", price: "$130" },
  { date: "30 Jun", service: "Fade + Diseño", barber: "Miguel", price: "$150" },
  { date: "16 Jun", service: "Corte Clásico", barber: "Miguel", price: "$110" },
  { date: "2 Jun", service: "Corte + Barba", barber: "Miguel", price: "$130" },
  { date: "19 May", service: "Barba Completa", barber: "Miguel", price: "$80" },
]

export default function ClientesPage() {
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState(clients[0])
  const [filter, setFilter] = useState("Todos")

  const tags = ["Todos", "VIP", "Frecuente", "Regular", "Nuevo"]
  const filtered = clients.filter(c =>
    (filter === "Todos" || c.tag === filter) &&
    (c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search))
  )

  return (
    <main className="flex-1 overflow-hidden flex gap-4 p-6">
      {/* Client list */}
      <div className="w-80 shrink-0 flex flex-col gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar cliente o teléfono..."
            className="w-full bg-card border border-border rounded-lg pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Tags filter */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {tags.map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className={cn("shrink-0 text-[11px] font-medium px-3 py-1 rounded-full border transition-all",
                filter === t ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"
              )}>
              {t}
            </button>
          ))}
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Total clientes", value: clients.length },
            { label: "Nuevos hoy", value: 2 },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-lg p-2.5 text-center">
              <p className="text-lg font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* List */}
        <div className="space-y-1.5 overflow-y-auto flex-1">
          {filtered.map(c => (
            <button key={c.id} onClick={() => setSelected(c)}
              className={cn("w-full text-left p-3 rounded-xl border transition-all",
                selected.id === c.id ? "border-primary/40 bg-primary/5" : "border-border bg-card hover:bg-secondary"
              )}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: `${c.color}20`, color: c.color }}>
                  {c.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-foreground truncate">{c.name}</p>
                    <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded-full border shrink-0", tagConfig[c.tag])}>
                      {c.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{c.visits} visitas · {c.lastVisit}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <button className="flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg py-2.5 text-xs font-semibold hover:bg-primary/90 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Nuevo cliente
        </button>
      </div>

      {/* Detail panel */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Profile card */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold"
                style={{ background: `${selected.color}20`, color: selected.color }}>
                {selected.initials}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-foreground">{selected.name}</h2>
                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", tagConfig[selected.tag])}>
                    {selected.tag}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">Barbero favorito: {selected.barber}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {selected.phone}</span>
                </div>
              </div>
            </div>
            <button className="flex items-center gap-2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors">
              <Calendar className="w-3.5 h-3.5" /> Agendar cita
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { label: "Total visitas", value: `${selected.visits}`, icon: Calendar, sub: `Última: ${selected.lastVisit}` },
              { label: "Total gastado", value: `$${selected.spent.toLocaleString()}`, icon: TrendingUp, sub: "Acumulado" },
              { label: "Ticket prom.", value: `$${Math.round(selected.spent / selected.visits)}`, icon: Star, sub: "Por visita" },
            ].map(s => (
              <div key={s.label} className="bg-secondary rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <s.icon className="w-4 h-4 text-primary" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{s.label}</p>
                </div>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Service history */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-foreground">Historial de servicios</p>
            <button className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">Ver todo <ChevronRight className="w-3 h-3" /></button>
          </div>
          <div className="space-y-2">
            {serviceHistory.map((h, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-foreground">{h.service}</p>
                  <p className="text-[11px] text-muted-foreground">{h.date} · {h.barber}</p>
                </div>
                <p className="text-sm font-bold text-primary">{h.price}</p>
              </div>
            ))}
          </div>
        </div>

        {/* QR section */}
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-sm font-semibold text-foreground mb-3">Acceso rápido</p>
          <div className="flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 bg-secondary border border-border rounded-lg py-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-border/80 transition-all">
              <QrCode className="w-4 h-4" /> Ver QR del cliente
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 bg-secondary border border-border rounded-lg py-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-border/80 transition-all">
              <Mail className="w-4 h-4" /> Enviar recordatorio
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
