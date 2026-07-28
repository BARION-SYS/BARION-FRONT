import { Building2 } from "lucide-react"
import type { RutaApp, SeccionRuta } from "@routes/types/routes.types"

/**
 * Navegación del staff de Barion — la misma aplicación, otra área.
 *
 * Entra por la misma puerta que todo el mundo (`/`) y el sistema lo trae aquí
 * porque su sesión no pertenece a ninguna barbería. No hay subdominio ni
 * despliegue aparte: es el mismo panel con otras rutas.
 *
 * Es deliberadamente corta. Este actor hace dos cosas —dar de alta barberías y
 * cobrarles— y todo lo demás lo hace el propietario dentro de la suya.
 */
export const rutasAdmin: RutaApp[] = [
  {
    clave: "admin",
    permisos: ["plataforma.barberias.ver"],
    seccion: "principal",
    href: "/admin",
    etiqueta: "Barberías",
    titulo: "Barberías",
    subtitulo: "Alta, estado y plan de cada cliente",
    icono: Building2,
    entrada: "zoom",
  },
]

/**
 * Se reutilizan las secciones del panel en vez de inventar otras: son rótulos
 * de agrupación, y un área con una sola entrada no necesita vocabulario propio.
 */
export const seccionesAdmin: { id: SeccionRuta; etiqueta: string }[] = [
  { id: "principal", etiqueta: "Plataforma" },
]
