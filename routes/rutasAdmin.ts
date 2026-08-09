import { Building2, CreditCard, Globe, LayoutDashboard, Tags, UserCog, Users } from "lucide-react"
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
  {
    // Dónde opera Barion y con qué impuesto factura allí. Va en «Plataforma» y
    // no en «Tu cuenta» porque es configuración del producto, no de quien mira.
    clave: "admin-mercados",
    permisos: ["plataforma.paises.gestionar"],
    seccion: "principal",
    href: "/admin/mercados",
    etiqueta: "Mercados",
    titulo: "Mercados",
    subtitulo: "Dónde se opera y con qué impuesto se factura",
    icono: Globe,
    entrada: "izquierda",
  },
  {
    // Quién trabaja en Barion. Va en «Tu cuenta» y no en «Plataforma» porque no
    // administra clientes: administra a los de casa.
    clave: "admin-staff",
    permisos: ["plataforma.staff.gestionar"],
    seccion: "herramientas",
    href: "/admin/staff",
    etiqueta: "Equipo de Barion",
    titulo: "Equipo de Barion",
    subtitulo: "Quién puede entrar a la plataforma y con qué correo",
    icono: Users,
    entrada: "izquierda",
  },
  {
    // SIN `permisos`, y a propósito: su propia cuenta la administra todo el
    // mundo. Declarar aquí una capacidad la convertiría en algo que a alguien
    // se le puede olvidar conceder, y el resultado sería una persona sin forma
    // de cambiar su contraseña.
    clave: "admin-cuenta",
    seccion: "herramientas",
    href: "/admin/cuenta",
    etiqueta: "Mi cuenta",
    titulo: "Mi cuenta",
    subtitulo: "Tu contraseña y con qué entras",
    icono: UserCog,
    entrada: "izquierda",
  },
]

/**
 * Se reutilizan las secciones del panel en vez de inventar otras: son rótulos
 * de agrupación, y un área pequeña no necesita vocabulario propio.
 */
export const seccionesAdmin: { id: SeccionRuta; etiqueta: string }[] = [
  { id: "principal", etiqueta: "Plataforma" },
  { id: "herramientas", etiqueta: "Tu cuenta" },
]
