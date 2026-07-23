"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useTheme } from "next-themes"
import { cn } from "@shared/utils/cn"

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
  priority?: boolean
}

// Logo de marca según el tema activo — única fuente del asset en la UI.
export function LogoBarion({ variante = "completo", className, priority }: LogoBarionProps) {
  const { resolvedTheme } = useTheme()
  const [montado, setMontado] = useState(false)
  useEffect(() => setMontado(true), [])

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
