"use client"

import { usePathname } from "next/navigation"
import { TransicionVista } from "@shared/components/transitions/TransicionVista"
import { obtenerRutaActiva } from "@routes/rutasDashboard"

// Mismo mecanismo que el panel: `obtenerRutaActiva` ya resuelve contra el área
// que corresponde a la dirección, así que no hace falta nada propio.
export default function AdminTemplate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const entrada = obtenerRutaActiva(pathname)?.entrada

  return <TransicionVista entrada={entrada}>{children}</TransicionVista>
}
