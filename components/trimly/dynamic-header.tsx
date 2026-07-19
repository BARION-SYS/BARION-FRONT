"use client"

import { usePathname } from "next/navigation"
import { Header } from "./header"

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Resumen general de tu barbería" },
  "/dashboard/citas": { title: "Citas", subtitle: "Gestión de citas y calendario" },
  "/dashboard/barberos": { title: "Barberos", subtitle: "Equipo de trabajo y rendimiento" },
  "/dashboard/clientes": { title: "Clientes", subtitle: "Base de clientes y fidelización" },
  "/dashboard/nomina": { title: "Nómina", subtitle: "Comisiones, propinas y producción" },
  "/dashboard/estadisticas": { title: "Estadísticas", subtitle: "Análisis y métricas de negocio" },
  "/dashboard/qr": { title: "Código QR", subtitle: "Registro y acceso de clientes" },
  "/dashboard/configuracion": { title: "Configuración", subtitle: "Personalización de tu barbería" },
}

export function DynamicHeader() {
  const pathname = usePathname()
  const page = pageTitles[pathname] ?? { title: "Trimly", subtitle: "" }
  return <Header title={page.title} subtitle={page.subtitle} />
}
