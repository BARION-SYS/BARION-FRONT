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
import { rutasAdmin, seccionesAdmin } from "@routes/rutasAdmin"

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
    entrada: "zoom",
  },
  {
    clave: "citas",
    seccion: "operacion",
    href: "/dashboard/citas",
    etiqueta: "Citas",
    titulo: "Citas",
    subtitulo: "Gestión de citas y calendario",
    icono: CalendarDays,
    entrada: "subir",
  },
  {
    clave: "barberos",
    seccion: "operacion",
    href: "/dashboard/barberos",
    etiqueta: "Barberos",
    titulo: "Barberos",
    subtitulo: "Equipo de trabajo y rendimiento",
    icono: Scissors,
    entrada: "izquierda",
  },
  {
    clave: "clientes",
    seccion: "operacion",
    href: "/dashboard/clientes",
    etiqueta: "Clientes",
    titulo: "Clientes",
    subtitulo: "Base de clientes y fidelización",
    icono: Users,
    entrada: "derecha",
  },
  {
    clave: "nomina",
    seccion: "finanzas",
    href: "/dashboard/nomina",
    etiqueta: "Nómina",
    titulo: "Nómina",
    subtitulo: "Comisiones, propinas y producción",
    icono: DollarSign,
    entrada: "bajar",
  },
  {
    clave: "estadisticas",
    seccion: "finanzas",
    href: "/dashboard/estadisticas",
    etiqueta: "Estadísticas",
    titulo: "Estadísticas",
    subtitulo: "Análisis y métricas de negocio",
    icono: BarChart3,
    entrada: "zoom",
  },
  {
    clave: "qr",
    seccion: "herramientas",
    href: "/dashboard/qr",
    etiqueta: "Código QR",
    titulo: "Código QR",
    subtitulo: "Registro y acceso de clientes",
    icono: QrCode,
    entrada: "fundido",
  },
  {
    clave: "configuracion",
    seccion: "herramientas",
    href: "/dashboard/configuracion",
    etiqueta: "Configuración",
    titulo: "Configuración",
    subtitulo: "Personalización de tu barbería",
    icono: Settings,
    entrada: "izquierda",
  },
]

export function esRutaActiva(ruta: RutaApp, pathname: string): boolean {
  // Las dos raíces de área coinciden EXACTO: si no, cualquier subruta activaría
  // también la entrada de inicio y el sidebar marcaría dos a la vez.
  if (ruta.href === "/dashboard" || ruta.href === "/admin") {
    return pathname === ruta.href
  }
  return pathname === ruta.href || pathname.startsWith(`${ruta.href}/`)
}

/**
 * Las rutas del ÁREA en la que se está.
 *
 * El staff de Barion vive en la misma aplicación y entra por la misma puerta;
 * lo único que cambia es qué navegación le corresponde. Resolverlo por la
 * dirección —y no pasándoselo al chrome por props— evita tener que tocar el
 * sidebar cada vez que aparezca un área nueva.
 */
export function rutasDe(pathname: string): RutaApp[] {
  return pathname.startsWith("/admin") ? rutasAdmin : rutasDashboard
}

export function seccionesDe(pathname: string): { id: SeccionRuta; etiqueta: string }[] {
  return pathname.startsWith("/admin") ? seccionesAdmin : seccionesSidebar
}

export function obtenerRutaActiva(pathname: string): RutaApp | undefined {
  return rutasDe(pathname).find((ruta) => esRutaActiva(ruta, pathname))
}

// Etiquetas y orden de las secciones del sidebar.
export const seccionesSidebar: { id: SeccionRuta; etiqueta: string }[] = [
  { id: "principal", etiqueta: "Principal" },
  { id: "operacion", etiqueta: "Operación" },
  { id: "finanzas", etiqueta: "Finanzas" },
  { id: "herramientas", etiqueta: "Herramientas" },
]
