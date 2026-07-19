import {
  BarChart3,
  CalendarDays,
  DollarSign,
  LayoutDashboard,
  QrCode,
  Scissors,
  Settings,
  Users,
} from "lucide-react"
import type { RutaApp, SeccionRuta } from "@routes/types/routes.types"

// Fuente única de navegación: la barra lateral y el encabezado se renderizan desde esta lista.
export const rutasDashboard: RutaApp[] = [
  {
    clave: "dashboard",
    seccion: "principal",
    href: "/dashboard",
    etiqueta: "Dashboard",
    titulo: "Dashboard",
    subtitulo: "Resumen general de tu barbería",
    icono: LayoutDashboard,
  },
  {
    clave: "citas",
    seccion: "operacion",
    href: "/dashboard/citas",
    etiqueta: "Citas",
    titulo: "Citas",
    subtitulo: "Gestión de citas y calendario",
    icono: CalendarDays,
  },
  {
    clave: "barberos",
    seccion: "operacion",
    href: "/dashboard/barberos",
    etiqueta: "Barberos",
    titulo: "Barberos",
    subtitulo: "Equipo de trabajo y rendimiento",
    icono: Scissors,
  },
  {
    clave: "clientes",
    seccion: "operacion",
    href: "/dashboard/clientes",
    etiqueta: "Clientes",
    titulo: "Clientes",
    subtitulo: "Base de clientes y fidelización",
    icono: Users,
  },
  {
    clave: "nomina",
    seccion: "finanzas",
    href: "/dashboard/nomina",
    etiqueta: "Nómina",
    titulo: "Nómina",
    subtitulo: "Comisiones, propinas y producción",
    icono: DollarSign,
  },
  {
    clave: "estadisticas",
    seccion: "finanzas",
    href: "/dashboard/estadisticas",
    etiqueta: "Estadísticas",
    titulo: "Estadísticas",
    subtitulo: "Análisis y métricas de negocio",
    icono: BarChart3,
  },
  {
    clave: "qr",
    seccion: "herramientas",
    href: "/dashboard/qr",
    etiqueta: "Código QR",
    titulo: "Código QR",
    subtitulo: "Registro y acceso de clientes",
    icono: QrCode,
  },
  {
    clave: "configuracion",
    seccion: "herramientas",
    href: "/dashboard/configuracion",
    etiqueta: "Configuración",
    titulo: "Configuración",
    subtitulo: "Personalización de tu barbería",
    icono: Settings,
  },
]

export function esRutaActiva(ruta: RutaApp, pathname: string): boolean {
  if (ruta.href === "/dashboard") return pathname === ruta.href
  return pathname === ruta.href || pathname.startsWith(`${ruta.href}/`)
}

export function obtenerRutaActiva(pathname: string): RutaApp | undefined {
  return rutasDashboard.find((ruta) => esRutaActiva(ruta, pathname))
}

// Etiquetas y orden de las secciones del sidebar.
export const seccionesSidebar: { id: SeccionRuta; etiqueta: string }[] = [
  { id: "principal", etiqueta: "Principal" },
  { id: "operacion", etiqueta: "Operación" },
  { id: "finanzas", etiqueta: "Finanzas" },
  { id: "herramientas", etiqueta: "Herramientas" },
]
