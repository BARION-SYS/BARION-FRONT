import { Building2, LayoutDashboard, Tags } from "lucide-react"
import type { RutaApp, SeccionRuta } from "@routes/types/routes.types"

/**
 * Navegación del staff de Barion — la misma aplicación, otra área.
 *
 * Entra por la misma puerta que todo el mundo (`/`) y el sistema lo trae aquí
 * porque su sesión no pertenece a ninguna barbería. No hay subdominio ni
 * despliegue aparte: es el mismo panel con otras rutas.
 *
 * Sigue siendo corta, y lo será mientras la API lo sea: este actor mira cómo va
 * el negocio (resumen), administra el inventario de clientes (barberías) y
 * consulta lo que se les vende (planes). Lo demás pasa dentro de cada barbería,
 * y Barion no entra ahí — sin `app.barberia_id` la base no le entrega ni una
 * cita, por mucho poder que tenga en la aplicación.
 */
export const rutasAdmin: RutaApp[] = [
  {
    clave: "admin",
    permisos: ["plataforma.barberias.ver"],
    seccion: "principal",
    href: "/admin",
    etiqueta: "Resumen",
    titulo: "Resumen de la plataforma",
    subtitulo: "Cuántas barberías hay, en qué estado y dónde operan",
    icono: LayoutDashboard,
    entrada: "zoom",
  },
  {
    clave: "admin-barberias",
    permisos: ["plataforma.barberias.ver"],
    seccion: "principal",
    href: "/admin/barberias",
    etiqueta: "Barberías",
    titulo: "Barberías",
    subtitulo: "Alta, ficha, estado y plan de cada cliente",
    icono: Building2,
    entrada: "derecha",
  },
  {
    // Sin `permisos`: el catálogo es la ÚNICA lectura pública de la API y quien
    // está en esta área ya pasó la puerta. Pedir una capacidad aquí le
    // escondería los precios justo a quien tiene que dar de alta con ellos.
    clave: "admin-planes",
    seccion: "principal",
    href: "/admin/planes",
    etiqueta: "Planes",
    titulo: "Planes",
    subtitulo: "Qué se vende: límites, funciones y precio por país",
    icono: Tags,
    entrada: "izquierda",
  },
]

/**
 * Se reutilizan las secciones del panel en vez de inventar otras: son rótulos
 * de agrupación, y un área de tres entradas no necesita vocabulario propio.
 */
export const seccionesAdmin: { id: SeccionRuta; etiqueta: string }[] = [
  { id: "principal", etiqueta: "Plataforma" },
]
