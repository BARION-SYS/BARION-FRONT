"use client"

import { usePathname } from "next/navigation"
import { TransicionVista } from "@shared/components/transitions/TransicionVista"
import { obtenerRutaActiva } from "@routes/rutasDashboard"

// template (no layout): Next lo re-monta en CADA navegación dentro del dashboard,
// disparando la entrada declarada por la ruta activa (campo `entrada` en routes/).
export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const entrada = obtenerRutaActiva(pathname)?.entrada

  return <TransicionVista entrada={entrada}>{children}</TransicionVista>
}
