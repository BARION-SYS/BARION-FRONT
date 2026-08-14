"use client"

import Image from "next/image"
import { useTheme } from "next-themes"
import { cn } from "@shared/utils/cn"
import { useMontado } from "@shared/hooks/useMontado"

// width/height = dimensiones reales del asset (ratio correcto, sin CLS);
// el tamaño en pantalla lo controla la clase del consumidor.
const fuentes = {
  completo: {
    light: "/barion-logo-light.webp",
    dark: "/barion-logo-dark.webp",
    width: 941,
    height: 231,
  },
  icono: {
    light: "/barion-icon-light.webp",
    dark: "/barion-icon-dark.webp",
    width: 200,
    height: 244,
  },
} as const

interface LogoBarionProps {
  variante?: keyof typeof fuentes
  className?: string
  /**
   * Carga la imagen con prioridad y la precarga en la cabecera.
   *
   * **Se pasa donde el logo es lo más grande que hay sobre la línea de
   * flotación**, que es el caso de las pantallas de acceso y de alta: son
   * páginas casi vacías, así que el logo acaba siendo el elemento que decide el
   * LCP. Sin esto, el navegador lo descarga con prioridad baja y Next avisa por
   * consola en cada carga.
   *
   * **No se pone en todas**: precargar tiene coste y en el panel el logo de la
   * barra lateral es un detalle pequeño junto a una pantalla llena de contenido;
   * marcarlo ahí robaría prioridad a lo que de verdad se está esperando.
   */
  priority?: boolean
}

// Logo de marca según el tema activo — única fuente del asset en la UI.
export function LogoBarion({ variante = "completo", className, priority }: LogoBarionProps) {
  const { resolvedTheme } = useTheme()
  const montado = useMontado()

  const fuente = fuentes[variante]
  const src = montado && resolvedTheme === "light" ? fuente.light : fuente.dark

  return (
    <Image
      src={src}
      alt="Barion"
      width={fuente.width}
      height={fuente.height}
      priority={priority}
      className={cn("w-auto", className)}
    />
  )
}
