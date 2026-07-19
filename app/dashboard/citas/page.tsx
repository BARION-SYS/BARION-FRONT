"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Plus, Search, Filter, Clock, CheckCircle2, XCircle, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

const HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"]
const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
const DATES = [14, 15, 16, 17, 18, 19, 20]
const TODAY_IDX = 0

interface Appointment {
  id: number
  client: string
  service: string
  barber: string
  day: number
  startHour: number
  duration: number // in hour slots
  status: "confirmed" | "in-progress" | "pending" | "cancelled" | "completed"
  color: string
}

const appointments: Appointment[] = [
  { id: 1, client: "Carlos M.", service: "Corte + Barba", barber: "Miguel", day: 0, startHour: 1, duration: 1, status: "completed", color: "#22c55e" },
  { id: 2, client: "Luis G.", service: "Corte Clásico", barber: "Pedro", day: 0, startHour: 1, duration: 1, status: "completed", color: "#22c55e" },
  { id: 3, client: "Andrés T.", service: "Fade + Diseño", barber: "Miguel", day: 0, startHour: 2, duration: 1, status: "in-progress", color: "#d4a843" },
  { id: 4, client: "Roberto S.", service: "Corte + Barba", barber: "Juan", day: 0, startHour: 3, duration: 1, status: "confirmed", color: "#3b82f6" },
  { id: 5, client: "Diego M.", service: "Corte Clásico", barber: "Pedro", day: 0, startHour: 3, duration: 1, status: "confirmed", color: "#3b82f6" },
  { id: 6, client: "Felipe R.", service: "Barba", barber: "Miguel", day: 1, startHour: 0, duration: 1, status: "pending", color: "#f59e0b" },
  { id: 7, client: "Samuel L.", service: "Fade Completo", barber: "Juan", day: 1, startHour: 2, duration: 2, status: "confirmed", color: "#3b82f6" },
  { id: 8, client: "Mario V.", service: "Corte + Diseño", barber: "Pedro", day: 2, startHour: 1, duration: 1, status: "confirmed", color: "#3b82f6" },
  { id: 9, client: "Eduardo C.", service: "Barba Completa", barber: "Miguel", day: 3, startHour: 0, duration: 1, status: "confirmed", color: "#3b82f6" },
  { id: 10, client: "Pablo N.", service: "Fade Skin", barber: "Juan", day: 4, startHour: 2, duration: 1, status: "pending", color: "#f59e0b" },
  { id: 11, client: "Oscar T.", service: "Corte Clásico", barber: "Pedro", day: 5, startHour: 1, duration: 1, status: "confirmed", color: "#3b82f6" },
  { id: 12, client: "Iván S.", service: "Corte + Barba", barber: "Miguel", day: 5, startHour: 2, duration: 1, status: "confirmed", color: "#3b82f6" },
]

const statusBadge = {
  completed: { label: "Completada", color: "text-emerald-400 bg-emerald-400/10" },
  "in-progress": { label: "En curso", color: "text-primary bg-primary/10" },
  confirmed: { label: "Confirmada", color: "text-blue-400 bg-blue-400/10" },
  pending: { label: "Pendiente", color: "text-yellow-400 bg-yellow-400/10" },
  cancelled: { label: "Cancelada", color: "text-destructive bg-destructive/10" },
}

