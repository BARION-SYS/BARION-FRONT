"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@shared/components/ui/tabs"
import { puede } from "@features/auth/utils/permisos"
import { useAuthStore } from "@store/auth.store"
import { useTextos } from "@shared/textos/useTextos"

/**
 * Dos vistas, y solo dos: las personas, y el reparto de capacidades.
 *
 * Hubo una tercera —«Acceso» y «Atienden» eran pestañas distintas— y era el
 * modelo de datos hecho interfaz: `membresias` y `barberos` son dos tablas, la
 * misma persona salía en las dos, y había que adivinar en cuál de ellas buscar a
 * alguien. Ahora es una sola lista de personas con dos atributos.
 *
 * **Roles se queda aparte a propósito**: no es gente, es qué puede hacer cada
 * papel. Meterlo en la misma lista sería mezclar quién trabaja aquí con cómo se
 * reparten las capacidades, que son dos preguntas de días distintos.
 *
 * Cada pestaña es una ruta y no un estado local: así el enlace se puede
 * compartir, el botón de atrás funciona y cada pantalla conserva su propio padre.
 */
/**
 * Las dos pestañas, con la CLAVE de su nombre en vez del nombre.
 *
 * La lista y su orden son estructura; el texto sale del catálogo dentro del
 * componente. A nivel de módulo no alcanza ningún hook.
 */
const PESTANAS = [
  { href: "/dashboard/personas", clave: "personas", permiso: "equipo.ver" },
  { href: "/dashboard/personas/roles", clave: "roles", permiso: "roles.ver" },
] as const

export function PersonasNav() {
  const t = useTextos("personas.nav")
  const pathname = usePathname()
  const sesion = useAuthStore((estado) => estado.sesion)

  const visibles = PESTANAS.filter((pestana) => puede(sesion, pestana.permiso))

  // La más larga que encaje: "/dashboard/personas" es prefijo de la otra y
  // marcaría Personas estando en Roles.
  const activa = visibles
    .filter((pestana) => pathname === pestana.href || pathname.startsWith(`${pestana.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]

  if (visibles.length < 2) return null

  return (
    <Tabs value={activa?.href ?? visibles[0].href}>
      <TabsList>
        {visibles.map((pestana) => (
          <TabsTrigger
            key={pestana.href}
            value={pestana.href}
            render={<Link href={pestana.href} />}
          >
            {t(pestana.clave)}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
