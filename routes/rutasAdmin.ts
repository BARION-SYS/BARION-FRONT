import { Building2, CreditCard, LayoutDashboard, Tags } from "lucide-react"
import type { RutaApp, SeccionRuta } from "@routes/types/routes.types"

/**
 * Navegación del staff de Barion — la misma aplicación, otra área.
 *
 * Entra por la misma puerta que todo el mundo (`/`) y el sistema lo trae aquí
 * porque su sesión no pertenece a ninguna barbería. No hay subdominio ni
 * despliegue aparte: es el mismo panel con otras rutas.
 *
 * Sigue siendo corta, y lo será mientras la API lo sea: este actor mira cómo va
 * el negocio (resumen), administra el inventario de clientes (barberías),
 * mantiene lo que se les vende (planes) y corrige lo que se les cobra
 * (suscripciones). Lo demás pasa dentro de cada barbería, y Barion no entra ahí
 * — sin `app.barberia_id` la base no le entrega ni una cita, por mucho poder que
 * tenga en la aplicación.
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
    // El catálogo dejó de ser una lectura del público y pasó a ser su
    // administración (`/plataforma/planes`), que tiene UNA sola capacidad para
    // leer y para escribir: quien no puede cambiarlo tampoco lo consulta.
    clave: "admin-planes",
    permisos: ["plataforma.planes.gestionar"],
    seccion: "principal",
    href: "/admin/planes",
    etiqueta: "Planes",
    titulo: "Planes",
    subtitulo: "Qué se vende: límites, funciones y precio por país",
    icono: Tags,
    entrada: "izquierda",
  },
  {
    // Aparte de las barberías a propósito: allí se decide si una opera y aquí
    // se corrige lo que se le cobra. Son dos decisiones distintas, con dos
    // capacidades distintas.
    clave: "admin-suscripciones",
    permisos: ["plataforma.suscripciones.gestionar"],
    seccion: "principal",
    href: "/admin/suscripciones",
    etiqueta: "Suscripciones",
    titulo: "Suscripciones",
    subtitulo: "Qué tiene contratado cada barbería y hasta cuándo le vale",
    icono: CreditCard,
    entrada: "derecha",
  },
]

/**
 * Se reutilizan las secciones del panel en vez de inventar otras: son rótulos
 * de agrupación, y un área de tres entradas no necesita vocabulario propio.
 */
export const seccionesAdmin: { id: SeccionRuta; etiqueta: string }[] = [
  { id: "principal", etiqueta: "Plataforma" },
]
