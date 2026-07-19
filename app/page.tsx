"use client"

import { useState } from "react"
import Link from "next/link"
import { Scissors, Eye, EyeOff, ArrowRight, QrCode, BarChart3, CalendarDays, Users } from "lucide-react"

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false)

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-card border-r border-border overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 pointer-events-none opacity-5">
          {Array.from({ length: 8 }, (_, r) =>
            Array.from({ length: 8 }, (_, c) => (
              <div key={`${r}-${c}`} className="absolute w-px h-full bg-foreground"
                style={{ left: `${(c + 1) * 12.5}%` }} />
            ))
          )}
        </div>

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Scissors className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground tracking-wide">TRIMLY</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Barbershop OS</p>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground leading-tight text-balance">
              El ecosistema digital<br />
              <span className="text-primary">completo</span> para tu<br />
              barbería moderna.
            </h1>
            <p className="text-muted-foreground mt-4 text-sm leading-relaxed max-w-sm">
              Gestiona citas, barberos, nómina y clientes desde una sola plataforma. Simple, rápido y premium.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: CalendarDays, label: "Citas inteligentes", desc: "Agenda, reagenda y confirma" },
              { icon: Users, label: "Gestión de clientes", desc: "Historial y fidelización" },
              { icon: BarChart3, label: "Estadísticas en tiempo real", desc: "KPIs y métricas clave" },
              { icon: QrCode, label: "Registro por QR", desc: "Clientes sin fricción" },
            ].map(f => (
              <div key={f.label} className="flex items-start gap-2.5 p-3.5 bg-secondary/50 rounded-xl border border-border">
                <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                  <f.icon className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">{f.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats footer */}
        <div className="flex items-center gap-6 relative z-10">
          {[
            { value: "2,400+", label: "Barberías activas" },
            { value: "48k+", label: "Citas/semana" },
            { value: "99.9%", label: "Uptime" },
          ].map(s => (
            <div key={s.label}>
              <p className="text-lg font-bold text-primary">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right — Login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Scissors className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-base font-bold text-foreground">TRIMLY</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Bienvenido de vuelta</h2>
            <p className="text-sm text-muted-foreground mt-1.5">Ingresa a tu panel de barbería</p>
          </div>

          <form className="space-y-4" onSubmit={e => e.preventDefault()}>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Correo electrónico</label>
              <input
                type="email"
                defaultValue="admin@elrey.mx"
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="tu@barberia.mx"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Contraseña</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  defaultValue="••••••••"
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary pr-11 transition-all"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded border-border accent-primary" />
                Recordarme
              </label>
              <button type="button" className="text-primary hover:text-primary/80 transition-colors">
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <Link href="/dashboard"
              className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl transition-all text-sm mt-2">
              Iniciar sesión <ArrowRight className="w-4 h-4" />
            </Link>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            ¿No tienes cuenta?{" "}
            <button className="text-primary hover:text-primary/80 font-medium transition-colors">
              Registra tu barbería gratis
            </button>
          </p>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-[11px] text-muted-foreground">Demo: accede directamente sin credenciales</p>
            <Link href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium mt-1.5 transition-colors">
              Ir al dashboard de demo <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
