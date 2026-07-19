"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Scissors,
  DollarSign,
  BarChart3,
  Settings,
  QrCode,
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Store,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Citas", href: "/dashboard/citas", icon: CalendarDays },
  { label: "Barberos", href: "/dashboard/barberos", icon: Scissors },
  { label: "Clientes", href: "/dashboard/clientes", icon: Users },
  { label: "Nómina", href: "/dashboard/nomina", icon: DollarSign },
  { label: "Estadísticas", href: "/dashboard/estadisticas", icon: BarChart3 },
  { label: "Código QR", href: "/dashboard/qr", icon: QrCode },
  { label: "Configuración", href: "/dashboard/configuracion", icon: Settings },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen border-r border-border bg-card transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center gap-3 px-4 py-5 border-b border-border", collapsed && "justify-center px-0")}>
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Scissors className="w-4 h-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-bold text-foreground tracking-wide">TRIMLY</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Pro</p>
          </div>
        )}
      </div>

      {/* Barbershop info */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center">
              <Store className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground leading-none">Barbería El Rey</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Plan Premium</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150",
                collapsed && "justify-center px-0 py-3",
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn("shrink-0", collapsed ? "w-5 h-5" : "w-4 h-4")} />
              {!collapsed && <span>{item.label}</span>}
              {active && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className={cn("border-t border-border p-3 space-y-1", collapsed && "px-1")}>
        <button
          className={cn(
            "flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all",
            collapsed && "justify-center px-0"
          )}
          title={collapsed ? "Notificaciones" : undefined}
        >
          <Bell className={cn("shrink-0", collapsed ? "w-5 h-5" : "w-4 h-4")} />
          {!collapsed && <span>Notificaciones</span>}
          {!collapsed && (
            <span className="ml-auto bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              3
            </span>
          )}
        </button>
        <button
          className={cn(
            "flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all",
            collapsed && "justify-center px-0"
          )}
          title={collapsed ? "Cerrar sesión" : undefined}
        >
          <LogOut className={cn("shrink-0", collapsed ? "w-5 h-5" : "w-4 h-4")} />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 z-10 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  )
}
