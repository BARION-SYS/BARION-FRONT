"use client"

import { useState } from "react"
import { Download, Share2, Copy, Check, Smartphone, QrCode, Users, Link, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

export default function QrPage() {
  const [copied, setCopied] = useState(false)
  const link = "https://trimly.mx/b/el-rey-barber"

  const handleCopy = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const recentScans = [
    { name: "Samuel López", time: "Hace 5 min", action: "Reservó cita" },
    { name: "Diego Martínez", time: "Hace 22 min", action: "Se registró" },
    { name: "Mario Vega", time: "Hace 1 hora", action: "Consultó horarios" },
    { name: "Oscar Torres", time: "Hace 2 horas", action: "Reservó cita" },
    { name: "Pablo Núñez", time: "Ayer", action: "Se registró" },
  ]

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Escaneos hoy", value: "14", icon: QrCode, color: "text-primary" },
            { label: "Registros hoy", value: "8", icon: Users, color: "text-blue-400" },
            { label: "Citas desde QR", value: "5", icon: Link, color: "text-emerald-400" },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <s.icon className={cn("w-5 h-5", s.color)} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* QR Card */}
          <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center">
            <div className="mb-4 text-center">
              <p className="text-sm font-semibold text-foreground">Código QR de la Barbería</p>
              <p className="text-xs text-muted-foreground mt-0.5">Muéstralo en tu local o compártelo digitalmente</p>
            </div>

            {/* QR Visual */}
            <div className="relative p-5 bg-white rounded-2xl mb-5 shadow-lg">
              <svg width="160" height="160" viewBox="0 0 160 160" className="block">
                {/* QR pattern simulation */}
                {[0,1,2,3,4,5,6].map(row =>
                  [0,1,2,3,4,5,6].map(col => {
                    const isCorner = (row < 3 && col < 3) || (row < 3 && col > 3) || (row > 3 && col < 3)
                    const seed = (row * 7 + col * 3 + row + col) % 2
                    return isCorner || seed === 0 ? (
                      <rect key={`${row}-${col}`} x={col * 20 + 20} y={row * 20 + 20} width="16" height="16" rx="2" fill="#0a0a0b" />
                    ) : null
                  })
                )}
                {/* Corner squares */}
                <rect x="20" y="20" width="56" height="56" rx="6" fill="none" stroke="#0a0a0b" strokeWidth="5" />
                <rect x="84" y="20" width="56" height="56" rx="6" fill="none" stroke="#0a0a0b" strokeWidth="5" />
                <rect x="20" y="84" width="56" height="56" rx="6" fill="none" stroke="#0a0a0b" strokeWidth="5" />
                <rect x="36" y="36" width="24" height="24" rx="3" fill="#0a0a0b" />
                <rect x="100" y="36" width="24" height="24" rx="3" fill="#0a0a0b" />
                <rect x="36" y="100" width="24" height="24" rx="3" fill="#0a0a0b" />
                {/* Data modules */}
                {Array.from({ length: 36 }, (_, i) => {
                  const row = Math.floor(i / 6)
                  const col = i % 6
                  if ((row + col) % 2 === 0) return (
                    <rect key={`data-${i}`} x={84 + col * 10 + 2} y={84 + row * 10 + 2} width="8" height="8" rx="1" fill="#0a0a0b" />
                  )
                  return null
                })}
                {/* Center logo */}
                <rect x="65" y="65" width="30" height="30" rx="6" fill="#d4a843" />
                <text x="80" y="85" textAnchor="middle" fontSize="14" fill="white" fontWeight="bold">T</text>
              </svg>
            </div>

            <p className="text-xs font-medium text-foreground mb-1">Barbería El Rey</p>
            <p className="text-[11px] text-muted-foreground mb-5 truncate max-w-full">{link}</p>

            {/* Actions */}
            <div className="grid grid-cols-3 gap-2 w-full">
              <button className="flex flex-col items-center gap-1.5 p-3 bg-secondary border border-border rounded-xl hover:border-border/80 transition-all text-muted-foreground hover:text-foreground">
                <Download className="w-4 h-4" />
                <span className="text-[10px]">Descargar</span>
              </button>
              <button className="flex flex-col items-center gap-1.5 p-3 bg-secondary border border-border rounded-xl hover:border-border/80 transition-all text-muted-foreground hover:text-foreground">
                <Share2 className="w-4 h-4" />
                <span className="text-[10px]">Compartir</span>
              </button>
              <button onClick={handleCopy} className={cn("flex flex-col items-center gap-1.5 p-3 border rounded-xl transition-all",
                copied ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-400" : "bg-secondary border-border text-muted-foreground hover:text-foreground"
              )}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span className="text-[10px]">{copied ? "Copiado" : "Copiar"}</span>
              </button>
            </div>
          </div>

          {/* Right side */}
          <div className="space-y-4">
            {/* Link */}
            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-sm font-semibold text-foreground mb-3">Enlace de reserva</p>
              <div className="flex items-center gap-2 bg-secondary border border-border rounded-lg px-3 py-2.5">
                <Link className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground flex-1 truncate">{link}</p>
                <button onClick={handleCopy} className="text-primary text-xs font-semibold hover:text-primary/80 transition-colors shrink-0">
                  Copiar
                </button>
              </div>
              <button className="mt-3 flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <RefreshCw className="w-3 h-3" /> Generar nuevo enlace
              </button>
            </div>

            {/* What the QR does */}
            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-sm font-semibold text-foreground mb-3">Al escanear el QR el cliente puede</p>
              <div className="space-y-2">
                {[
                  "Registrarse con nombre y teléfono",
                  "Elegir su barbero favorito",
                  "Ver horarios disponibles en tiempo real",
                  "Reservar una cita en segundos",
                  "Confirmar su asistencia con 1 clic",
                  "Ver promociones activas",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-muted-foreground">
                    <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <span className="text-[8px] font-bold text-primary">{i + 1}</span>
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Recent scans */}
            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-sm font-semibold text-foreground mb-3">Escaneos recientes</p>
              <div className="space-y-2">
                {recentScans.map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                      {s.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{s.name}</p>
                      <p className="text-[10px] text-muted-foreground">{s.action}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground shrink-0">{s.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
