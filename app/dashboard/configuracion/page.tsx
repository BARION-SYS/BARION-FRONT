"use client"

import { useState } from "react"
import { Store, Palette, Clock, Bell, DollarSign, Shield, ChevronRight, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const sections = [
  { id: "general", label: "General", icon: Store },
  { id: "apariencia", label: "Apariencia", icon: Palette },
  { id: "horarios", label: "Horarios", icon: Clock },
  { id: "notificaciones", label: "Notificaciones", icon: Bell },
  { id: "precios", label: "Precios y servicios", icon: DollarSign },
  { id: "seguridad", label: "Seguridad", icon: Shield },
]

const services = [
  { id: 1, name: "Corte Clásico", price: 110, duration: 30 },
  { id: 2, name: "Fade + Diseño", price: 150, duration: 50 },
  { id: 3, name: "Corte + Barba", price: 130, duration: 45 },
  { id: 4, name: "Barba Completa", price: 80, duration: 25 },
  { id: 5, name: "Fade Skin", price: 160, duration: 55 },
  { id: 6, name: "Corte Niño", price: 90, duration: 25 },
]

const colorPresets = ["#d4a843", "#3b82f6", "#22c55e", "#ef4444", "#a855f7", "#f97316"]

export default function ConfiguracionPage() {
  const [activeSection, setActiveSection] = useState("general")
  const [primaryColor, setPrimaryColor] = useState("#d4a843")
  const [notifs, setNotifs] = useState({ whatsapp: true, sms: false, email: true, internal: true })

  return (
    <main className="flex-1 overflow-hidden flex gap-4 p-6">
      {/* Sidebar nav */}
      <div className="w-56 shrink-0">
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {sections.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              className={cn("w-full flex items-center justify-between px-4 py-3 text-sm border-b border-border last:border-0 transition-all",
                activeSection === s.id ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}>
              <div className="flex items-center gap-2.5">
                <s.icon className="w-4 h-4 shrink-0" />
                {s.label}
              </div>
              <ChevronRight className="w-3 h-3" />
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeSection === "general" && (
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-sm font-semibold text-foreground mb-4">Información de la barbería</p>
              <div className="space-y-4">
                {[
                  { label: "Nombre del negocio", value: "Barbería El Rey", type: "text" },
                  { label: "Teléfono de contacto", value: "+52 55 1234 5678", type: "tel" },
                  { label: "Correo electrónico", value: "elrey@trimly.mx", type: "email" },
                  { label: "Dirección", value: "Av. Reforma 123, CDMX", type: "text" },
                  { label: "Descripción", value: "Barbería premium especializada en cortes modernos", type: "textarea" },
                ].map(f => (
                  <div key={f.label}>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{f.label}</label>
                    {f.type === "textarea" ? (
                      <textarea defaultValue={f.value} rows={3}
                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
                    ) : (
                      <input type={f.type} defaultValue={f.value}
                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                    )}
                  </div>
                ))}
                <button className="bg-primary text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors">
                  Guardar cambios
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSection === "apariencia" && (
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-sm font-semibold text-foreground mb-4">Color principal</p>
              <p className="text-xs text-muted-foreground mb-3">Este color se aplicará en el portal de reservas de tus clientes</p>
              <div className="flex items-center gap-3 flex-wrap">
                {colorPresets.map(c => (
                  <button key={c} onClick={() => setPrimaryColor(c)}
                    className="w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center"
                    style={{ background: c, borderColor: primaryColor === c ? c : "transparent" }}>
                    {primaryColor === c && <Check className="w-4 h-4 text-white" />}
                  </button>
                ))}
                <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded-full border border-border cursor-pointer bg-transparent" />
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-sm font-semibold text-foreground mb-4">Logotipo</p>
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Store className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">Subir logotipo</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG hasta 2MB · Recomendado 200×200px</p>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-sm font-semibold text-foreground mb-3">Vista previa del portal de clientes</p>
              <div className="bg-[#0a0a0b] rounded-xl p-4 border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: primaryColor }}>
                    <Store className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Barbería El Rey</p>
                    <p className="text-[10px] text-gray-400">Reserva tu cita</p>
                  </div>
                </div>
                <button className="w-full py-2.5 rounded-lg text-sm font-bold text-white transition-all" style={{ background: primaryColor }}>
                  Reservar ahora
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSection === "horarios" && (
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-sm font-semibold text-foreground mb-4">Horarios de apertura</p>
            <div className="space-y-3">
              {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map((day, i) => {
                const isOpen = i < 6
                return (
                  <div key={day} className="flex items-center gap-4 py-2 border-b border-border last:border-0">
                    <div className="w-28">
                      <p className="text-sm font-medium text-foreground">{day}</p>
                    </div>
                    <div className={cn("flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full",
                      isOpen ? "bg-emerald-400/10 text-emerald-400" : "bg-border text-muted-foreground"
                    )}>
                      <div className="w-1.5 h-1.5 rounded-full bg-current" />
                      {isOpen ? "Abierto" : "Cerrado"}
                    </div>
                    {isOpen && (
                      <div className="flex items-center gap-2 ml-auto">
                        <input type="time" defaultValue="09:00" className="bg-secondary border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                        <span className="text-xs text-muted-foreground">—</span>
                        <input type="time" defaultValue={i === 5 ? "18:00" : "20:00"} className="bg-secondary border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <button className="mt-4 bg-primary text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors">
              Guardar horarios
            </button>
          </div>
        )}

        {activeSection === "notificaciones" && (
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-sm font-semibold text-foreground mb-1">Canales de notificación</p>
            <p className="text-xs text-muted-foreground mb-5">Selecciona cómo se notificará a tus clientes sobre sus citas</p>
            <div className="space-y-3">
              {(["whatsapp", "sms", "email", "internal"] as const).map(ch => {
                const config = {
                  whatsapp: { label: "WhatsApp", desc: "Recordatorios y confirmaciones vía WhatsApp", color: "#22c55e" },
                  sms: { label: "SMS", desc: "Mensajes de texto al número registrado", color: "#3b82f6" },
                  email: { label: "Correo electrónico", desc: "Confirmaciones y recordatorios por email", color: "#d4a843" },
                  internal: { label: "Notificaciones internas", desc: "Dentro del sistema para el equipo", color: "#a855f7" },
                }[ch]
                return (
                  <div key={ch} className={cn("flex items-center justify-between p-4 rounded-xl border transition-all",
                    notifs[ch] ? "border-border bg-secondary" : "border-border/50 bg-card"
                  )}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${config.color}20` }}>
                        <div className="w-3 h-3 rounded-full" style={{ background: config.color }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{config.label}</p>
                        <p className="text-xs text-muted-foreground">{config.desc}</p>
                      </div>
                    </div>
                    <button onClick={() => setNotifs(n => ({ ...n, [ch]: !n[ch] }))}
                      className={cn("relative w-11 h-6 rounded-full border transition-all",
                        notifs[ch] ? "bg-primary border-primary" : "bg-secondary border-border"
                      )}>
                      <div className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all",
                        notifs[ch] ? "left-5" : "left-0.5"
                      )} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeSection === "precios" && (
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-foreground">Catálogo de servicios</p>
              <button className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors font-semibold">
                + Agregar servicio
              </button>
            </div>
            <div className="space-y-2">
              {services.map(s => (
                <div key={s.id} className="flex items-center gap-4 p-3.5 bg-secondary rounded-xl border border-border hover:border-border/80 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Store className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground flex-1">{s.name}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground bg-card border border-border px-2.5 py-1 rounded-lg">{s.duration} min</span>
                    <input type="text" defaultValue={`$${s.price}`}
                      className="w-20 bg-card border border-border rounded-lg px-2.5 py-1 text-sm font-semibold text-foreground text-center focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(activeSection === "seguridad") && (
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-sm font-semibold text-foreground mb-4">Seguridad de la cuenta</p>
            <div className="space-y-4">
              {[
                { label: "Contraseña actual", placeholder: "••••••••" },
                { label: "Nueva contraseña", placeholder: "Mínimo 8 caracteres" },
                { label: "Confirmar nueva contraseña", placeholder: "Repite la contraseña" },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{f.label}</label>
                  <input type="password" placeholder={f.placeholder}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
              ))}
              <button className="bg-primary text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors">
                Actualizar contraseña
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