export default function CitasPage() {
  const [view, setView] = useState<"week" | "day" | "list">("week")
  const [selectedDay, setSelectedDay] = useState(0)
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null)

  const dayAppointments = appointments.filter(a => a.day === selectedDay)

  return (
    <main className="flex-1 overflow-hidden flex flex-col p-6 gap-4">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-foreground">14 — 20 Julio 2026</span>
          <button className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button className="text-xs bg-secondary border border-border px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors">Hoy</button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input placeholder="Buscar cita..." className="bg-secondary border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-44" />
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-secondary rounded-lg p-1 border border-border">
            {(["week", "day", "list"] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={cn("px-2.5 py-1 rounded-md text-xs font-medium transition-all capitalize",
                  view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}>
                {v === "week" ? "Semana" : v === "day" ? "Día" : "Lista"}
              </button>
            ))}
          </div>

          <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors">
            <Plus className="w-3.5 h-3.5" /> Nueva cita
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex gap-4">
        {/* Calendar grid */}
        <div className="flex-1 bg-card border border-border rounded-xl overflow-auto">
          {/* Day headers */}
          <div className="grid sticky top-0 z-10 bg-card border-b border-border" style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}>
            <div className="p-3" />
            {DAYS.map((day, i) => (
              <button key={day} onClick={() => setSelectedDay(i)}
                className={cn("p-3 text-center border-l border-border transition-colors hover:bg-secondary",
                  selectedDay === i && "bg-secondary"
                )}>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{day}</p>
                <p className={cn("text-lg font-bold mt-0.5",
                  i === TODAY_IDX ? "text-primary" : "text-foreground"
                )}>
                  {DATES[i]}
                </p>
                {i === TODAY_IDX && <div className="w-1 h-1 bg-primary rounded-full mx-auto mt-0.5" />}
              </button>
            ))}
          </div>

          {/* Time slots */}
          {HOURS.map((hour, hi) => (
            <div key={hour} className="grid border-b border-border" style={{ gridTemplateColumns: "60px repeat(7, 1fr)", minHeight: "64px" }}>
              <div className="p-2 text-[10px] text-muted-foreground text-right pr-3 pt-3 sticky left-0 bg-card">{hour}</div>
              {DAYS.map((_, di) => {
                const apts = appointments.filter(a => a.day === di && a.startHour === hi)
                return (
                  <div key={di} className={cn("border-l border-border p-1 relative",
                    selectedDay === di && "bg-secondary/30",
                    "hover:bg-secondary/20 transition-colors cursor-pointer"
                  )}>
                    {apts.map(apt => (
                      <button key={apt.id} onClick={() => setSelectedApt(apt)}
                        className="w-full text-left rounded-md px-2 py-1 text-[10px] font-semibold mb-0.5 transition-all hover:opacity-80"
                        style={{ background: `${apt.color}20`, color: apt.color, borderLeft: `2px solid ${apt.color}` }}>
                        <p className="truncate">{apt.client}</p>
                        <p className="font-normal opacity-80 truncate">{apt.service}</p>
                      </button>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Day detail panel */}
        <div className="w-72 bg-card border border-border rounded-xl flex flex-col overflow-hidden shrink-0">
          <div className="p-4 border-b border-border">
            <p className="text-sm font-semibold text-foreground">
              {DAYS[selectedDay]} {DATES[selectedDay]} de Julio
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{dayAppointments.length} citas programadas</p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {dayAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <CalendarIcon />
                <p className="text-xs mt-2">Sin citas este día</p>
              </div>
            ) : (
              dayAppointments.map(apt => {
                const { label, color } = statusBadge[apt.status]
                return (
                  <button key={apt.id} onClick={() => setSelectedApt(apt)}
                    className={cn("w-full text-left p-3 rounded-lg border transition-all",
                      selectedApt?.id === apt.id ? "border-primary/50 bg-primary/5" : "border-border bg-secondary/50 hover:bg-secondary"
                    )}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-foreground">{apt.client}</p>
                      <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded-full", color)}>{label}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{apt.service}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" /> {HOURS[apt.startHour]}
                      </span>
                      <span className="text-[10px]" style={{ color: apt.color }}>{apt.barber}</span>
                    </div>
                  </button>
                )
              })
            )}
          </div>

          {/* Quick add */}
          <div className="p-3 border-t border-border">
            <button className="w-full flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary rounded-lg py-2.5 text-xs font-semibold transition-all">
              <Plus className="w-3.5 h-3.5" /> Agendar en este día
            </button>
          </div>
        </div>
      </div>

      {/* Appointment detail modal */}
      {selectedApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setSelectedApt(null)}>
          <div className="bg-card border border-border rounded-2xl p-6 w-80 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-foreground">Detalle de Cita</h3>
              <button onClick={() => setSelectedApt(null)} className="w-6 h-6 rounded-lg bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center text-xs transition-colors">✕</button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">
                  {selectedApt.client.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{selectedApt.client}</p>
                  <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", statusBadge[selectedApt.status].color)}>
                    {statusBadge[selectedApt.status].label}
                  </span>
                </div>
              </div>

              {[
                { label: "Servicio", value: selectedApt.service },
                { label: "Barbero", value: selectedApt.barber },
                { label: "Hora", value: HOURS[selectedApt.startHour] },
                { label: "Fecha", value: `${DAYS[selectedApt.day]} ${DATES[selectedApt.day]} Jul` },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="text-foreground font-medium">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-5">
              <button className="flex-1 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg py-2 text-xs font-semibold hover:bg-destructive/20 transition-all">
                Cancelar cita
              </button>
              <button className="flex-1 bg-primary text-primary-foreground rounded-lg py-2 text-xs font-semibold hover:bg-primary/90 transition-all">
                Reagendar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

function CalendarIcon() {
  return (
    <svg className="w-8 h-8 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}
