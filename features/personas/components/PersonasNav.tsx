"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@shared/components/ui/tabs"
import { puede } from "@features/auth/utils/permisos"
import { useAuthStore } from "@store/auth.store"

/**
 * Una sola sección para las personas de la barbería, con tres vistas.
 *
 * Equipo y Barberos eran dos entradas del menú porque son dos tablas; para quien
 * usa el panel es la misma pregunta —¿quién trabaja aquí?— y tener que adivinar
 * en cuál de las dos está alguien es enseñarle el modelo de datos.
 *
 * Cada pestaña es una ruta y no un estado local: así el enlace se puede compartir,
 * el botón de atrás funciona y cada pantalla conserva su propio padre.
 */
const PESTANAS = [
  { href: "/dashboard/personas", etiqueta: "Acceso", permiso: "equipo.ver" },
  { href: "/dashboard/personas/barberos", etiqueta: "Atienden", permiso: "barberos.ver" },
  { href: "/dashboard/personas/roles", etiqueta: "Roles", permiso: "roles.ver" },
]

export function PersonasNav() {
  const pathname = usePathname()
  const sesion = useAuthStore((estado) => estado.sesion)

  const visibles = PESTANAS.filter((pestana) => puede(sesion, pestana.permiso))

  // La más larga que encaje: "/dashboard/personas" es prefijo de las otras dos y
  // marcaría Acceso estando en cualquiera.
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
            {pestana.etiqueta}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
